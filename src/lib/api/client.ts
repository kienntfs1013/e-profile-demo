import axios from "axios";

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_EPROFILE_API || "https://api-eprofile.pickleballplus.vn",
	timeout: 30000,
});

function getAccessToken() {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("eprofile_access_token");
}

api.interceptors.request.use((config) => {
	const token = getAccessToken();
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

api.interceptors.response.use(
	(res) => res,
	(err) => {
		const status = err?.response?.status;
		if (typeof window !== "undefined" && status === 401) {
			localStorage.removeItem("eprofile_access_token");
			localStorage.removeItem("eprofile_refresh_token");
			localStorage.removeItem("eprofile_user");
			localStorage.removeItem("eprofile_user_ui");
			localStorage.removeItem("custom-auth-token");
		}
		return Promise.reject(err);
	}
);
