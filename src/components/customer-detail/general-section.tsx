"use client";

import * as React from "react";
import type { User } from "@/models/user";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";

const sportLabel = (v?: string) => {
	if (!v) return "-";
	if (v === "shooting") return "Bắn súng";
	if (v === "archery") return "Bắn cung";
	if (v === "taekwondo") return "Taekwondo";
	if (v === "boxing") return "Boxing";
	return "-";
};
const genderLabel = (v?: string) => {
	if (!v) return "-";
	if (v === "male") return "Nam";
	if (v === "female") return "Nữ";
	if (v === "other") return "Khác";
	return "-";
};

export function GeneralSection({ user }: { user: User }) {
	const fields: { label: string; value: React.ReactNode }[] = [
		{ label: "Họ và tên", value: user.name || "-" },
		{ label: "Email", value: user.email || "-" },
		{ label: "Vai trò", value: user.role ?? "-" },
		{ label: "Tuổi", value: user.age ?? "-" },
		{ label: "Số điện thoại", value: user.phone || "-" },
		{ label: "Bộ môn", value: sportLabel(user.sport) },
		{ label: "Giới tính", value: genderLabel(user.gender) },
		{
			label: "Ngày sinh",
			value: user.birthday ? dayjs(user.birthday).format("DD/MM/YYYY") : "-",
		},
		{ label: "Trạng thái", value: user.status ?? "-" },
		{
			label: "Ngày tham gia",
			value: user.createdAt ? dayjs(user.createdAt).format("DD/MM/YYYY") : "-",
		},
		{
			label: "Địa chỉ",
			value: [user.address?.street, user.address?.city, user.address?.state].filter(Boolean).join(", ") || "-",
		},
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
							{f.value}
						</Typography>
					</Box>
				</Box>
			))}
		</Box>
	);
}
