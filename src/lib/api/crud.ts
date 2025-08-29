import api from "./client";

export type OrderBy = `${string}-asc` | `${string}-desc`;

export function buildQuery(params?: Record<string, any>) {
	const q = new URLSearchParams();
	Object.entries(params || {}).forEach(([k, v]) => {
		if (v === undefined || v === null || v === "") return;
		q.append(k, String(v));
	});
	const s = q.toString();
	return s ? `?${s}` : "";
}

export async function listTable<T>(table: string, params?: { [k: string]: any; orderby?: OrderBy }) {
	const { data } = await api.get<{ status: string; data: T[]; total: number; page: number; totalpage: number }>(
		`/api/${table}${buildQuery(params)}`
	);
	return data;
}

export async function getById<T>(table: string, id: number | string) {
	const { data } = await api.get<{ status: string; data: T }>(`/api/${table}/${id}`);
	return data;
}

export async function createOne<T>(table: string, payload: any) {
	const { data } = await api.post<{ status: string; data?: T; message?: string }>(`/api/${table}`, payload);
	return data;
}

export async function updateOne<T>(table: string, id: number | string, payload: any) {
	const { data } = await api.put<{ status: string; data?: T; message?: string }>(`/api/${table}/${id}`, payload);
	return data;
}

export async function deleteOne(table: string, id: number | string) {
	const { data } = await api.delete<{ status: string; message?: string }>(`/api/${table}/${id}`);
	return data;
}
