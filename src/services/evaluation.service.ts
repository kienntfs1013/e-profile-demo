// src/services/evaluation.service.ts
import { api } from "@/lib/api/client";

type ListResponse<T> = { status: "success" | "error"; message?: string; data: T[] };
type MutateResponse<T = unknown> = { status: "success" | "error"; message?: string; data?: T };

export type TaekwondoPerformanceAssessmentDTO = {
	id: number;
	athlete_id: number;
	coach_id?: number;
	date?: string;
	score?: number | string;
	comment?: string;
	created_at?: string;
	updated_at?: string;
};
export type ShootingPerformanceAssessmentDTO = TaekwondoPerformanceAssessmentDTO;
export type BoxingPerformanceAssessmentDTO = TaekwondoPerformanceAssessmentDTO;
export type ArcheryPerformanceAssessmentDTO = TaekwondoPerformanceAssessmentDTO;

export type PagedListResponse<T> = {
	status?: "success" | "error";
	message?: string;
	data: T[];
	total?: number;
	page?: number;
	totalpage?: number;
};

function toQuery(filters?: Record<string, string | number | boolean | undefined>, orderby?: string) {
	const params = new URLSearchParams();
	if (filters)
		Object.entries(filters).forEach(([k, v]) => {
			if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
		});
	if (orderby) params.append("orderby", orderby);
	return params.toString();
}

function formatNow(): string {
	const d = new Date();
	const p = (n: number) => String(n).padStart(2, "0");
	const Y = d.getFullYear();
	const M = p(d.getMonth() + 1);
	const D = p(d.getDate());
	const h = p(d.getHours());
	const m = p(d.getMinutes());
	const s = p(d.getSeconds());
	return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

function normalizePayload<
	T extends { score?: number | string | null | undefined; created_at?: string; updated_at?: string },
>(payload: T): T {
	const body: any = { ...payload };
	if (body.score === "" || body.score === null) delete body.score;
	else if (typeof body.score === "string") {
		const n = Number(body.score);
		if (Number.isFinite(n)) body.score = n;
		else delete body.score;
	}
	Object.keys(body).forEach((k) => {
		if (body[k] === "") delete body[k];
	});
	if (!body.created_at) body.created_at = formatNow();
	if (!body.updated_at) body.updated_at = formatNow();
	return body;
}

function isOk(resp: any): boolean {
	const s = String(resp?.status ?? "").toLowerCase();
	return s === "success" || "data" in (resp ?? {}) || "id" in (resp ?? {});
}

function unwrap<T>(resp: any): T | null {
	return (resp && (resp.data as T)) ?? (resp as T) ?? null;
}

export async function listTaekwondoPerformanceAssessments(filters?: Record<string, any>, orderby?: string) {
	const qs = toQuery(filters, orderby);
	const { data } = await api.get<ListResponse<TaekwondoPerformanceAssessmentDTO>>(
		qs ? `/api/Taekwondo_Performance_Assessments?${qs}` : "/api/Taekwondo_Performance_Assessments"
	);
	if (data.status !== "success") throw new Error(data.message || "List Taekwondo performance assessments failed");
	return data.data;
}
export function listTaekwondoPerformanceAssessmentsByAthlete(athlete_id: number, orderby?: string) {
	return listTaekwondoPerformanceAssessments({ athlete_id }, orderby);
}

export async function listShootingPerformanceAssessments(filters?: Record<string, any>, orderby?: string) {
	const qs = toQuery(filters, orderby);
	const { data } = await api.get<ListResponse<ShootingPerformanceAssessmentDTO>>(
		qs ? `/api/Shooting_Performance_Assessments?${qs}` : "/api/Shooting_Performance_Assessments"
	);
	if (data.status !== "success") throw new Error(data.message || "List Shooting performance assessments failed");
	return data.data;
}
export function listShootingPerformanceAssessmentsByAthlete(athlete_id: number, orderby?: string) {
	return listShootingPerformanceAssessments({ athlete_id }, orderby);
}

export async function listBoxingPerformanceAssessments(filters?: Record<string, any>, orderby?: string) {
	const qs = toQuery(filters, orderby);
	const { data } = await api.get<ListResponse<BoxingPerformanceAssessmentDTO>>(
		qs ? `/api/Boxing_Performance_Assessments?${qs}` : "/api/Boxing_Performance_Assessments"
	);
	if (data.status !== "success") throw new Error(data.message || "List Boxing performance assessments failed");
	return data.data;
}
export function listBoxingPerformanceAssessmentsByAthlete(athlete_id: number, orderby?: string) {
	return listBoxingPerformanceAssessments({ athlete_id }, orderby);
}

export async function listArcheryPerformanceAssessments(filters?: Record<string, any>, orderby?: string) {
	const qs = toQuery(filters, orderby);
	const { data } = await api.get<ListResponse<ArcheryPerformanceAssessmentDTO>>(
		qs ? `/api/Archery_Performance_Assessments?${qs}` : "/api/Archery_Performance_Assessments"
	);
	if (data.status !== "success") throw new Error(data.message || "List Archery performance assessments failed");
	return data.data;
}
export function listArcheryPerformanceAssessmentsByAthlete(athlete_id: number, orderby?: string) {
	return listArcheryPerformanceAssessments({ athlete_id }, orderby);
}

async function listAssessmentPage<T>(
	endpoint:
		| "/api/Taekwondo_Performance_Assessments"
		| "/api/Shooting_Performance_Assessments"
		| "/api/Boxing_Performance_Assessments"
		| "/api/Archery_Performance_Assessments",
	page = 1,
	limit = 10,
	filters?: Record<string, string | number | boolean | undefined>,
	orderby?: string,
	signal?: AbortSignal
): Promise<PagedListResponse<T>> {
	const params = new URLSearchParams();
	params.set("page", String(page));
	params.set("limit", String(limit));
	if (orderby) params.set("orderby", orderby);
	if (filters)
		Object.entries(filters).forEach(([k, v]) => {
			if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
		});

	const url = `${endpoint}?${params.toString()}`;
	const { data } = await api.get<PagedListResponse<T>>(url, { signal });
	if (data?.status && data.status !== "success")
		throw new Error(data?.message || "List performance assessments failed");
	return { ...data, data: data.data ?? ([] as T[]) };
}

export function listTaekwondoPerformanceAssessmentsPageByAthlete(
	athlete_id: number,
	page = 1,
	limit = 10,
	orderby?: string,
	extra?: Record<string, any>,
	signal?: AbortSignal
) {
	return listAssessmentPage<TaekwondoPerformanceAssessmentDTO>(
		"/api/Taekwondo_Performance_Assessments",
		page,
		limit,
		{ athlete_id, ...extra },
		orderby,
		signal
	);
}
export function listShootingPerformanceAssessmentsPageByAthlete(
	athlete_id: number,
	page = 1,
	limit = 10,
	orderby?: string,
	extra?: Record<string, any>,
	signal?: AbortSignal
) {
	return listAssessmentPage<ShootingPerformanceAssessmentDTO>(
		"/api/Shooting_Performance_Assessments",
		page,
		limit,
		{ athlete_id, ...extra },
		orderby,
		signal
	);
}
export function listBoxingPerformanceAssessmentsPageByAthlete(
	athlete_id: number,
	page = 1,
	limit = 10,
	orderby?: string,
	extra?: Record<string, any>,
	signal?: AbortSignal
) {
	return listAssessmentPage<BoxingPerformanceAssessmentDTO>(
		"/api/Boxing_Performance_Assessments",
		page,
		limit,
		{ athlete_id, ...extra },
		orderby,
		signal
	);
}
export function listArcheryPerformanceAssessmentsPageByAthlete(
	athlete_id: number,
	page = 1,
	limit = 10,
	orderby?: string,
	extra?: Record<string, any>,
	signal?: AbortSignal
) {
	return listAssessmentPage<ArcheryPerformanceAssessmentDTO>(
		"/api/Archery_Performance_Assessments",
		page,
		limit,
		{ athlete_id, ...extra },
		orderby,
		signal
	);
}

export async function addTaekwondoPerformanceAssessment(payload: Omit<TaekwondoPerformanceAssessmentDTO, "id">) {
	const body = normalizePayload(payload);
	const { data } = await api.post<MutateResponse<TaekwondoPerformanceAssessmentDTO>>(
		`/api/Taekwondo_Performance_Assessments`,
		body
	);
	if (!isOk(data)) throw new Error((data as any)?.message || "Create Taekwondo performance assessment failed");
	return unwrap<TaekwondoPerformanceAssessmentDTO>(data);
}
export async function updateTaekwondoPerformanceAssessmentById(
	id: number,
	payload: Partial<TaekwondoPerformanceAssessmentDTO>
) {
	const body = normalizePayload(payload);
	const { data } = await api.put<MutateResponse<TaekwondoPerformanceAssessmentDTO>>(
		`/api/Taekwondo_Performance_Assessments/${id}`,
		body
	);
	if (!isOk(data)) throw new Error((data as any)?.message || "Update Taekwondo performance assessment failed");
	return unwrap<TaekwondoPerformanceAssessmentDTO>(data);
}
export async function deleteTaekwondoPerformanceAssessmentById(id: number) {
	const { data } = await api.delete<MutateResponse>(`/api/Taekwondo_Performance_Assessments/${id}`);
	if (!isOk(data)) throw new Error((data as any)?.message || "Delete Taekwondo performance assessment failed");
}

export async function addShootingPerformanceAssessment(payload: Omit<ShootingPerformanceAssessmentDTO, "id">) {
	const body = normalizePayload(payload);
	const { data } = await api.post<MutateResponse<ShootingPerformanceAssessmentDTO>>(
		`/api/Shooting_Performance_Assessments`,
		body
	);
	if (!isOk(data)) throw new Error((data as any)?.message || "Create Shooting performance assessment failed");
	return unwrap<ShootingPerformanceAssessmentDTO>(data);
}
export async function updateShootingPerformanceAssessmentById(
	id: number,
	payload: Partial<ShootingPerformanceAssessmentDTO>
) {
	const body = normalizePayload(payload);
	const { data } = await api.put<MutateResponse<ShootingPerformanceAssessmentDTO>>(
		`/api/Shooting_Performance_Assessments/${id}`,
		body
	);
	if (!isOk(data)) throw new Error((data as any)?.message || "Update Shooting performance assessment failed");
	return unwrap<ShootingPerformanceAssessmentDTO>(data);
}
export async function deleteShootingPerformanceAssessmentById(id: number) {
	const { data } = await api.delete<MutateResponse>(`/api/Shooting_Performance_Assessments/${id}`);
	if (!isOk(data)) throw new Error((data as any)?.message || "Delete Shooting performance assessment failed");
}

export async function addBoxingPerformanceAssessment(payload: Omit<BoxingPerformanceAssessmentDTO, "id">) {
	const body = normalizePayload(payload);
	const { data } = await api.post<MutateResponse<BoxingPerformanceAssessmentDTO>>(
		`/api/Boxing_Performance_Assessments`,
		body
	);
	if (!isOk(data)) throw new Error((data as any)?.message || "Create Boxing performance assessment failed");
	return unwrap<BoxingPerformanceAssessmentDTO>(data);
}
export async function updateBoxingPerformanceAssessmentById(
	id: number,
	payload: Partial<BoxingPerformanceAssessmentDTO>
) {
	const body = normalizePayload(payload);
	const { data } = await api.put<MutateResponse<BoxingPerformanceAssessmentDTO>>(
		`/api/Boxing_Performance_Assessments/${id}`,
		body
	);
	if (!isOk(data)) throw new Error((data as any)?.message || "Update Boxing performance assessment failed");
	return unwrap<BoxingPerformanceAssessmentDTO>(data);
}
export async function deleteBoxingPerformanceAssessmentById(id: number) {
	const { data } = await api.delete<MutateResponse>(`/api/Boxing_Performance_Assessments/${id}`);
	if (!isOk(data)) throw new Error((data as any)?.message || "Delete Boxing performance assessment failed");
}

export async function addArcheryPerformanceAssessment(payload: Omit<ArcheryPerformanceAssessmentDTO, "id">) {
	const body = normalizePayload(payload);
	const { data } = await api.post<MutateResponse<ArcheryPerformanceAssessmentDTO>>(
		`/api/Archery_Performance_Assessments`,
		body
	);
	if (!isOk(data)) throw new Error((data as any)?.message || "Create Archery performance assessment failed");
	return unwrap<ArcheryPerformanceAssessmentDTO>(data);
}
export async function updateArcheryPerformanceAssessmentById(
	id: number,
	payload: Partial<ArcheryPerformanceAssessmentDTO>
) {
	const body = normalizePayload(payload);
	const { data } = await api.put<MutateResponse<ArcheryPerformanceAssessmentDTO>>(
		`/api/Archery_Performance_Assessments/${id}`,
		body
	);
	if (!isOk(data)) throw new Error((data as any)?.message || "Update Archery performance assessment failed");
	return unwrap<ArcheryPerformanceAssessmentDTO>(data);
}
export async function deleteArcheryPerformanceAssessmentById(id: number) {
	const { data } = await api.delete<MutateResponse>(`/api/Archery_Performance_Assessments/${id}`);
	if (!isOk(data)) throw new Error((data as any)?.message || "Delete Archery performance assessment failed");
}
