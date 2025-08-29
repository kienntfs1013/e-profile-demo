import { api } from "@/lib/api/client";

export type UserDTO = {
	id: number;
	email: string;
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	role?: string | number;
	gender?: string;
	birthday?: string;
	sport?: string;
	country?: string;
	address?: string;
	district?: string;
	city?: string;
	national_id_card_no?: string;
	passport_no?: string;
	passport_expiry_date?: string;
	profile_picture_path?: string;
	created_at?: string;
	updated_at?: string;
	is_active?: number;
};

export type AthleteDTO = {
	id: number;
	user_id?: number;
	first_name?: string;
	last_name?: string;
	gender?: string;
	date_of_birth?: string;
	contact_phone?: string;
	contact_email?: string;
	nationality?: string;
	athlete_profile_picture_path?: string;
};

type ListResponse<T> = { status: "success" | "error"; message?: string; data: T[] };
type ItemResponse<T> = { status: "success" | "error"; message?: string; data: T };
type RegistryResponse = { status: "success" | "error"; message?: string; data?: number };

export function buildImageUrl(path?: string): string | undefined {
	if (!path) return undefined;
	const base = process.env.NEXT_PUBLIC_EPROFILE_API || "https://api-eprofile.pickleballplus.vn";
	if (path.startsWith("http")) return path;
	if (path.startsWith("/")) return `${base}${path}`;
	return `${base}/${path}`;
}

export function getLoggedInUserId(): number | null {
	try {
		const raw = localStorage.getItem("eprofile_user");
		if (!raw) return null;
		const obj = JSON.parse(raw) as { user_id?: number; id?: number };
		const uid = obj.user_id ?? obj.id;
		return typeof uid === "number" ? uid : null;
	} catch {
		return null;
	}
}

export async function listUsers(
	filters?: Record<string, string | number | boolean | undefined>,
	orderby?: string
): Promise<UserDTO[]> {
	const params = new URLSearchParams();
	if (filters) {
		Object.entries(filters).forEach(([k, v]) => {
			if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
		});
	}
	if (orderby) params.append("orderby", orderby);
	const qs = params.toString();
	const url = qs ? `/api/Users?${qs}` : "/api/Users";
	const { data } = await api.get<ListResponse<UserDTO>>(url);
	if (data.status !== "success") throw new Error(data.message || "List Users failed");
	return data.data;
}

export async function fetchUserByIdFromList(id: number): Promise<UserDTO | null> {
	const { data } = await api.get<ListResponse<UserDTO>>("/api/Users?orderby=id-asc");
	if (data.status !== "success") throw new Error(data.message || "Fetch Users failed");
	return data.data.find((u) => u.id === id) ?? null;
}

export async function getUserById(id: number): Promise<UserDTO | null> {
	const { data } = await api.get<ItemResponse<UserDTO>>(`/api/Users/${id}`);
	if (data.status !== "success") return null;
	return data.data;
}

export async function fetchAthleteByUserId(userId: number): Promise<AthleteDTO | null> {
	const { data } = await api.get<ListResponse<AthleteDTO>>(`/api/Athletes?user_id=${encodeURIComponent(userId)}`);
	if (data.status !== "success") throw new Error(data.message || "Fetch Athletes failed");
	return data.data[0] ?? null;
}

export function mapNationToCountry(nationCode: string): string | undefined {
	if (nationCode === "VIE") return "Việt Nam";
	return undefined;
}

export function mapGenderToVN(g?: "male" | "female" | "other" | ""): string | undefined {
	if (!g) return undefined;
	if (g === "male") return "Nam";
	if (g === "female") return "Nữ";
	return "Khác";
}

export function mapSportToVN(v?: string): string | undefined {
	if (!v) return undefined;
	const s = v.toLowerCase();
	if (s === "archery") return "Bắn cung";
	if (s === "shooting") return "Bắn súng";
	if (s === "boxing") return "Boxing";
	if (s === "taekwondo") return "Taekwondo";
	return undefined;
}

export function parseRoleToInt(role?: unknown): 1 | 2 | undefined {
	const r = String(role ?? "")
		.toLowerCase()
		.trim();
	if (r === "1" || r.includes("athlete") || r.includes("vận") || r.includes("van")) return 1;
	if (r === "2" || r.includes("coach") || r.includes("huấn") || r.includes("huan")) return 2;
	return undefined;
}

export function roleLabelFromInt(v: 1 | 2): string {
	return v === 1 ? "Vận động viên" : "Huấn luyện viên";
}

export async function registerUser(
	payload: {
		email: string;
		password: string;
		access_role?: string;
		created_at?: string;
	} & Partial<UserDTO>
): Promise<{ ok: boolean; id?: number; message?: string }> {
	const body = {
		access_role: payload.access_role ?? "Management",
		created_at: payload.created_at ?? new Date().toISOString().slice(0, 19).replace("T", " "),
		...payload,
	};
	const { data } = await api.post<RegistryResponse>("/api/registry", body);
	return { ok: data.status === "success", id: data.data, message: data.message };
}

export async function updateUser(
	id: number,
	payload: Partial<
		Pick<
			UserDTO,
			| "email"
			| "firstName"
			| "lastName"
			| "phoneNumber"
			| "role"
			| "gender"
			| "birthday"
			| "sport"
			| "country"
			| "address"
			| "district"
			| "city"
			| "national_id_card_no"
			| "passport_no"
			| "passport_expiry_date"
			| "profile_picture_path"
			| "is_active"
		>
	> & { password?: string; access_role?: string; created_at?: string }
): Promise<{ ok: boolean; message?: string }> {
	const body = compact(payload);
	const { data } = await api.put<{ status: "success" | "error"; message?: string }>(`/api/Users/${id}`, body);
	return { ok: data.status === "success", message: data.message };
}

export async function updateUserByIdMerged(
	userId: number,
	patch: Partial<UserDTO> & { password?: string; access_role?: string }
): Promise<void> {
	let current = await getUserById(userId);
	if (!current) current = await fetchUserByIdFromList(userId);
	if (!current) throw new Error("Không tìm thấy người dùng");
	const merged: Record<string, any> = { ...current, ...patch };
	delete merged.id;
	delete merged.created_at;
	delete merged.updated_at;
	const body = compact(merged);
	const { data } = await api.put<{ status: "success" | "error"; message?: string }>(`/api/Users/${userId}`, body);
	if (data?.status !== "success") throw new Error(data?.message || "Cập nhật thất bại");
}

export async function deleteUser(id: number): Promise<{ ok: boolean; message?: string }> {
	const { data } = await api.delete<{ status: "success" | "error"; message?: string }>(`/api/Users/${id}`);
	return { ok: data.status === "success", message: data.message };
}

function compact<T extends Record<string, any>>(obj: T): T {
	const out: any = {};
	Object.entries(obj).forEach(([k, v]) => {
		if (v !== undefined && v !== null) out[k] = v;
	});
	return out;
}
