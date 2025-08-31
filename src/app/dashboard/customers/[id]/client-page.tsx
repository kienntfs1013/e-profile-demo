"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	buildImageUrl,
	fetchAthleteByUserId,
	fetchUserByIdFromList,
	getLoggedInUserId,
	getUserById,
	type UserDTO,
} from "@/services/user.service";
import { Avatar, Box, Button, MenuItem, Paper, Stack, TextField, Typography, useMediaQuery } from "@mui/material";

import { AchievementSection } from "@/components/customer-detail/achievement-section";
import { GeneralSection } from "@/components/customer-detail/general-section";
import { HealthSection } from "@/components/customer-detail/health-section";
import { SectionCard } from "@/components/customer-detail/section-card";
import { TrainingSection } from "@/components/customer-detail/training-section";

const sportLabel = (v?: string) => {
	if (!v) return "-";
	const s = v.toLowerCase();
	if (s.includes("shooting") || s.includes("bắn súng")) return "Bắn súng";
	if (s.includes("archery") || s.includes("bắn cung")) return "Bắn cung";
	if (s.includes("taekwondo")) return "Taekwondo";
	if (s.includes("boxing")) return "Boxing";
	return v;
};

type DetailUser = {
	id: string;
	name?: string;
	avatar?: string;
	email?: string;
	role?: string;
	age?: number;
	phone?: string;
	sport?: "shooting" | "archery" | "taekwondo" | "boxing" | string;
	gender?: "male" | "female" | "other" | string;
	birthday?: string;
	status?: string;
	createdAt?: string;
	address?: {
		street?: string;
		city?: string;
		state?: string;
	};
};

type TabKey = "general" | "health" | "training" | "achievement";
const TABS: { key: TabKey; label: string }[] = [
	{ key: "general", label: "Thông tin chung" },
	{ key: "health", label: "Sức khỏe" },
	{ key: "training", label: "Tập luyện" },
	{ key: "achievement", label: "Thành tích" },
];

function toName(u: Partial<UserDTO>, a?: any) {
	const ln = (u.lastName ?? a?.last_name ?? "").trim();
	const fn = (u.firstName ?? a?.first_name ?? "").trim();
	const byName = [ln, fn].filter(Boolean).join(" ").trim();
	if (byName) return byName;
	return u.email ? u.email.split("@")[0] : "Người dùng";
}
function toGenderCode(g?: string): "male" | "female" | "other" | undefined {
	const s = (g ?? "").toLowerCase();
	if (!s) return undefined;
	if (s.includes("nam") || s === "male") return "male";
	if (s.includes("nữ") || s.includes("nu") || s === "female") return "female";
	return "other";
}
function toSportCode(s?: string): "shooting" | "archery" | "taekwondo" | "boxing" | undefined {
	const v = (s ?? "").toLowerCase();
	if (!v) return undefined;
	if (v.includes("bắn cung") || v.includes("archery")) return "archery";
	if (v.includes("bắn súng") || v.includes("shooting")) return "shooting";
	if (v.includes("taekwondo")) return "taekwondo";
	if (v.includes("boxing")) return "boxing";
	return undefined;
}
function toRoleLabel(role: unknown): string {
	const r = String(role ?? "").toLowerCase();
	if (r === "1" || /athlete|vận|van/.test(r)) return "Vận động viên";
	if (r === "2" || /coach|huấn|huan/.test(r)) return "Huấn luyện viên";
	return r || "-";
}
function isAthleteRole(role: unknown): boolean {
	if (role == null) return false;
	if (typeof role === "number") return role === 1;
	const s = String(role).toLowerCase().trim();
	if (s === "1") return true;
	if (typeof role === "object" && "id" in (role as any)) return Number((role as any).id) === 1;
	return /athlete|vận|van/.test(s);
}
function calcAge(birthday?: string): number | undefined {
	if (!birthday) return undefined;
	const d = new Date(birthday);
	if (isNaN(+d)) return undefined;
	const now = new Date();
	let age = now.getFullYear() - d.getFullYear();
	const m = now.getMonth() - d.getMonth();
	if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
	return age;
}

export default function ClientPage({ id }: { id: string }): React.JSX.Element {
	const router = useRouter();
	const isDesktop = useMediaQuery("(min-width:900px)");

	const [tab, setTab] = React.useState<TabKey>("general");
	const [loading, setLoading] = React.useState(true);
	const [user, setUser] = React.useState<DetailUser | undefined>(undefined);
	const [viewerIsAthlete, setViewerIsAthlete] = React.useState(false);

	React.useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				setLoading(true);

				const viewerId = getLoggedInUserId?.();
				if (viewerId) {
					const viewer =
						(await getUserById(viewerId).catch(() => null)) ??
						(await fetchUserByIdFromList(viewerId).catch(() => null));
					if (!cancelled && viewer) setViewerIsAthlete(isAthleteRole(viewer.role));
				}

				const numericId = Number(id);
				if (!Number.isFinite(numericId)) {
					if (!cancelled) setUser(undefined);
					return;
				}

				let apiUser = await getUserById(numericId);
				if (!apiUser) apiUser = await fetchUserByIdFromList(numericId);
				const athlete = await fetchAthleteByUserId(numericId).catch(() => null);

				if (!apiUser) {
					if (!cancelled) setUser(undefined);
					return;
				}

				const mapped: DetailUser = {
					id: String(apiUser.id),
					name: toName(apiUser, athlete ?? undefined),
					avatar:
						buildImageUrl(apiUser.profile_picture_path) ||
						buildImageUrl(athlete?.athlete_profile_picture_path) ||
						"/assets/avatar.png",
					email: apiUser.email ?? undefined,
					role: toRoleLabel(apiUser.role),
					age: calcAge(apiUser.birthday ?? athlete?.date_of_birth),
					phone: apiUser.phoneNumber ?? athlete?.contact_phone ?? undefined,
					sport: toSportCode(apiUser.sport) ?? apiUser.sport ?? undefined,
					gender: toGenderCode(apiUser.gender ?? athlete?.gender),
					birthday: (apiUser.birthday ?? athlete?.date_of_birth) || undefined,
					status: apiUser.is_active === 1 ? "Đang hoạt động" : "Tạm ngưng",
					createdAt: apiUser.created_at || undefined,
					address: {
						street: apiUser.address || undefined,
						city: apiUser.city || undefined,
						state: apiUser.district || undefined,
					},
				};

				if (!cancelled) setUser(mapped);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [id]);

	if (loading) {
		return (
			<Box sx={{ p: 4, width: "100%", color: "text.secondary" }}>
				<Typography>Đang tải dữ liệu…</Typography>
			</Box>
		);
	}

	if (!user) {
		return (
			<Box sx={{ p: 4, width: "100%" }}>
				<Typography variant="h5">Không tìm thấy người dùng</Typography>
				<Box mt={2}>
					<Button variant="outlined" onClick={() => router.push("/dashboard/customers")}>
						Quay lại danh sách
					</Button>
				</Box>
			</Box>
		);
	}

	return (
		<Stack spacing={2} sx={{ px: { xs: 1.5, md: 2 }, pb: 3, width: "100%" }}>
			<Paper
				elevation={0}
				sx={{
					width: "100%",
					borderRadius: 2,
					p: { xs: 2, md: 3 },
					border: "1px solid",
					borderColor: "divider",
				}}
			>
				<Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%" }}>
					<Avatar src={user.avatar} alt={user.name} sx={{ width: 72, height: 72, border: "2px solid #fff" }} />
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography variant="h5" sx={{ fontWeight: 700 }}>
							{user.name}
						</Typography>
						{Boolean(user.sport) && (
							<Typography variant="h6" color="text.secondary" sx={{ mt: 0.25, display: "block" }}>
								{sportLabel(user.sport)}
							</Typography>
						)}
					</Box>
				</Stack>
			</Paper>

			{!viewerIsAthlete &&
				(isDesktop ? (
					<Box sx={{ display: "flex", gap: 1, mb: 2, width: "100%" }}>
						{TABS.map((t) => (
							<Button
								key={t.key}
								onClick={() => setTab(t.key)}
								variant={tab === t.key ? "contained" : "outlined"}
								color="primary"
								disableElevation
								sx={{
									flexBasis: "25%",
									maxWidth: "25%",
									borderRadius: 2,
									textTransform: "none",
									fontWeight: 600,
									py: 1.25,
								}}
							>
								{t.label}
							</Button>
						))}
					</Box>
				) : (
					<TextField
						select
						fullWidth
						size="small"
						label="Chọn mục"
						value={tab}
						onChange={(e) => setTab(e.target.value as TabKey)}
					>
						{TABS.map((t) => (
							<MenuItem key={t.key} value={t.key}>
								{t.label}
							</MenuItem>
						))}
					</TextField>
				))}

			<SectionCard>
				{tab === "general" && <GeneralSection id={user.id} />}

				{!viewerIsAthlete && tab === "health" && <HealthSection user={user as any} />}
				{!viewerIsAthlete && tab === "training" && <TrainingSection user={user as any} />}
				{!viewerIsAthlete && tab === "achievement" && <AchievementSection user={user as any} />}
			</SectionCard>
		</Stack>
	);
}
