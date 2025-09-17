import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

type GoCareTokenResp = { token?: string };
type GoCarePaged<T> = { page?: number; totalPage?: number; count?: number; data?: T[] };

export type GoCareProfile = {
	id?: number | string;
	userId?: number | string;
	username?: string;
	firstName?: string;
	middleName?: string;
	lastName?: string;
	birthday?: string;
	gender?: number | string;
	address?: string;
	phonePrefix?: string;
	phoneNumber?: string;
	email?: string | null;
};

export type HrRow = { heartValue?: number; timestamp?: number; [k: string]: any };
export type Spo2Row = { oxygenValue?: number; timestamp?: number; [k: string]: any };
export type SleepRow = { sleepTime?: number; wakeupTime?: number; sleLine?: string; [k: string]: any };
export type StepsRow = { stepValue?: number; sportValue?: number; timestamp?: number; [k: string]: any };

// ✅ luôn mặc định dùng proxy /gocare
let BASE = "/gocare";
let TENANT = "epr";
let PID = "2s7xdewkr416ok5";
let PSECRET = "DThNbchAsnGR9fuwH3RJBA==";
const DEFAULT_TOKEN_EXP = 86400;

const DEBUG = true;
function dlog(label: string, payload?: any) {
	if (!DEBUG) return;
	console.groupCollapsed(`%c[GoCare] ${label}`, "color:#0ea5e9");
	if (payload !== undefined) console.log(payload);
	console.groupEnd();
}

export function setGoCareCredentials(opts: {
	baseURL?: string;
	tenant?: string;
	partnerId?: string;
	partnerSecret?: string;
}) {
	// 👇 Browser thì ép dùng proxy để tránh CORS
	if (typeof window !== "undefined") {
		BASE = "/gocare";
	} else if (opts.baseURL) {
		// Cho phép override baseURL khi chạy server (SSR/build)
		BASE = opts.baseURL.trim();
	}

	if (opts.tenant) TENANT = opts.tenant.trim();
	if (opts.partnerId) PID = opts.partnerId;
	if (opts.partnerSecret) PSECRET = opts.partnerSecret;

	client = null;
	dlog("setGoCareCredentials", { BASE, TENANT, PID: "********", PSECRET: "********" });
}

const kStorageKey = {
	token: "gocare_partner_token",
	tokenExp: "gocare_partner_token_exp",
};

let client: AxiosInstance | null = null;
function getClient(): AxiosInstance {
	if (client) return client;
	client = axios.create({
		baseURL: BASE,
		headers: { Accept: "application/json" },
	});
	return client;
}

function nowSec() {
	return Math.floor(Date.now() / 1000);
}

let memToken: string | null = null;
let memTokenExp = 0;

function readStoredToken() {
	if (typeof window === "undefined") return { token: memToken, exp: memTokenExp };
	try {
		const t = localStorage.getItem(kStorageKey.token);
		const e = Number(localStorage.getItem(kStorageKey.tokenExp) || "0");
		return { token: t || null, exp: Number.isFinite(e) ? e : 0 };
	} catch {
		return { token: memToken, exp: memTokenExp };
	}
}

function writeStoredToken(token: string, expSecFromNow: number) {
	memToken = token;
	memTokenExp = nowSec() + expSecFromNow - 30;
	if (typeof window !== "undefined") {
		try {
			localStorage.setItem(kStorageKey.token, token);
			localStorage.setItem(kStorageKey.tokenExp, String(memTokenExp));
		} catch {}
	}
	dlog("writeStoredToken (mem only shows exp)", { exp: memTokenExp });
}

async function fetchPartnerToken(exp = DEFAULT_TOKEN_EXP): Promise<string | null> {
	const c = getClient();
	const form = new URLSearchParams();
	form.append("exp", String(exp));
	form.append("id", PID);
	form.append("secret", PSECRET);

	const { data } = await c.post<GoCareTokenResp>("/uaa/partner/token", form, {
		headers: { "X-TENANT": TENANT, "Content-Type": "application/x-www-form-urlencoded" },
	});
	const token = data?.token || null;
	dlog("fetchPartnerToken", { ok: !!token });
	if (token) writeStoredToken(token, exp);
	return token;
}

async function ensureToken(): Promise<string | null> {
	const s = readStoredToken();
	if (s.token && s.exp > nowSec()) return s.token;
	try {
		const t = await fetchPartnerToken();
		return t;
	} catch {
		return null;
	}
}

async function withAuth<T>(fn: (cfg: AxiosRequestConfig) => Promise<T>): Promise<T> {
	const token = await ensureToken();
	const baseHeaders = { "X-TENANT": TENANT } as Record<string, string>;
	const cfg: AxiosRequestConfig = {
		headers: token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders,
	};
	try {
		return await fn(cfg);
	} catch (err: any) {
		if (err?.response?.status === 401) {
			dlog("withAuth 401 → refresh token");
			const t = await fetchPartnerToken();
			const cfg2: AxiosRequestConfig = {
				headers: t ? { ...baseHeaders, Authorization: `Bearer ${t}` } : baseHeaders,
			};
			return await fn(cfg2);
		}
		throw err;
	}
}

export function get7DaysRange(): { startTime: number; endTime: number } {
	const endTime = Date.now();
	const startTime = endTime - 7 * 24 * 60 * 60 * 1000;
	return { startTime, endTime };
}

export async function getUserProfileByPhone(prefix: string, number: string): Promise<GoCareProfile | null> {
	const c = getClient();
	dlog("getUserProfileByPhone params", { prefix, number });
	const res = await withAuth((cfg) =>
		c.get<GoCareProfile>("/account/partner/user/phone", { ...cfg, params: { prefix, number } })
	);
	const out = (res as any)?.data ?? null;
	dlog("getUserProfileByPhone result", out);
	return out;
}

export async function getUserIdByPhone(number: string, prefix = "84"): Promise<string | number | null> {
	const p = await getUserProfileByPhone(prefix, number);
	const id = p?.userId ?? p?.id ?? null;
	dlog("getUserIdByPhone", { number, prefix, id });
	return id;
}

type MetricType = "hr" | "spo2" | "sleep" | "steps";
type MetricMap = {
	hr: HrRow;
	spo2: Spo2Row;
	sleep: SleepRow;
	steps: StepsRow;
};

export async function getMetricPage<T extends MetricType>(
	type: T,
	params: {
		startTime: number;
		endTime: number;
		userId: string | number;
		sortType?: "ASC" | "DESC";
		page?: number;
		size?: number;
	}
): Promise<GoCarePaged<MetricMap[T]>> {
	const c = getClient();
	const query = {
		startTime: params.startTime,
		endTime: params.endTime,
		userId: params.userId,
		sortType: params.sortType ?? "DESC",
		page: params.page ?? 1,
		size: params.size ?? 100,
	};
	dlog(`getMetricPage → /health/partner/${type} params`, query);

	const res = await withAuth((cfg) =>
		c.get<GoCarePaged<MetricMap[T]>>(`/health/partner/${type}`, { ...cfg, params: query })
	);

	const data = (res as any)?.data as GoCarePaged<MetricMap[T]>;
	const rows = data?.data ?? [];
	dlog(`getMetricPage ← ${type} result`, {
		page: data?.page,
		totalPage: data?.totalPage,
		count: data?.count ?? rows.length,
		sample: rows.slice(0, 3),
	});

	return {
		page: data?.page ?? 1,
		totalPage: data?.totalPage ?? 0,
		count: data?.count ?? rows.length ?? 0,
		data: rows,
	};
}

export async function getMetricAll<T extends MetricType>(
	type: T,
	params: { startTime: number; endTime: number; userId: string | number; size?: number }
): Promise<MetricMap[T][]> {
	const size = params.size ?? 200;
	let page = 1;
	let out: MetricMap[T][] = [];
	while (true) {
		const res = await getMetricPage(type, { ...params, page, size });
		out = out.concat(res.data ?? []);
		if (!res.totalPage || page >= res.totalPage) break;
		page += 1;
	}
	dlog(`getMetricAll total rows for ${type}`, { total: out.length });
	return out;
}

export async function getIotDataByType<T extends MetricType>(
	type: T,
	customStartTime?: number,
	customEndTime?: number,
	userId?: string | number
): Promise<MetricMap[T][]> {
	const { startTime, endTime } =
		customStartTime && customEndTime ? { startTime: customStartTime, endTime: customEndTime } : get7DaysRange();
	if (!userId) {
		dlog("getIotDataByType: missing userId → return []", { type });
		return [];
	}
	const rows = await getMetricAll(type, { startTime, endTime, userId });
	dlog("getIotDataByType done", { type, startTime, endTime, userId, total: rows.length, sample: rows.slice(0, 3) });
	return rows;
}

export async function getIotDataByPhone<T extends MetricType>(
	type: T,
	phoneNumber: string,
	customStartTime?: number,
	customEndTime?: number,
	prefix = "84"
): Promise<MetricMap[T][]> {
	const userId = await getUserIdByPhone(phoneNumber, prefix);
	if (!userId) {
		dlog("getIotDataByPhone: cannot resolve userId → []", { phoneNumber, prefix });
		return [];
	}
	return getIotDataByType(type, customStartTime, customEndTime, userId);
}
