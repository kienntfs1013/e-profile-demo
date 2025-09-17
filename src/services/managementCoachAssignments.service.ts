import { api } from "@/lib/api/client";

type ListResponse<T> = { status: "success" | "error"; message?: string; data: T[] };
type MutateResponse<T = unknown> = { status: "success" | "error"; message?: string; data?: T };

export type ManagementCoachAssignmentDTO = {
	id: number;
	manager_id: number;
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

export async function listManagementCoachAssignments(filters?: Record<string, any>, orderby?: string) {
	const qs = toQuery(filters, orderby);
	const { data } = await api.get<ListResponse<ManagementCoachAssignmentDTO>>(
		qs ? `/api/Management_Coach_Assignments?${qs}` : "/api/Management_Coach_Assignments"
	);
	if (data.status !== "success") throw new Error(data.message || "List management-coach assignments failed");
	return data.data;
}

export function listManagementCoachAssignmentsByManager(manager_id: number, orderby?: string) {
	return listManagementCoachAssignments({ manager_id }, orderby);
}

export async function getManagementCoachAssignmentById(id: number): Promise<ManagementCoachAssignmentDTO | null> {
	const { data } = await api.get<MutateResponse<ManagementCoachAssignmentDTO>>(
		`/api/Management_Coach_Assignments/${id}`
	);
	if (!isOk(data)) throw new Error((data as any)?.message || "Get management-coach assignment failed");
	return unwrap<ManagementCoachAssignmentDTO>(data);
}

export async function addManagementCoachAssignment(payload: Omit<ManagementCoachAssignmentDTO, "id">) {
	const body = normalizePayload(payload);
	const { data } = await api.post<MutateResponse<ManagementCoachAssignmentDTO>>(
		`/api/Management_Coach_Assignments`,
		body
	);
	if (!isOk(data)) throw new Error((data as any)?.message || "Create management-coach assignment failed");
	return unwrap<ManagementCoachAssignmentDTO>(data);
}

export async function updateManagementCoachAssignmentById(id: number, payload: Partial<ManagementCoachAssignmentDTO>) {
	const body = normalizePayload(payload);
	const { data } = await api.put<MutateResponse<ManagementCoachAssignmentDTO>>(
		`/api/Management_Coach_Assignments/${id}`,
		body
	);
	if (!isOk(data)) throw new Error((data as any)?.message || "Update management-coach assignment failed");
	return unwrap<ManagementCoachAssignmentDTO>(data);
}

export async function deleteManagementCoachAssignmentById(id: number) {
	const { data } = await api.delete<MutateResponse>(`/api/Management_Coach_Assignments/${id}`);
	if (!isOk(data)) throw new Error((data as any)?.message || "Delete management-coach assignment failed");
}
