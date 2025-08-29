"use client";

import * as React from "react";
import type { User } from "@/models/user";
import { fetchUserByIdFromList, getLoggedInUserId, type UserDTO } from "@/services/user.service";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";

const genderLabel = (v?: string) => {
	if (!v) return "-";
	const s = v.toLowerCase();
	if (s === "male" || s.includes("nam")) return "Nam";
	if (s === "female" || s.includes("nữ") || s.includes("nu")) return "Nữ";
	return "Khác";
};

const roleLabel = (v?: any) => {
	const s = String(v ?? "").toLowerCase();
	if (s === "1" || s.includes("athlete") || s.includes("vận") || s.includes("van")) return "Vận động viên";
	if (s === "2" || s.includes("coach") || s.includes("huấn") || s.includes("huan")) return "Huấn luyện viên";
	return s || "-";
};

const fmtDate = (v?: string) => (v ? dayjs(v).format("DD/MM/YYYY") : "-");
const fmtDateTime = (v?: string) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "-");

type Extra = {
	id?: number | string;
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	sport?: string;
	gender?: string;
	birthday?: string;
	created_at?: string;
	updated_at?: string;
	createdAt?: string;
	updatedAt?: string;
	address?: string;
	district?: string;
	city?: string;
	country?: string;
	national_id_card_no?: string;
	passport_no?: string;
	is_active?: number;
	status?: string;
	role?: any;
	profile_picture_path?: string;
};

export function GeneralSection({ user }: { user: User & Partial<Extra> }) {
	const initialId =
		(user as any)?.id != null && !Number.isNaN(Number((user as any).id))
			? Number((user as any).id)
			: getLoggedInUserId();

	const [apiUser, setApiUser] = React.useState<UserDTO | null>(null);

	React.useEffect(() => {
		let off = false;
		const load = async () => {
			if (!initialId) return;
			try {
				const u = await fetchUserByIdFromList(initialId);
				if (!off) setApiUser(u);
			} catch {
				if (!off) setApiUser(null);
			}
		};
		load();
		return () => {
			off = true;
		};
	}, [initialId]);

	const u = { ...(user as any), ...(apiUser ?? {}) } as Partial<UserDTO> & Partial<Extra> & Record<string, any>;

	const created = (u.created_at as string) || (u.createdAt as string);

	const fields: { label: string; value: React.ReactNode }[] = [
		{ label: "Họ", value: u.lastName ?? "-" },
		{ label: "Tên", value: u.firstName ?? "-" },
		{ label: "Email", value: u.email ?? "-" },
		{ label: "Số điện thoại", value: u.phoneNumber ?? (u as any).phone ?? "-" },
		{ label: "Vai trò", value: roleLabel(u.role) },
		{ label: "Trạng thái", value: u.status },
		{ label: "Giới tính", value: genderLabel(u.gender) },
		{ label: "Ngày sinh", value: fmtDate(u.birthday) },
		{ label: "CMND/CCCD", value: u.national_id_card_no ?? "-" },
		{ label: "Hộ chiếu", value: u.passport_no ?? "-" },
		{
			label: "Địa chỉ",
			value: [u.address, u.city, u.district].filter(Boolean).join(", ") || "-",
		},
		{ label: "Quận/Huyện", value: u.district ?? "-" },
		{ label: "Tỉnh/Thành", value: u.city ?? "-" },
		{ label: "Quốc gia", value: u.country ?? "-" },
		{ label: "Ngày tham gia", value: fmtDateTime(created) },
	];

	return (
		<Box
			sx={{
				display: "flex",
				flexWrap: "wrap",
				gap: 2,
				"& > .item": { minWidth: 0 },
			}}
		>
			{fields.map((f, i) => (
				<Box
					key={i}
					className="item"
					sx={{
						flex: { xs: "1 1 100%", md: "1 1 260px" },
						maxWidth: { xs: "100%", md: "100%" },
					}}
				>
					<Box
						sx={{
							width: "100%",
							border: "1px solid",
							borderColor: "divider",
							borderRadius: 1.5,
							p: 1.5,
							height: "100%",
							boxSizing: "border-box",
						}}
					>
						<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
							{f.label}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{String(f.value ?? "-")}
						</Typography>
					</Box>
				</Box>
			))}
		</Box>
	);
}
