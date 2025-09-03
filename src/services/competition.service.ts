import { api } from "@/lib/api/client";

type ListResponse<T> = { status: "success" | "error"; message?: string; data: T[] };
type OneResponse<T> = { status: "success" | "error"; message?: string; data?: T };
type MutateResponse<T = unknown> = { status: "success" | "error"; message?: string; data?: T };

export type BaseCompetitionDTO = {
	id: number;
	athlete_id: number;
	competition_id?: number | string;
	medal_won?: string;
	final_rank?: number | string;
	result_data?: string;
	opponent_user_id?: number | string;
	notes?: string;
	created_at?: string;
	recorded_at?: string;
};

export type ArcheryCompetitionDTO = BaseCompetitionDTO;
export type ShootingCompetitionDTO = BaseCompetitionDTO;
export type BoxingCompetitionDTO = BaseCompetitionDTO;
export type TaekwondoCompetitionDTO = BaseCompetitionDTO;

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

const ARCHERY_URL = "/api/Archery_Competitions";
export async function listArcheryCompetitions(
	filters?: Record<string, string | number | boolean | undefined>,
	orderby?: string
) {
	const qs = toQuery(filters, orderby);
	const url = qs ? `${ARCHERY_URL}?${qs}` : ARCHERY_URL;
	const { data } = await api.get<ListResponse<ArcheryCompetitionDTO>>(url);
	if (data.status !== "success") throw new Error(data.message || "List Archery competitions failed");
	return data.data;
}
export async function listArcheryCompetitionsByAthlete(athlete_id: number, orderby?: string) {
	return listArcheryCompetitions({ athlete_id }, orderby);
}
export async function getArcheryCompetitionById(id: number) {
	const { data } = await api.get<OneResponse<ArcheryCompetitionDTO>>(`${ARCHERY_URL}/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Get Archery competition failed");
	return (data as any).data ?? null;
}
export async function addArcheryCompetition(payload: Partial<ArcheryCompetitionDTO>) {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.post<MutateResponse<ArcheryCompetitionDTO>>(ARCHERY_URL, body);
	if (data.status !== "success") throw new Error(data.message || "Create Archery competition failed");
	return (data as any).data ?? null;
}
export async function updateArcheryCompetitionById(id: number, payload: Partial<ArcheryCompetitionDTO>) {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.put<MutateResponse<ArcheryCompetitionDTO>>(`${ARCHERY_URL}/${id}`, body);
	if (data.status !== "success") throw new Error(data.message || "Update Archery competition failed");
	return (data as any).data ?? null;
}
export async function deleteArcheryCompetitionById(id: number) {
	const { data } = await api.delete<MutateResponse>(`${ARCHERY_URL}/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Delete Archery competition failed");
}

const SHOOTING_URL = "/api/Shooting_Competitions";
export async function listShootingCompetitions(
	filters?: Record<string, string | number | boolean | undefined>,
	orderby?: string
) {
	const qs = toQuery(filters, orderby);
	const url = qs ? `${SHOOTING_URL}?${qs}` : SHOOTING_URL;
	const { data } = await api.get<ListResponse<ShootingCompetitionDTO>>(url);
	if (data.status !== "success") throw new Error(data.message || "List Shooting competitions failed");
	return data.data;
}
export async function listShootingCompetitionsByAthlete(athlete_id: number, orderby?: string) {
	return listShootingCompetitions({ athlete_id }, orderby);
}
export async function getShootingCompetitionById(id: number) {
	const { data } = await api.get<OneResponse<ShootingCompetitionDTO>>(`${SHOOTING_URL}/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Get Shooting competition failed");
	return (data as any).data ?? null;
}
export async function addShootingCompetition(payload: Partial<ShootingCompetitionDTO>) {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.post<MutateResponse<ShootingCompetitionDTO>>(SHOOTING_URL, body);
	if (data.status !== "success") throw new Error(data.message || "Create Shooting competition failed");
	return (data as any).data ?? null;
}
export async function updateShootingCompetitionById(id: number, payload: Partial<ShootingCompetitionDTO>) {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.put<MutateResponse<ShootingCompetitionDTO>>(`${SHOOTING_URL}/${id}`, body);
	if (data.status !== "success") throw new Error(data.message || "Update Shooting competition failed");
	return (data as any).data ?? null;
}
export async function deleteShootingCompetitionById(id: number) {
	const { data } = await api.delete<MutateResponse>(`${SHOOTING_URL}/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Delete Shooting competition failed");
}

const BOXING_URL = "/api/Boxing_Competitions";
export async function listBoxingCompetitions(
	filters?: Record<string, string | number | boolean | undefined>,
	orderby?: string
) {
	const qs = toQuery(filters, orderby);
	const url = qs ? `${BOXING_URL}?${qs}` : BOXING_URL;
	const { data } = await api.get<ListResponse<BoxingCompetitionDTO>>(url);
	if (data.status !== "success") throw new Error(data.message || "List Boxing competitions failed");
	return data.data;
}
export async function listBoxingCompetitionsByAthlete(athlete_id: number, orderby?: string) {
	return listBoxingCompetitions({ athlete_id }, orderby);
}
export async function getBoxingCompetitionById(id: number) {
	const { data } = await api.get<OneResponse<BoxingCompetitionDTO>>(`${BOXING_URL}/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Get Boxing competition failed");
	return (data as any).data ?? null;
}
export async function addBoxingCompetition(payload: Partial<BoxingCompetitionDTO>) {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.post<MutateResponse<BoxingCompetitionDTO>>(BOXING_URL, body);
	if (data.status !== "success") throw new Error(data.message || "Create Boxing competition failed");
	return (data as any).data ?? null;
}
export async function updateBoxingCompetitionById(id: number, payload: Partial<BoxingCompetitionDTO>) {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.put<MutateResponse<BoxingCompetitionDTO>>(`${BOXING_URL}/${id}`, body);
	if (data.status !== "success") throw new Error(data.message || "Update Boxing competition failed");
	return (data as any).data ?? null;
}
export async function deleteBoxingCompetitionById(id: number) {
	const { data } = await api.delete<MutateResponse>(`${BOXING_URL}/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Delete Boxing competition failed");
}

const TAEKWONDO_URL = "/api/Taekwondo_Competitions";
export async function listTaekwondoCompetitions(
	filters?: Record<string, string | number | boolean | undefined>,
	orderby?: string
) {
	const qs = toQuery(filters, orderby);
	const url = qs ? `${TAEKWONDO_URL}?${qs}` : TAEKWONDO_URL;
	const { data } = await api.get<ListResponse<TaekwondoCompetitionDTO>>(url);
	if (data.status !== "success") throw new Error(data.message || "List Taekwondo competitions failed");
	return data.data;
}
export async function listTaekwondoCompetitionsByAthlete(athlete_id: number, orderby?: string) {
	return listTaekwondoCompetitions({ athlete_id }, orderby);
}
export async function getTaekwondoCompetitionById(id: number) {
	const { data } = await api.get<OneResponse<TaekwondoCompetitionDTO>>(`${TAEKWONDO_URL}/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Get Taekwondo competition failed");
	return (data as any).data ?? null;
}
export async function addTaekwondoCompetition(payload: Partial<TaekwondoCompetitionDTO>) {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.post<MutateResponse<TaekwondoCompetitionDTO>>(TAEKWONDO_URL, body);
	if (data.status !== "success") throw new Error(data.message || "Create Taekwondo competition failed");
	return (data as any).data ?? null;
}
export async function updateTaekwondoCompetitionById(id: number, payload: Partial<TaekwondoCompetitionDTO>) {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.put<MutateResponse<TaekwondoCompetitionDTO>>(`${TAEKWONDO_URL}/${id}`, body);
	if (data.status !== "success") throw new Error(data.message || "Update Taekwondo competition failed");
	return (data as any).data ?? null;
}
export async function deleteTaekwondoCompetitionById(id: number) {
	const { data } = await api.delete<MutateResponse>(`${TAEKWONDO_URL}/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Delete Taekwondo competition failed");
}
