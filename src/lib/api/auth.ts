import api from "./client";

export type AccessRole = "Management" | "Coach" | "Athlete" | "Medical" | string;

export async function register(payload: {
	email: string;
	password: string;
	access_role: AccessRole;
	created_at?: string;
	// Có thể bổ sung các cột trong ERD (Users) nếu backend cho phép
}) {
	const { data } = await api.post("/api/registry", payload);
	return data; // { status, message }
}

export type LoginResponse = {
	status: "success";
	access_token: string;
	refresh_token?: string;
	data: {
		user_id: number;
		email: string;
		access_role: AccessRole;
		athlete_id: number | null;
		staff_id: number | null;
		is_active: 0 | 1;
		created_at: string;
	};
	expires?: number;
	time?: number;
};

export async function login(payload: { username: string; password: string }) {
	const { data } = await api.post<LoginResponse>("/api/login", payload);
	// Lưu token (dev nhanh: localStorage)
	if (data?.access_token) {
		localStorage.setItem("eprofile_access_token", data.access_token);
	}
	if (data?.refresh_token) {
		localStorage.setItem("eprofile_refresh_token", data.refresh_token);
	}
	localStorage.setItem("eprofile_user", JSON.stringify(data.data));
	return data;
}

export function logout() {
	localStorage.removeItem("eprofile_access_token");
	localStorage.removeItem("eprofile_refresh_token");
	localStorage.removeItem("eprofile_user");
}
