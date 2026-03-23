"use client";

import * as React from "react";
import {
	buildImageUrl,
	fetchUserByIdFromList,
	getLoggedInUserId,
	getUserById,
	type UserDTO,
} from "@/services/user.service";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";

const LEGACY_DEFAULT_AVATAR_PATTERNS = [
	"pngtree-default-avatar-profile-icon",
	"default-avatar-profile-icon-gray-placeholder",
];

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

const isAthleteRole = (role: any): boolean => {
	if (role == null) return false;
	if (typeof role === "number") return role === 1;
	if (typeof role === "string") {
		const s = role.trim().toLowerCase();
		return s === "1" || s.includes("athlete") || s.includes("vận") || s.includes("van");
	}
	if (typeof role === "object" && "id" in role) return Number((role as any).id) === 1;
	return false;
};

const fmtDate = (v?: string) => (v ? dayjs(v).format("DD/MM/YYYY") : "-");

const isLegacyDefaultAvatar = (value?: string | null): boolean => {
	const s = String(value || "")
		.trim()
		.toLowerCase();
	if (!s) return false;
	return LEGACY_DEFAULT_AVATAR_PATTERNS.some((pattern) => s.includes(pattern));
};

const resolveAvatarSrc = (value?: string | null): string | undefined => {
	const raw = String(value || "").trim();
	if (!raw || isLegacyDefaultAvatar(raw)) return undefined;
	if (/^(blob:|data:|https?:\/\/)/i.test(raw)) return raw;
	const built = buildImageUrl(raw);
	if (!built || isLegacyDefaultAvatar(built)) return undefined;
	return built;
};

type Extra = {
	district?: string;
	city?: string;
	is_active?: number;
	status?: string;
	national_id_card_no?: string;
	passport_no?: string;
	address?: string;
	country?: string;
	phoneNumber?: string;
	birthday?: string;
	gender?: string;
	role?: any;
	profile_picture_path?: string;
	avatar?: string;
};

export function GeneralSection({ id }: { id?: number | string }) {
	const [viewerIsAthlete, setViewerIsAthlete] = React.useState(false);
	const [u, setU] = React.useState<(UserDTO & Extra) | null>(null);

	React.useEffect(() => {
		let off = false;

		(async () => {
			const viewerId = getLoggedInUserId?.();

			if (viewerId) {
				try {
					const me =
						(await getUserById(viewerId).catch(() => null)) ??
						(await fetchUserByIdFromList(viewerId).catch(() => null));
					if (!off && me) setViewerIsAthlete(isAthleteRole(me.role));
				} catch {}
			}

			const targetId = id != null && !Number.isNaN(Number(id)) ? Number(id) : viewerId || undefined;
			if (!targetId) return;

			try {
				const user =
					(await getUserById(targetId).catch(() => null)) ?? (await fetchUserByIdFromList(targetId).catch(() => null));
				if (!off) setU((user as any) ?? null);
			} catch {
				if (!off) setU(null);
			}
		})();

		return () => {
			off = true;
		};
	}, [id]);

	const statusText =
		(u as any)?.status ?? (u?.is_active != null ? (u.is_active === 1 ? "Đang hoạt động" : "Tạm ngưng") : "-");

	const avatarSrc = resolveAvatarSrc((u as any)?.profile_picture_path ?? (u as any)?.avatar);

	const displayName =
		[u?.lastName, u?.firstName].filter(Boolean).join(" ").trim() || u?.email?.split("@")[0] || "Người dùng";

	const allFields: { key: string; label: string; value: React.ReactNode }[] = [
		{ key: "lastName", label: "Họ", value: u?.lastName ?? "-" },
		{ key: "firstName", label: "Tên", value: u?.firstName ?? "-" },
		{ key: "email", label: "Email", value: u?.email ?? "-" },
		{ key: "phoneNumber", label: "Số điện thoại", value: u?.phoneNumber ?? (u as any)?.phone ?? "-" },
		{ key: "role", label: "Vai trò", value: roleLabel(u?.role) },
		{ key: "status", label: "Trạng thái", value: statusText },
		{ key: "gender", label: "Giới tính", value: genderLabel(u?.gender) },
		{ key: "birthday", label: "Ngày sinh", value: fmtDate(u?.birthday) },
		{ key: "national_id_card_no", label: "CMND/CCCD", value: u?.national_id_card_no ?? "-" },
		{ key: "passport_no", label: "Hộ chiếu", value: u?.passport_no ?? "-" },
		{ key: "address", label: "Địa chỉ", value: [u?.address, u?.district, u?.city].filter(Boolean).join(", ") || "-" },
		{ key: "district", label: "Quận/Huyện", value: u?.district ?? "-" },
		{ key: "city", label: "Tỉnh/Thành", value: u?.city ?? "-" },
		{ key: "country", label: "Quốc gia", value: u?.country ?? "-" },
	];

	const hiddenForAthlete = new Set([
		"email",
		"phoneNumber",
		"status",
		"national_id_card_no",
		"passport_no",
		"address",
		"district",
		"city",
	]);

	const fields = viewerIsAthlete ? allFields.filter((f) => !hiddenForAthlete.has(f.key)) : allFields;

	return (
		<Stack spacing={2.5}>
			<Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, "& > .item": { minWidth: 0 } }}>
				{fields.map((f) => (
					<Box
						key={f.key}
						className="item"
						sx={{ flex: { xs: "1 1 100%", md: "1 1 260px" }, maxWidth: { xs: "100%", md: "100%" } }}
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
		</Stack>
	);
}
