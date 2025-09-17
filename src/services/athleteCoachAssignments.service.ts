import { api } from "@/lib/api/client";

type ListResponse<T> = { status: "success" | "error"; message?: string; data: T[] };
type MutateResponse<T = unknown> = { status: "success" | "error"; message?: string; data?: T };

export type AthleteCoachAssignmentDTO = {
	id: number;
	athlete_id: number;
	coach_id: number;
	created_at?: string;
	updated_at?: string;
};

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
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(
		d.getSeconds()
	)}`;
}

function normalizePayload<T extends { created_at?: string; updated_at?: string }>(payload: T): T {
	const body: any = { ...payload };
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

async function listAssignmentsPage(
	page = 1,
	limit = 50,
	filters?: Record<string, any>,
	orderby?: string,
	signal?: AbortSignal
): Promise<PagedListResponse<AthleteCoachAssignmentDTO>> {
	const params = new URLSearchParams();
	params.set("page", String(page));
	params.set("limit", String(limit));
	if (orderby) params.set("orderby", orderby);
	if (filters) {
		Object.entries(filters).forEach(([k, v]) => {
			if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
		});
	}
	const url = `/api/Athlete_Coach_Assignments?${params.toString()}`;
	const { data } = await api.get<PagedListResponse<AthleteCoachAssignmentDTO>>(url, { signal });
	return { ...data, data: data?.data ?? [] };
}

export async function listAssignments(filters?: Record<string, any>, orderby?: string) {
	const first = await listAssignmentsPage(1, 50, filters, orderby);
	const totalpage = Math.max(1, first.totalpage ?? 1);
	const out: AthleteCoachAssignmentDTO[] = [...(first.data || [])];
	for (let p = 2; p <= totalpage; p++) {
		const res = await listAssignmentsPage(p, 50, filters, orderby);
		out.push(...(res.data || []));
	}
	return out;
}

export function listAssignmentsByCoachId(coach_id: number, orderby?: string) {
	return listAssignments({ coach_id }, orderby);
}

export async function getAssignmentById(id: number): Promise<AthleteCoachAssignmentDTO | null> {
	const { data } = await api.get<MutateResponse<AthleteCoachAssignmentDTO>>(`/api/Athlete_Coach_Assignments/${id}`);
	if (!isOk(data)) throw new Error((data as any)?.message || "Get assignment failed");
	return unwrap<AthleteCoachAssignmentDTO>(data);
}

export async function addAssignment(payload: Omit<AthleteCoachAssignmentDTO, "id">) {
	const body = normalizePayload(payload);
	const { data } = await api.post<MutateResponse<AthleteCoachAssignmentDTO>>(`/api/Athlete_Coach_Assignments`, body);
	if (!isOk(data)) throw new Error((data as any)?.message || "Create assignment failed");
	return unwrap<AthleteCoachAssignmentDTO>(data);
}

export async function updateAssignmentById(id: number, payload: Partial<AthleteCoachAssignmentDTO>) {
	const body = normalizePayload(payload);
	const { data } = await api.put<MutateResponse<AthleteCoachAssignmentDTO>>(
		`/api/Athlete_Coach_Assignments/${id}`,
		body
	);
	if (!isOk(data)) throw new Error((data as any)?.message || "Update assignment failed");
	return unwrap<AthleteCoachAssignmentDTO>(data);
}

export async function deleteAssignmentById(id: number) {
	const { data } = await api.delete<MutateResponse>(`/api/Athlete_Coach_Assignments/${id}`);
	if (!isOk(data)) throw new Error((data as any)?.message || "Delete assignment failed");
}
