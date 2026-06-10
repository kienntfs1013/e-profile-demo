"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { listRoles, type RoleDTO } from "@/services/role.service";
import {
	buildImageUrl,
	calcAge,
	extractRoleId,
	fullName,
	listAllUsers,
	normalizeGender,
	normalizeSport,
	type SportCode,
	type UserDTO,
} from "@/services/user.service";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import type { ApexOptions } from "apexcharts";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { PauseCircleIcon } from "@phosphor-icons/react/dist/ssr/PauseCircle";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { TrophyIcon } from "@phosphor-icons/react/dist/ssr/Trophy";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/ssr/UsersThree";

import { Chart } from "@/components/core/chart";

const SPORT_ORDER: SportCode[] = ["shooting", "archery", "taekwondo", "boxing"];

function sportLabelVi(code: SportCode): string {
	switch (code) {
		case "shooting":
			return "Bắn súng";
		case "archery":
			return "Bắn cung";
		case "taekwondo":
			return "Taekwondo";
		case "boxing":
			return "Boxing";
		default:
			return "Chưa phân loại";
	}
}

type RoleView = "athlete" | "coach" | "manager" | "admin" | "other";

function roleViewFrom(roleId?: number): RoleView {
	switch (roleId) {
		case 1:
			return "athlete";
		case 2:
			return "coach";
		case 3:
			return "manager";
		case 4:
			return "admin";
		default:
			return "other";
	}
}

const ROLE_VIEW_LABEL: Record<RoleView, string> = {
	athlete: "Vận động viên",
	coach: "Huấn luyện viên",
	manager: "Quản lý nhà nước",
	admin: "Quản trị viên",
	other: "Khác",
};

function tsOf(u: UserDTO): number {
	const raw = u.updated_at || u.created_at;
	const t = raw ? new Date(raw).getTime() : NaN;
	return Number.isNaN(t) ? 0 : t;
}

function isThisMonth(raw?: string): boolean {
	if (!raw) return false;
	const d = new Date(raw);
	if (Number.isNaN(+d)) return false;
	const now = new Date();
	return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

interface Stats {
	total: number;
	active: number;
	inactive: number;
	newThisMonth: number;
	byRole: { key: RoleView; label: string; count: number }[];
	bySport: { key: SportCode; label: string; count: number }[];
	byGender: { label: string; count: number }[];
	avgAge: number | null;
}

function computeStats(users: UserDTO[], roleMap: Record<number, string>): Stats {
	const total = users.length;
	let active = 0;
	let inactive = 0;
	let newThisMonth = 0;

	const roleCount = new Map<RoleView, number>();
	const sportCount = new Map<SportCode, number>();
	const genderCount = new Map<string, number>();

	let ageSum = 0;
	let ageN = 0;

	for (const u of users) {
		if (u.is_active === 0) inactive++;
		else active++;

		if (isThisMonth(u.created_at)) newThisMonth++;

		const rv = roleViewFrom(extractRoleId(u.role));
		roleCount.set(rv, (roleCount.get(rv) ?? 0) + 1);

		const sport = normalizeSport(u.sport);
		sportCount.set(sport, (sportCount.get(sport) ?? 0) + 1);

		const g = normalizeGender((u as { gender?: string | number | null }).gender);
		genderCount.set(g, (genderCount.get(g) ?? 0) + 1);

		const age = calcAge(u.birthday);
		if (typeof age === "number") {
			ageSum += age;
			ageN++;
		}
	}

	const roleOrder: RoleView[] = ["athlete", "coach", "manager", "admin", "other"];
	const byRole = roleOrder
		.map((key) => ({
			key,
			label: ROLE_VIEW_LABEL[key],
			count: roleCount.get(key) ?? 0,
		}))
		.filter((r) => r.count > 0);

	const bySport = SPORT_ORDER.concat([""] as SportCode[])
		.map((key) => ({ key, label: sportLabelVi(key), count: sportCount.get(key) ?? 0 }))
		.filter((s) => s.count > 0);

	const byGender = ["Nam", "Nữ", "Khác", "-"]
		.map((label) => ({ label: label === "-" ? "Chưa rõ" : label, count: genderCount.get(label) ?? 0 }))
		.filter((g) => g.count > 0);

	// roleMap is reserved for future role-name display; kept for API parity.
	void roleMap;

	return {
		total,
		active,
		inactive,
		newThisMonth,
		byRole,
		bySport,
		byGender,
		avgAge: ageN > 0 ? Math.round(ageSum / ageN) : null,
	};
}

function KpiCard({
	title,
	value,
	icon,
	color,
	caption,
}: {
	title: string;
	value: React.ReactNode;
	icon: React.ReactNode;
	color: string;
	caption?: string;
}): React.JSX.Element {
	return (
		<Card sx={{ height: "100%" }}>
			<CardContent>
				<Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
					<Stack spacing={0.5}>
						<Typography color="text.secondary" variant="overline">
							{title}
						</Typography>
						<Typography variant="h4">{value}</Typography>
						{caption ? (
							<Typography color="text.secondary" variant="caption">
								{caption}
							</Typography>
						) : null}
					</Stack>
					<Avatar sx={{ bgcolor: color, height: 56, width: 56 }}>{icon}</Avatar>
				</Stack>
			</CardContent>
		</Card>
	);
}

function BreakdownList({
	title,
	rows,
	total,
	color,
}: {
	title: string;
	rows: { label: string; count: number }[];
	total: number;
	color: "primary" | "success" | "warning" | "info";
}): React.JSX.Element {
	return (
		<Card sx={{ height: "100%" }}>
			<CardHeader title={title} />
			<Divider />
			<CardContent>
				<Stack spacing={2.5}>
					{rows.length === 0 ? (
						<Typography color="text.secondary" variant="body2">
							Không có dữ liệu
						</Typography>
					) : (
						rows.map((r) => {
							const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
							return (
								<Stack key={r.label} spacing={0.75}>
									<Stack direction="row" justifyContent="space-between" alignItems="center">
										<Typography variant="body2">{r.label}</Typography>
										<Typography variant="body2" color="text.secondary">
											{r.count} ({pct}%)
										</Typography>
									</Stack>
									<LinearProgress
										variant="determinate"
										value={pct}
										color={color}
										sx={{ height: 8, borderRadius: 4 }}
									/>
								</Stack>
							);
						})
					)}
				</Stack>
			</CardContent>
		</Card>
	);
}

export default function AdministrationPage(): React.JSX.Element {
	const router = useRouter();
	const theme = useTheme();

	const [users, setUsers] = React.useState<UserDTO[]>([]);
	const [roles, setRoles] = React.useState<RoleDTO[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [refreshing, setRefreshing] = React.useState(false);

	const load = React.useCallback(async () => {
		setError(null);
		try {
			const [userList, roleList] = await Promise.all([
				listAllUsers(undefined, "id-asc"),
				listRoles(undefined, "id-asc").catch(() => [] as RoleDTO[]),
			]);
			setUsers(userList);
			setRoles(roleList);
		} catch (e) {
			setError((e as Error)?.message || "Không thể tải dữ liệu hệ thống");
		}
	}, []);

	React.useEffect(() => {
		(async () => {
			setLoading(true);
			await load();
			setLoading(false);
		})();
	}, [load]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await load();
		setRefreshing(false);
	};

	const roleMap = React.useMemo(
		() => Object.fromEntries(roles.map((r) => [r.id, r.name])) as Record<number, string>,
		[roles]
	);

	const stats = React.useMemo(() => computeStats(users, roleMap), [users, roleMap]);

	const recentUsers = React.useMemo(
		() =>
			[...users]
				.sort((a, b) => tsOf(b) - tsOf(a) || Number(b.id) - Number(a.id))
				.slice(0, 8),
		[users]
	);

	const roleChartOptions: ApexOptions = React.useMemo(
		() => ({
			chart: { background: "transparent" },
			colors: [
				theme.palette.primary.main,
				theme.palette.success.main,
				theme.palette.warning.main,
				theme.palette.info.main,
				theme.palette.error.main,
			],
			dataLabels: { enabled: false },
			labels: stats.byRole.map((r) => r.label),
			legend: { show: true, position: "bottom" },
			plotOptions: { pie: { donut: { size: "70%" } } },
			stroke: { width: 0 },
			theme: { mode: theme.palette.mode },
			tooltip: { fillSeriesColor: false },
		}),
		[stats.byRole, theme]
	);

	const sportChartOptions: ApexOptions = React.useMemo(
		() => ({
			chart: { background: "transparent", toolbar: { show: false } },
			colors: [theme.palette.primary.main],
			dataLabels: { enabled: false },
			grid: { borderColor: theme.palette.divider },
			plotOptions: { bar: { borderRadius: 6, columnWidth: "45%" } },
			theme: { mode: theme.palette.mode },
			tooltip: { theme: theme.palette.mode },
			xaxis: { categories: stats.bySport.map((s) => s.label) },
		}),
		[stats.bySport, theme]
	);

	if (loading) {
		return (
			<Stack spacing={3}>
				<Skeleton variant="text" width={280} height={40} />
				<Grid container spacing={3}>
					{Array.from({ length: 4 }).map((_, i) => (
						<Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
							<Skeleton variant="rounded" height={120} />
						</Grid>
					))}
				</Grid>
				<Skeleton variant="rounded" height={360} />
			</Stack>
		);
	}

	return (
		<Stack spacing={3}>
			<Stack
				direction={{ xs: "column", sm: "row" }}
				spacing={2}
				justifyContent="space-between"
				alignItems={{ xs: "stretch", sm: "center" }}
			>
				<Stack spacing={0.5}>
					<Typography variant="h4">Quản trị hệ thống</Typography>
					<Typography color="text.secondary" variant="body2">
						Tổng quan toàn bộ người dùng, vai trò và bộ môn trong hệ thống E-Profile
					</Typography>
				</Stack>
				<Button
					variant="outlined"
					startIcon={<ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />}
					onClick={handleRefresh}
					disabled={refreshing}
				>
					{refreshing ? "Đang tải lại..." : "Làm mới"}
				</Button>
			</Stack>

			{error ? <Alert severity="error">{error}</Alert> : null}

			<Grid container spacing={3}>
				<Grid size={{ xs: 12, sm: 6, lg: 3 }}>
					<KpiCard
						title="Tổng người dùng"
						value={stats.total}
						icon={<UsersThreeIcon fontSize="var(--icon-fontSize-lg)" />}
						color={theme.palette.primary.main}
						caption={stats.avgAge != null ? `Độ tuổi trung bình ${stats.avgAge}` : undefined}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, lg: 3 }}>
					<KpiCard
						title="Đang hoạt động"
						value={stats.active}
						icon={<CheckCircleIcon fontSize="var(--icon-fontSize-lg)" />}
						color={theme.palette.success.main}
						caption={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% tổng số`}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, lg: 3 }}>
					<KpiCard
						title="Tạm ngưng"
						value={stats.inactive}
						icon={<PauseCircleIcon fontSize="var(--icon-fontSize-lg)" />}
						color={theme.palette.warning.main}
						caption={`${stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}% tổng số`}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, lg: 3 }}>
					<KpiCard
						title="Mới trong tháng"
						value={stats.newThisMonth}
						icon={<ShieldCheckIcon fontSize="var(--icon-fontSize-lg)" />}
						color={theme.palette.info.main}
						caption="Tài khoản tạo trong tháng này"
					/>
				</Grid>
			</Grid>

			<Grid container spacing={3}>
				<Grid size={{ xs: 12, md: 5 }}>
					<Card sx={{ height: "100%" }}>
						<CardHeader title="Phân bổ theo vai trò" avatar={<ShieldCheckIcon />} />
						<Divider />
						<CardContent>
							{stats.byRole.length > 0 ? (
								<Chart
									height={320}
									type="donut"
									width="100%"
									options={roleChartOptions}
									series={stats.byRole.map((r) => r.count)}
								/>
							) : (
								<Typography color="text.secondary" variant="body2">
									Không có dữ liệu
								</Typography>
							)}
						</CardContent>
					</Card>
				</Grid>
				<Grid size={{ xs: 12, md: 7 }}>
					<Card sx={{ height: "100%" }}>
						<CardHeader title="Số lượng theo bộ môn" avatar={<TrophyIcon />} />
						<Divider />
						<CardContent>
							{stats.bySport.length > 0 ? (
								<Chart
									height={320}
									type="bar"
									width="100%"
									options={sportChartOptions}
									series={[{ name: "Người dùng", data: stats.bySport.map((s) => s.count) }]}
								/>
							) : (
								<Typography color="text.secondary" variant="body2">
									Không có dữ liệu
								</Typography>
							)}
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			<Grid container spacing={3}>
				<Grid size={{ xs: 12, md: 6 }}>
					<BreakdownList
						title="Cơ cấu vai trò"
						rows={stats.byRole.map((r) => ({ label: r.label, count: r.count }))}
						total={stats.total}
						color="primary"
					/>
				</Grid>
				<Grid size={{ xs: 12, md: 6 }}>
					<Stack spacing={3} sx={{ height: "100%" }}>
						<BreakdownList
							title="Giới tính"
							rows={stats.byGender}
							total={stats.total}
							color="info"
						/>
					</Stack>
				</Grid>
			</Grid>

			<Card>
				<CardHeader
					title="Người dùng mới nhất"
					avatar={<UsersThreeIcon />}
					action={
						<Button size="small" onClick={() => router.push("/dashboard/usersManagement")}>
							Xem tất cả
						</Button>
					}
				/>
				<Divider />
				<TableContainer>
					<Table sx={{ minWidth: 720 }}>
						<TableHead>
							<TableRow>
								<TableCell>Người dùng</TableCell>
								<TableCell>Email</TableCell>
								<TableCell>Vai trò</TableCell>
								<TableCell align="center">Bộ môn</TableCell>
								<TableCell align="center">Trạng thái</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{recentUsers.length > 0 ? (
								recentUsers.map((u) => {
									const rid = extractRoleId(u.role);
									const roleLabel = (rid ? roleMap[rid] : undefined) || ROLE_VIEW_LABEL[roleViewFrom(rid)];
									const sport = normalizeSport(u.sport);
									const active = u.is_active !== 0;
									return (
										<TableRow
											key={u.id}
											hover
											sx={{ cursor: "pointer" }}
											onClick={() => router.push(`/dashboard/customers/${u.id}`)}
										>
											<TableCell>
												<Stack direction="row" spacing={1.5} alignItems="center">
													<Avatar src={buildImageUrl(u.profile_picture_path)} />
													<Typography variant="subtitle2">{fullName(u)}</Typography>
												</Stack>
											</TableCell>
											<TableCell>
												<Typography variant="body2" color="text.secondary">
													{u.email || "-"}
												</Typography>
											</TableCell>
											<TableCell>{roleLabel}</TableCell>
											<TableCell align="center">{sport ? sportLabelVi(sport) : "-"}</TableCell>
											<TableCell align="center">
												<Chip
													size="small"
													label={active ? "Đang hoạt động" : "Tạm ngưng"}
													color={active ? "success" : "default"}
													variant={active ? "filled" : "outlined"}
												/>
											</TableCell>
										</TableRow>
									);
								})
							) : (
								<TableRow>
									<TableCell colSpan={5}>
										<Box p={3} textAlign="center" color="text.secondary">
											Không có dữ liệu
										</Box>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Card>
		</Stack>
	);
}
