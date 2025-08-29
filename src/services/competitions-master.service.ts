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

type ListResponse<T> = { status: "success" | "error"; message?: string; data: T[] };

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

export async function listCompetitions(
	filters?: Record<string, string | number | boolean | undefined>,
	orderby?: string
) {
	const qs = toQuery(filters, orderby);
	const url = qs ? `/api/Competitions?${qs}` : "/api/Competitions";
	const { data } = await api.get<ListResponse<CompetitionMasterDTO>>(url);
	if (data.status !== "success") throw new Error(data.message || "List Competitions failed");
	return data.data;
}

export function mapSportKeyToApi(v: "shooting" | "archery" | "boxing" | "taekwondo"): string {
	if (v === "shooting") return "Bắn súng";
	if (v === "archery") return "Bắn cung";
	if (v === "boxing") return "Boxing";
	return "Taekwondo";
}

export async function listCompetitionsBySport(sport: "shooting" | "archery" | "boxing" | "taekwondo") {
	return listCompetitions({ sport_type: mapSportKeyToApi(sport) }, "id-desc");
}
