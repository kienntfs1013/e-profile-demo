"use client";

import type { User } from "@/types/user";
import { api } from "@/lib/api/client";

function generateToken(): string {
	const arr = new Uint8Array(12);
	globalThis.crypto.getRandomValues(arr);
	return Array.from(arr, (v) => v.toString(16).padStart(2, "0")).join("");
}

export type ApiUser = {
	id?: number;
	user_id?: number;
	email: string;
	access_role: string;
	athlete_id: number | null;
	staff_id: number | null;
	is_active: number;
	created_at: string;
};

function mapUserForContext(data: { user_id?: number; id?: number; email: string; access_role: string }): User {
	const uid = data.user_id ?? data.id ?? 0;
	return {
		id: `USR-${String(uid).padStart(3, "0")}`,
		avatar: "/assets/avatar.png",
		firstName: data.email.split("@")[0] || "User",
		lastName: data.access_role || "",
		email: data.email,
	};
}

export interface SignUpParams {
	email: string;
	password: string;
	access_role?: string;
	created_at?: string;
}
export interface SignInWithOAuthParams {
	provider: "google" | "discord";
}
export interface SignInWithPasswordParams {
	email: string;
	password: string;
}
export interface ResetPasswordParams {
	email: string;
}

type LoginResponse = {
	status: "success" | "error";
	message?: string;
	access_token?: string;
	refresh_token?: string;
	expires?: number;
	time?: number;
	data?: ApiUser;
};

class AuthClient {
	async signUp(params: SignUpParams): Promise<{ error?: string }> {
		try {
			const payload = {
				email: params.email,
				password: params.password,
				access_role: params.access_role || "Management",
				created_at: params.created_at || new Date().toISOString().slice(0, 19).replace("T", " "),
			};
			const { data } = await api.post<{ status: string; message: string }>("/api/registry", payload);
			if (data.status !== "success") return { error: data.message || "Đăng ký thất bại" };
			return {};
		} catch (e: any) {
			return { error: e?.response?.data?.message || "Đăng ký thất bại" };
		}
	}

	async signInWithOAuth(_: SignInWithOAuthParams) {
		return { error: "Social authentication not implemented" };
	}

	async signInWithPassword(params: SignInWithPasswordParams): Promise<{
		error?: string;
		accessToken?: string;
		refreshToken?: string;
		userId?: number;
	}> {
		try {
			const { data } = await api.post<LoginResponse>("/api/login", {
				username: params.email,
				password: params.password,
			});

			if (data.status !== "success" || !data.access_token || !data.data) {
				return { error: data.message || "Đăng nhập thất bại" };
			}

			const rawUser = data.data;
			const userId = (rawUser.user_id ?? rawUser.id) as number | undefined;

			localStorage.setItem("eprofile_access_token", data.access_token);
			if (data.refresh_token) localStorage.setItem("eprofile_refresh_token", data.refresh_token);
			localStorage.setItem("eprofile_user", JSON.stringify({ ...rawUser, user_id: userId }));
			localStorage.setItem("custom-auth-token", generateToken());
			localStorage.setItem("eprofile_user_ui", JSON.stringify(mapUserForContext({ ...rawUser, user_id: userId })));

			return {
				accessToken: data.access_token,
				refreshToken: data.refresh_token,
				userId,
			};
		} catch (e: any) {
			return { error: e?.response?.data?.message || "Đăng nhập thất bại" };
		}
	}

	async resetPassword(_: ResetPasswordParams) {
		return { error: "Password reset not implemented by e-profile API" };
	}
	async updatePassword(_: ResetPasswordParams) {
		return { error: "Update password not implemented" };
	}

	async getUser(): Promise<{ data?: User | null; error?: string }> {
		const token = localStorage.getItem("custom-auth-token");
		if (!token) return { data: null };
		const raw = localStorage.getItem("eprofile_user_ui");
		if (raw) {
			try {
				return { data: JSON.parse(raw) as User };
			} catch {}
		}
		return {
			data: {
				id: "USR-000",
				avatar: "/assets/avatar.png",
				firstName: "User",
				lastName: "",
				email: "user@example.com",
			},
		};
	}

	getApiUser(): ApiUser | null {
		const raw = localStorage.getItem("eprofile_user");
		if (!raw) return null;
		try {
			return JSON.parse(raw) as ApiUser;
		} catch {
			return null;
		}
	}

	async signOut() {
		localStorage.removeItem("custom-auth-token");
		localStorage.removeItem("eprofile_access_token");
		localStorage.removeItem("eprofile_refresh_token");
		localStorage.removeItem("eprofile_user");
		localStorage.removeItem("eprofile_user_ui");
		return {};
	}

	hasToken(): boolean {
		if (typeof window === "undefined") return false;
		return Boolean(localStorage.getItem("eprofile_access_token") || localStorage.getItem("custom-auth-token"));
	}
}

export const authClient = new AuthClient();

export function getStoredAccessToken(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("eprofile_access_token");
}
