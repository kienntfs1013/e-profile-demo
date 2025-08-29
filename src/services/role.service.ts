import { api } from "@/lib/api/client";

export type RoleDTO = {
	id: number;
	name: string;
};

type ListResponse<T> = { status: "success" | "error"; message?: string; data: T[] };
type ItemResponse<T> = { status: "success" | "error"; message?: string; data: T };

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

export async function listRoles(
	filters?: Record<string, string | number | boolean | undefined>,
	orderby?: string
): Promise<RoleDTO[]> {
	const qs = toQuery(filters, orderby);
	const url = qs ? `/api/Role?${qs}` : "/api/Role";
	const { data } = await api.get<ListResponse<RoleDTO>>(url);
	if (data.status !== "success") throw new Error(data.message || "List Roles failed");
	return data.data;
}

export async function getRoleById(id: number): Promise<RoleDTO> {
	const { data } = await api.get<ItemResponse<RoleDTO>>(`/api/Role/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Get Role failed");
	return data.data;
}

export async function createRole(payload: { name: string }): Promise<RoleDTO> {
	const { data } = await api.post<ItemResponse<RoleDTO>>("/api/Role", payload);
	if (data.status !== "success") throw new Error(data.message || "Create Role failed");
	return data.data;
}

export async function updateRole(id: number, payload: { name: string }): Promise<RoleDTO> {
	const { data } = await api.put<ItemResponse<RoleDTO>>(`/api/Role/${id}`, payload);
	if (data.status !== "success") throw new Error(data.message || "Update Role failed");
	return data.data;
}

export async function deleteRole(id: number): Promise<boolean> {
	const { data } = await api.delete<ItemResponse<unknown>>(`/api/Role/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Delete Role failed");
	return true;
}
