import { api } from "@/lib/api/client";

export type CompetitionMasterDTO = {
	id: number;
	sport_type?: string;
	competition_name?: string;
	city?: string;
	country?: string;
	start_date?: string;
	end_date?: string;
	created_at?: string;
	updated_at?: string;
};

type ListResponse<T> = { status?: "success" | "error"; message?: string; data?: T[] };
type OneResponse<T> = { status?: "success" | "error"; message?: string; data?: T };
type MutateResponse<T = unknown> = { status?: "success" | "error"; message?: string; data?: T };

function toQuery(filters?: Record<string, string | number | boolean | undefined>, orderby?: string) {
	const params = new URLSearchParams();
	if (filters) {
		Object.entries(filters).forEach(([k, v]) => {
			if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
		});
	}
	if (orderby) params.append("orderby", orderby);
	return params.toString();
}

export function mapSportKeyToApi(v: "shooting" | "archery" | "boxing" | "taekwondo"): string {
	if (v === "shooting") return "Bắn súng";
	if (v === "archery") return "Bắn cung";
	if (v === "boxing") return "Boxing";
	return "Taekwondo";
}

const BASE_URL = "/api/Competitions";

export async function listCompetitions(
	filters?: Record<string, string | number | boolean | undefined>,
	orderby?: string
) {
	const qs = toQuery(filters, orderby);
	const url = qs ? `${BASE_URL}?${qs}` : BASE_URL;
	const { data } = await api.get<ListResponse<CompetitionMasterDTO>>(url);

	if (data?.status && data.status !== "success") throw new Error(data.message || "List Competitions failed");
	const arr = (data?.data ?? (Array.isArray(data) ? data : undefined)) as CompetitionMasterDTO[] | undefined;
	if (!arr) throw new Error("List Competitions failed: unexpected response");
	return arr;
}

export async function listCompetitionsBySport(sport: "shooting" | "archery" | "boxing" | "taekwondo") {
	return listCompetitions({ sport_type: mapSportKeyToApi(sport) }, "id-desc");
}

export async function getCompetitionById(id: number) {
	const res = await api.get<OneResponse<CompetitionMasterDTO> | CompetitionMasterDTO | any>(`${BASE_URL}/${id}`);
	const payload = res.data;

	if (typeof payload?.status === "string") {
		if (payload.status !== "success") throw new Error(payload.message || "Get Competition failed");
		return (payload as any).data ?? null;
	}
	if (payload && typeof payload === "object" && "id" in payload) return payload as CompetitionMasterDTO;
	if (payload?.data && typeof payload.data === "object") return payload.data as CompetitionMasterDTO;
	return null;
}

export async function addCompetition(payload: Partial<CompetitionMasterDTO>) {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.post<MutateResponse<CompetitionMasterDTO>>(BASE_URL, body);
	if (data?.status && data.status !== "success") throw new Error(data.message || "Create Competition failed");
	return (data as any)?.data ?? data ?? null;
}

export async function updateCompetitionById(id: number, payload: Partial<CompetitionMasterDTO>) {
	const { id: _omit, ...body } = payload as any;
	const { data } = await api.put<MutateResponse<CompetitionMasterDTO>>(`${BASE_URL}/${id}`, body);
	if (data?.status && data.status !== "success") throw new Error(data.message || "Update Competition failed");
	return (data as any)?.data ?? data ?? null;
}

export async function deleteCompetitionById(id: number) {
	const { data } = await api.delete<MutateResponse>(`${BASE_URL}/${id}`);
	if (data?.status && data.status !== "success") throw new Error(data.message || "Delete Competition failed");
}
