export type User = {
	id: number;
	email: string;
	password_hash?: string;
	access_role: string;
	athlete_id: number | null;
	staff_id: number | null;
	is_active: number;
	created_at: string;
};

export type Athlete = {
	id: number;
	first_name: string;
	last_name: string;
	gender: string | null;
	date_of_birth: string | null;
	join_date?: string | null;
	status?: string | null;
	contact_phone?: string | null;
	contact_email?: string | null;
	nationality?: string | null;
	created_at?: string;
	updated_at?: string;
};

export type Sport = { id: number; sport_name: string; description?: string | null; created_at?: string };
