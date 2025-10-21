import { createHash, randomBytes } from "crypto";

import { NextRequest, NextResponse } from "next/server";

// Cookie key cho PKCE
const PKCE_COOKIE_PREFIX = "pkce_";

// ===== PKCE helpers =====
function base64url(input: Buffer) {
	return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "-").replace(/=+$/, "");
}
export function generateCodeVerifier() {
	return base64url(randomBytes(32));
}
export function generateCodeChallenge(verifier: string) {
	return base64url(createHash("sha256").update(verifier).digest());
}

// ===== Config cho vendors =====
const conf = {
	oura: {
		authUrl: "https://cloud.ouraring.com/oauth/authorize",
		tokenUrl: "https://api.ouraring.com/oauth/token",
		clientId: process.env.OURA_CLIENT_ID!,
		clientSecret: process.env.OURA_CLIENT_SECRET!,
		redirectUri: process.env.OURA_REDIRECT_URI!, // e.g. https://localhost:3000/api/oauth/oura/callback
		scope: "email personal daily heartrate tag", // tuỳ nhu cầu
		usePKCE: true,
		tokenAuth: "body", // Oura cho phép client_secret trong body
	},
	fitbit: {
		authUrl: "https://www.fitbit.com/oauth2/authorize",
		tokenUrl: "https://api.fitbit.com/oauth2/token",
		clientId: process.env.FITBIT_CLIENT_ID!,
		clientSecret: process.env.FITBIT_CLIENT_SECRET!,
		redirectUri: process.env.FITBIT_REDIRECT_URI!,
		scope: "activity heartrate sleep", // tuỳ
		usePKCE: false, // thường dùng Basic Auth, không PKCE
		tokenAuth: "basic", // Authorization: Basic base64(client_id:client_secret)
	},
	strava: {
		authUrl: "https://www.strava.com/oauth/authorize",
		tokenUrl: "https://www.strava.com/oauth/token",
		clientId: process.env.STRAVA_CLIENT_ID!,
		clientSecret: process.env.STRAVA_CLIENT_SECRET!,
		redirectUri: process.env.STRAVA_REDIRECT_URI!,
		scope: "read,activity:read_all",
		usePKCE: false, // Strava tiêu chuẩn code exchange
		tokenAuth: "body",
	},
	garmin: {
		// Garmin Connect public không mở full-scope như các vendor trên (health API là chương trình đối tác).
		// Đặt placeholder để tránh 404, bạn hãy tích hợp khi có tài khoản đối tác Garmin.
		authUrl: "https://connect.garmin.com/oauthConfirm",
		tokenUrl: "https://connect.garmin.com/oauth/token",
		clientId: process.env.GARMIN_CLIENT_ID || "N/A",
		clientSecret: process.env.GARMIN_CLIENT_SECRET || "N/A",
		redirectUri: process.env.GARMIN_REDIRECT_URI || "http://localhost:3000/api/oauth/garmin/callback",
		scope: "read",
		usePKCE: false,
		tokenAuth: "body",
	},
} as const;

export type Vendor = keyof typeof conf;

export async function buildAuthUrl(vendor: Vendor, returnTo: string) {
	const c = conf[vendor];
	if (!c) throw new Error("Unsupported vendor");
	if (!c.clientId || !c.redirectUri) throw new Error(`Missing env for ${vendor}`);

	let extra = "";
	let codeVerifier: string | undefined;
	if (c.usePKCE) {
		codeVerifier = generateCodeVerifier();
		const challenge = generateCodeChallenge(codeVerifier);
		extra = `&code_challenge=${encodeURIComponent(challenge)}&code_challenge_method=S256`;
	}

	const url =
		`${c.authUrl}?client_id=${encodeURIComponent(c.clientId)}` +
		`&response_type=code` +
		`&redirect_uri=${encodeURIComponent(c.redirectUri)}` +
		`&scope=${encodeURIComponent(c.scope)}` +
		`&state=${encodeURIComponent(returnTo)}` +
		extra;

	return { url, codeVerifier };
}

// Lưu / lấy / xoá cookie PKCE
export function setPkceCookie(res: NextResponse, vendor: Vendor, verifier: string) {
	res.cookies.set({
		name: PKCE_COOKIE_PREFIX + vendor,
		value: verifier,
		httpOnly: true,
		path: "/",
		maxAge: 5 * 60, // 5 phút
		sameSite: "lax",
		secure: true,
	});
}

export function getPkceCookie(req: NextRequest, vendor: Vendor) {
	return req.cookies.get(PKCE_COOKIE_PREFIX + vendor)?.value || null;
}

export function clearPkceCookie(res: NextResponse, vendor: Vendor) {
	res.cookies.set({
		name: PKCE_COOKIE_PREFIX + vendor,
		value: "",
		path: "/",
		maxAge: 0,
	});
}

// Đổi code lấy token cho từng vendor
export async function exchangeTokenFromCallback(vendor: Vendor, code: string, codeVerifier?: string) {
	const c = conf[vendor];
	if (!c) throw new Error("Unsupported vendor");

	const body = new URLSearchParams();
	body.set("grant_type", "authorization_code");
	body.set("code", code);
	body.set("redirect_uri", c.redirectUri);
	body.set("client_id", c.clientId);
	if (c.tokenAuth === "body" && c.clientSecret) {
		body.set("client_secret", c.clientSecret);
	}
	if (c.usePKCE && codeVerifier) {
		body.set("code_verifier", codeVerifier);
	}

	const headers: Record<string, string> = {
		"Content-Type": "application/x-www-form-urlencoded",
	};
	if (c.tokenAuth === "basic") {
		const cred = Buffer.from(`${c.clientId}:${c.clientSecret}`).toString("base64");
		headers["Authorization"] = `Basic ${cred}`;
	}

	const resp = await fetch(c.tokenUrl, { method: "POST", headers, body });
	if (!resp.ok) {
		const txt = await resp.text();
		throw new Error(`Token exchange failed (${vendor}): ${resp.status} - ${txt}`);
	}
	const token = await resp.json();
	// Normalize tối thiểu
	return {
		vendor,
		access_token: token.access_token,
		refresh_token: token.refresh_token,
		expires_in: token.expires_in,
		token_type: token.token_type || "Bearer",
		scope: token.scope,
		raw: token,
	};
}
