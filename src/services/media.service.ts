import { api } from "@/lib/api/client";

type ListResponse<T> = { status: "success" | "error"; message?: string; data: T[] };
type OneResponse<T> = { status: "success" | "error"; message?: string; data?: T };
type MutateResponse<T = unknown> = { status: "success" | "error"; message?: string; data?: T };

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

export type MediaDTO = {
	id: number;
	athlete_id: number;
	media_type: "image" | "video" | "social" | "weblink" | "document" | "other";
	title?: string;
	media_url: string;
	thumbnail_url?: string;
	platform_name?: string;
	posted_date?: string;
	created_at?: string;
	updated_at?: string;
};

const MEDIA_URL = "/api/Media";

export async function listMedia(filters?: Record<string, string | number | boolean | undefined>, orderby?: string) {
	const qs = toQuery(filters, orderby);
	const url = qs ? `${MEDIA_URL}?${qs}` : MEDIA_URL;
	const { data } = await api.get<ListResponse<MediaDTO>>(url);
	if (data.status !== "success") throw new Error(data.message || "List Media failed");
	return data.data;
}

export async function listMediaByAthlete(athlete_id: number, orderby?: string) {
	return listMedia({ athlete_id }, orderby);
}

export async function getMediaById(id: number) {
	const { data } = await api.get<OneResponse<MediaDTO>>(`${MEDIA_URL}/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Get Media failed");
	return (data as any).data ?? null;
}

export async function addMedia(payload: Partial<MediaDTO>) {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.post<MutateResponse<MediaDTO>>(MEDIA_URL, body);
	if (data.status !== "success") throw new Error(data.message || "Create Media failed");
	return (data as any).data ?? null;
}

export async function updateMediaById(id: number, payload: Partial<MediaDTO>) {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.put<MutateResponse<MediaDTO>>(`${MEDIA_URL}/${id}`, body);
	if (data.status !== "success") throw new Error(data.message || "Update Media failed");
	return (data as any).data ?? null;
}

export async function deleteMediaById(id: number) {
	const { data } = await api.delete<MutateResponse>(`${MEDIA_URL}/${id}`);
	if (data.status !== "success") throw new Error(data.message || "Delete Media failed");
}

export async function listImagesByAthlete(athlete_id: number, orderby?: string) {
	return listMedia({ athlete_id, media_type: "image" }, orderby);
}
export async function listVideosByAthlete(athlete_id: number, orderby?: string) {
	return listMedia({ athlete_id, media_type: "video" }, orderby);
}
