import { api } from "@/lib/api/client";

type ListResponse<T> = { status: "success" | "error"; message?: string; data: T[] };
type MutateResponse<T = unknown> = { status: "success" | "error"; message?: string; data?: T };

export type TaekwondoPracticeDTO = {
	id: number;
	athlete_id: number;
	session_date?: string;
	technique?: string;
	drills_practiced?: string;
	sparring_duration?: number | string;
	fitness_exercises?: string;
	comments?: string;
	created_at?: string;
};
export type ShootingPracticeDTO = {
	id: number;
	athlete_id: number;
	session_date?: string;
	weapon_type?: string;
	distance?: number | string;
	target_type?: string;
	shots_fired?: number | string;
	shots_hit?: number | string;
	accuracy?: number | string;
	comments?: string;
	created_at?: string;
};
export type BoxingPracticeDTO = {
	id: number;
	athlete_id: number;
	round_number?: number | string;
	punches_thrown?: number | string;
	punches_landed?: number | string;
	defense_success_rate?: number | string;
	footwork_score?: number | string;
	sparring_partner?: string;
	comments?: string;
	created_at?: string;
};
export type ArcheryPracticeDTO = {
	id: number;
	athlete_id: number;
	session_date?: string;
	target_distance?: number | string;
	end_number?: number | string;
	arrow_number?: number | string;
	score?: number | string;
	x_coord?: string | number;
	y_coord?: string | number;
	created_at?: string;
};

export type PagedListResponse<T> = {
	status?: "success" | "error";
	message?: string;
	data: T[];
	total?: number;
	page?: number; // 1-based
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

export async function listTaekwondoPractices(
	filters?: Record<string, any>,
	orderby?: string
): Promise<TaekwondoPracticeDTO[]> {
	const qs = toQuery(filters, orderby);
	const { data } = await api.get<ListResponse<TaekwondoPracticeDTO>>(
		qs ? `/api/Taekwondo_Practice?${qs}` : "/api/Taekwondo_Practice"
	);
	if (data.status !== "success") throw new Error(data.message || "List Taekwondo practice failed");
	return data.data;
}
export async function listTaekwondoPracticesByAthlete(athlete_id: number, orderby?: string) {
	return listTaekwondoPractices({ athlete_id }, orderby);
}

export async function listShootingPractices(
	filters?: Record<string, any>,
	orderby?: string
): Promise<ShootingPracticeDTO[]> {
	const qs = toQuery(filters, orderby);
	const { data } = await api.get<ListResponse<ShootingPracticeDTO>>(
		qs ? `/api/Shooting_Practice?${qs}` : "/api/Shooting_Practice"
	);
	if (data.status !== "success") throw new Error(data.message || "List Shooting practice failed");
	return data.data;
}
export async function listShootingPracticesByAthlete(athlete_id: number, orderby?: string) {
	return listShootingPractices({ athlete_id }, orderby);
}

export async function listBoxingPractices(
	filters?: Record<string, any>,
	orderby?: string
): Promise<BoxingPracticeDTO[]> {
	const qs = toQuery(filters, orderby);
	const { data } = await api.get<ListResponse<BoxingPracticeDTO>>(
		qs ? `/api/Boxing_Practice?${qs}` : "/api/Boxing_Practice"
	);
	if (data.status !== "success") throw new Error(data.message || "List Boxing practice failed");
	return data.data;
}
export async function listBoxingPracticesByAthlete(athlete_id: number, orderby?: string) {
	return listBoxingPractices({ athlete_id }, orderby);
}

export async function listArcheryPractices(
	filters?: Record<string, any>,
	orderby?: string
): Promise<ArcheryPracticeDTO[]> {
	const qs = toQuery(filters, orderby);
	const { data } = await api.get<ListResponse<ArcheryPracticeDTO>>(
		qs ? `/api/Archery_Practice?${qs}` : "/api/Archery_Practice"
	);
	if (data.status !== "success") throw new Error(data.message || "List Archery practice failed");
	return data.data;
}
export async function listArcheryPracticesByAthlete(athlete_id: number, orderby?: string) {
	return listArcheryPractices({ athlete_id }, orderby);
}

async function listPracticePage<T>(
	endpoint: "/api/Taekwondo_Practice" | "/api/Shooting_Practice" | "/api/Boxing_Practice" | "/api/Archery_Practice",
	page = 1,
	limit = 10,
	filters?: Record<string, string | number | boolean | undefined>,
	orderby?: string,
	signal?: AbortSignal
): Promise<PagedListResponse<T>> {
	const params = new URLSearchParams();
	params.set("page", String(page));
	params.set("limit", String(limit)); // nếu backend không hỗ trợ, có thể bỏ
	if (orderby) params.set("orderby", orderby);
	if (filters)
		Object.entries(filters).forEach(([k, v]) => {
			if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
		});
	const url = `${endpoint}?${params.toString()}`;
	const { data } = await api.get<PagedListResponse<T>>(url, { signal });
	if (data?.status && data.status !== "success") throw new Error(data?.message || "List practice failed");
	return { ...data, data: data.data ?? ([] as T[]) };
}

export function listTaekwondoPracticesPageByAthlete(
	athlete_id: number,
	page = 1,
	limit = 10,
	orderby?: string,
	extra?: Record<string, any>,
	signal?: AbortSignal
) {
	return listPracticePage<TaekwondoPracticeDTO>(
		"/api/Taekwondo_Practice",
		page,
		limit,
		{ athlete_id, ...extra },
		orderby,
		signal
	);
}
export function listShootingPracticesPageByAthlete(
	athlete_id: number,
	page = 1,
	limit = 10,
	orderby?: string,
	extra?: Record<string, any>,
	signal?: AbortSignal
) {
	return listPracticePage<ShootingPracticeDTO>(
		"/api/Shooting_Practice",
		page,
		limit,
		{ athlete_id, ...extra },
		orderby,
		signal
	);
}
export function listBoxingPracticesPageByAthlete(
	athlete_id: number,
	page = 1,
	limit = 10,
	orderby?: string,
	extra?: Record<string, any>,
	signal?: AbortSignal
) {
	return listPracticePage<BoxingPracticeDTO>(
		"/api/Boxing_Practice",
		page,
		limit,
		{ athlete_id, ...extra },
		orderby,
		signal
	);
}
export function listArcheryPracticesPageByAthlete(
	athlete_id: number,
	page = 1,
	limit = 10,
	orderby?: string,
	extra?: Record<string, any>,
	signal?: AbortSignal
) {
	return listPracticePage<ArcheryPracticeDTO>(
		"/api/Archery_Practice",
		page,
		limit,
		{ athlete_id, ...extra },
		orderby,
		signal
	);
}

export async function addTaekwondoPractice(payload: Omit<TaekwondoPracticeDTO, "id">) {
	const { id: _, ...body } = payload as any;
	const { data } = await api.post<MutateResponse<TaekwondoPracticeDTO>>(`/api/Taekwondo_Practice`, body);
	if (data.status !== "success") throw new Error(data.message || "Create Taekwondo practice failed");
	return (data as any).data ?? null;
}
export async function updateTaekwondoPracticeById(id: number, payload: Partial<TaekwondoPracticeDTO>) {
	const { id: _, ...body } = payload as any;
	const { data } = await api.put<MutateResponse<TaekwondoPracticeDTO>>(`/api/Taekwondo_Practice/${id}`, body);
	if (data.status !== "success") throw new Error(data.message || "Update Taekwondo practice failed");
	return (data as any).data ?? null;
}
export async function deleteTaekwondoPracticeById(id: number) {
	const { data } = await api.delete<MutateResponse>(`/api/Taekwondo_Practice/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Delete Taekwondo practice failed");
}

export async function addShootingPractice(payload: Omit<ShootingPracticeDTO, "id">) {
	const { id: _, ...body } = payload as any;
	const { data } = await api.post<MutateResponse<ShootingPracticeDTO>>(`/api/Shooting_Practice`, body);
	if (data.status !== "success") throw new Error(data.message || "Create Shooting practice failed");
	return (data as any).data ?? null;
}
export async function updateShootingPracticeById(id: number, payload: Partial<ShootingPracticeDTO>) {
	const { id: _, ...body } = payload as any;
	const { data } = await api.put<MutateResponse<ShootingPracticeDTO>>(`/api/Shooting_Practice/${id}`, body);
	if (data.status !== "success") throw new Error(data.message || "Update Shooting practice failed");
	return (data as any).data ?? null;
}
export async function deleteShootingPracticeById(id: number) {
	const { data } = await api.delete<MutateResponse>(`/api/Shooting_Practice/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Delete Shooting practice failed");
}

export async function addBoxingPractice(payload: Omit<BoxingPracticeDTO, "id">) {
	const { id: _, ...body } = payload as any;
	const { data } = await api.post<MutateResponse<BoxingPracticeDTO>>(`/api/Boxing_Practice`, body);
	if (data.status !== "success") throw new Error(data.message || "Create Boxing practice failed");
	return (data as any).data ?? null;
}
export async function updateBoxingPracticeById(id: number, payload: Partial<BoxingPracticeDTO>) {
	const { id: _, ...body } = payload as any;
	const { data } = await api.put<MutateResponse<BoxingPracticeDTO>>(`/api/Boxing_Practice/${id}`, body);
	if (data.status !== "success") throw new Error(data.message || "Update Boxing practice failed");
	return (data as any).data ?? null;
}
export async function deleteBoxingPracticeById(id: number) {
	const { data } = await api.delete<MutateResponse>(`/api/Boxing_Practice/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Delete Boxing practice failed");
}

export async function addArcheryPractice(payload: Omit<ArcheryPracticeDTO, "id">) {
	const { id: _, ...body } = payload as any;
	const { data } = await api.post<MutateResponse<ArcheryPracticeDTO>>(`/api/Archery_Practice`, body);
	if (data.status !== "success") throw new Error(data.message || "Create Archery practice failed");
	return (data as any).data ?? null;
}
export async function updateArcheryPracticeById(id: number, payload: Partial<ArcheryPracticeDTO>) {
	const { id: _, ...body } = payload as any;
	const { data } = await api.put<MutateResponse<ArcheryPracticeDTO>>(`/api/Archery_Practice/${id}`, body);
	if (data.status !== "success") throw new Error(data.message || "Update Archery practice failed");
	return (data as any).data ?? null;
}
export async function deleteArcheryPracticeById(id: number) {
	const { data } = await api.delete<MutateResponse>(`/api/Archery_Practice/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Delete Archery practice failed");
}
