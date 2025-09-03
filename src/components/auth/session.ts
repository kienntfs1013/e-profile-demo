"use client";

export type ServerUserSession = {
	user_id: number;
	email: string;
	access_role: string;
	athlete_id: number | null;
	staff_id: number | null;
	is_active: number;
	created_at: string;
};

export type UiUserSession = {
	id: string;
	avatar?: string;
	firstName?: string;
	lastName?: string;
	email: string;
};

export function getAccessToken(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("eprofile_access_token");
}

export function readServerUser(): ServerUserSession | null {
	if (typeof window === "undefined") return null;
	const raw = localStorage.getItem("eprofile_user");
	if (!raw) return null;
	try {
		return JSON.parse(raw) as ServerUserSession;
	} catch {
		return null;
	}
}

export function readUiUser(): UiUserSession | null {
	if (typeof window === "undefined") return null;
	const raw = localStorage.getItem("eprofile_user_ui");
	if (!raw) return null;
	try {
		return JSON.parse(raw) as UiUserSession;
	} catch {
		return null;
	}
}

export function getLoggedInUserId(): number | null {
	const s = readServerUser();
	if (s?.user_id != null) return s.user_id;

	const ui = readUiUser();
	if (ui?.id) {
		const m = ui.id.match(/(\d+)$/);
		if (m) return Number(m[1]);
	}
	return null;
}

export function getLoggedInEmail(): string | null {
	const s = readServerUser();
	if (s?.email) return s.email;
	const ui = readUiUser();
	if (ui?.email) return ui.email;
	return null;
}
