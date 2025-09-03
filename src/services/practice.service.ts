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
	notes?: string;
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
	notes?: string;
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
	notes?: string;
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

function toQuery(filters?: Record<string, string | number | boolean | undefined>, orderby?: string): string {
	const params = new URLSearchParams();
	if (filters) {
		Object.entries(filters).forEach(([k, v]) => {
			if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
		});
	}
	if (orderby) params.append("orderby", orderby);
	return params.toString();
}

/** Taekwondo */
export async function listTaekwondoPractices(
	filters?: Record<string, string | number | boolean | undefined>,
	orderby?: string
): Promise<TaekwondoPracticeDTO[]> {
	const qs = toQuery(filters, orderby);
	const url = qs ? `/api/Taekwondo_Practice?${qs}` : "/api/Taekwondo_Practice";
	const { data } = await api.get<ListResponse<TaekwondoPracticeDTO>>(url);
	if (data.status !== "success") throw new Error(data.message || "List Taekwondo practice failed");
	return data.data;
}

export async function listTaekwondoPracticesByAthlete(
	athleteId: number,
	orderby?: string
): Promise<TaekwondoPracticeDTO[]> {
	return listTaekwondoPractices({ athlete_id: athleteId }, orderby);
}

export async function addTaekwondoPractice(
	payload: Omit<TaekwondoPracticeDTO, "id">
): Promise<TaekwondoPracticeDTO | null> {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.post<MutateResponse<TaekwondoPracticeDTO>>(`/api/Taekwondo_Practice`, body);
	if (data.status !== "success") throw new Error(data.message || "Create Taekwondo practice failed");
	return (data as any).data ?? null;
}

export async function updateTaekwondoPracticeById(
	id: number,
	payload: Partial<TaekwondoPracticeDTO>
): Promise<TaekwondoPracticeDTO | null> {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.put<MutateResponse<TaekwondoPracticeDTO>>(`/api/Taekwondo_Practice/${id}`, body);
	if (data.status !== "success") throw new Error(data.message || "Update Taekwondo practice failed");
	return (data as any).data ?? null;
}

export async function deleteTaekwondoPracticeById(id: number): Promise<void> {
	const { data } = await api.delete<MutateResponse>(`/api/Taekwondo_Practice/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Delete Taekwondo practice failed");
}

/** Shooting */
export async function listShootingPractices(
	filters?: Record<string, string | number | boolean | undefined>,
	orderby?: string
): Promise<ShootingPracticeDTO[]> {
	const qs = toQuery(filters, orderby);
	const url = qs ? `/api/Shooting_Practice?${qs}` : "/api/Shooting_Practice";
	const { data } = await api.get<ListResponse<ShootingPracticeDTO>>(url);
	if (data.status !== "success") throw new Error(data.message || "List Shooting practice failed");
	return data.data;
}

export async function listShootingPracticesByAthlete(
	athleteId: number,
	orderby?: string
): Promise<ShootingPracticeDTO[]> {
	return listShootingPractices({ athlete_id: athleteId }, orderby);
}

export async function addShootingPractice(
	payload: Omit<ShootingPracticeDTO, "id">
): Promise<ShootingPracticeDTO | null> {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.post<MutateResponse<ShootingPracticeDTO>>(`/api/Shooting_Practice`, body);
	if (data.status !== "success") throw new Error(data.message || "Create Shooting practice failed");
	return (data as any).data ?? null;
}

export async function updateShootingPracticeById(
	id: number,
	payload: Partial<ShootingPracticeDTO>
): Promise<ShootingPracticeDTO | null> {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.put<MutateResponse<ShootingPracticeDTO>>(`/api/Shooting_Practice/${id}`, body);
	if (data.status !== "success") throw new Error(data.message || "Update Shooting practice failed");
	return (data as any).data ?? null;
}

export async function deleteShootingPracticeById(id: number): Promise<void> {
	const { data } = await api.delete<MutateResponse>(`/api/Shooting_Practice/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Delete Shooting practice failed");
}

/** Boxing */
export async function listBoxingPractices(
	filters?: Record<string, string | number | boolean | undefined>,
	orderby?: string
): Promise<BoxingPracticeDTO[]> {
	const qs = toQuery(filters, orderby);
	const url = qs ? `/api/Boxing_Practice?${qs}` : "/api/Boxing_Practice";
	const { data } = await api.get<ListResponse<BoxingPracticeDTO>>(url);
	if (data.status !== "success") throw new Error(data.message || "List Boxing practice failed");
	return data.data;
}

export async function listBoxingPracticesByAthlete(athleteId: number, orderby?: string): Promise<BoxingPracticeDTO[]> {
	return listBoxingPractices({ athlete_id: athleteId }, orderby);
}

export async function addBoxingPractice(payload: Omit<BoxingPracticeDTO, "id">): Promise<BoxingPracticeDTO | null> {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.post<MutateResponse<BoxingPracticeDTO>>(`/api/Boxing_Practice`, body);
	if (data.status !== "success") throw new Error(data.message || "Create Boxing practice failed");
	return (data as any).data ?? null;
}

export async function updateBoxingPracticeById(
	id: number,
	payload: Partial<BoxingPracticeDTO>
): Promise<BoxingPracticeDTO | null> {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.put<MutateResponse<BoxingPracticeDTO>>(`/api/Boxing_Practice/${id}`, body);
	if (data.status !== "success") throw new Error(data.message || "Update Boxing practice failed");
	return (data as any).data ?? null;
}

export async function deleteBoxingPracticeById(id: number): Promise<void> {
	const { data } = await api.delete<MutateResponse>(`/api/Boxing_Practice/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Delete Boxing practice failed");
}

/** Archery */
export async function listArcheryPractices(
	filters?: Record<string, string | number | boolean | undefined>,
	orderby?: string
): Promise<ArcheryPracticeDTO[]> {
	const qs = toQuery(filters, orderby);
	const url = qs ? `/api/Archery_Practice?${qs}` : "/api/Archery_Practice";
	const { data } = await api.get<ListResponse<ArcheryPracticeDTO>>(url);
	if (data.status !== "success") throw new Error(data.message || "List Archery practice failed");
	return data.data;
}

export async function listArcheryPracticesByAthlete(
	athleteId: number,
	orderby?: string
): Promise<ArcheryPracticeDTO[]> {
	return listArcheryPractices({ athlete_id: athleteId }, orderby);
}

export async function addArcheryPractice(payload: Omit<ArcheryPracticeDTO, "id">): Promise<ArcheryPracticeDTO | null> {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.post<MutateResponse<ArcheryPracticeDTO>>(`/api/Archery_Practice`, body);
	if (data.status !== "success") throw new Error(data.message || "Create Archery practice failed");
	return (data as any).data ?? null;
}

export async function updateArcheryPracticeById(
	id: number,
	payload: Partial<ArcheryPracticeDTO>
): Promise<ArcheryPracticeDTO | null> {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.put<MutateResponse<ArcheryPracticeDTO>>(`/api/Archery_Practice/${id}`, body);
	if (data.status !== "success") throw new Error(data.message || "Update Archery practice failed");
	return (data as any).data ?? null;
}

export async function deleteArcheryPracticeById(id: number): Promise<void> {
	const { data } = await api.delete<MutateResponse>(`/api/Archery_Practice/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Delete Archery practice failed");
}
