import { NextRequest, NextResponse } from "next/server";

import { clearPkceCookie, exchangeTokenFromCallback, getPkceCookie } from "@/lib/oauth";
import { saveTokenForUser } from "@/lib/tokens";

export async function GET(req: NextRequest, { params }: { params: { vendor: string } }) {
	const vendor = params.vendor as "oura" | "fitbit" | "strava" | "garmin";
	const url = new URL(req.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state") || "/";
	const error = url.searchParams.get("error");

	if (error) return NextResponse.redirect(`${state}?error=${encodeURIComponent(error)}`);
	if (!code) return NextResponse.redirect(`${state}?error=missing_code`);

	// Lấy code_verifier từ cookie (nếu vendor dùng PKCE)
	const codeVerifier = getPkceCookie(req, vendor);

	try {
		const token = await exchangeTokenFromCallback(vendor, code, codeVerifier || undefined);
		// TODO: Lấy user hiện tại từ session JWT của bạn. Ở đây mock "userId=123".
		const userId = "123";
		await saveTokenForUser(userId, vendor, token);

		const res = NextResponse.redirect(state);
		// cleanup cookie
		clearPkceCookie(res, vendor);
		return res;
	} catch (e: any) {
		const res = NextResponse.redirect(`${state}?error=${encodeURIComponent(e?.message || "token_exchange_failed")}`);
		clearPkceCookie(res, vendor);
		return res;
	}
}
