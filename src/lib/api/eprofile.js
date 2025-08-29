// src/api/eprofile.js
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-eprofile.pickleballplus.vn";

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Đăng ký
export const register = (data) => api.post("/api/registry", data);

// Đăng nhập
export const login = (data) => api.post("/api/login", data);

// Lấy danh sách bảng
export const getTable = (table, token, params = {}) =>
	api.get(`/api/${table}`, {
		headers: { Authorization: `Bearer ${token}` },
		params,
	});

// Lấy chi tiết theo ID
export const getById = (table, id, token) =>
	api.get(`/api/${table}/${id}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
