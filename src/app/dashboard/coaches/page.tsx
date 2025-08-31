"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { buildImageUrl, listUsers, type UserDTO } from "@/services/user.service";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Eye } from "@phosphor-icons/react/dist/ssr/Eye";

function applyPagination<T>(rows: T[], page: number, rowsPerPage: number): T[] {
	return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

function isCoach(u: UserDTO): boolean {
	const r = (u.role as any)?.toString?.().toLowerCase?.() ?? "";
	return r === "coach" || r === "huấn luyện viên" || r === "huan luyen vien" || r === "2";
}

function fullName(u: UserDTO): string {
	const ln = u.lastName?.trim() ?? "";
	const fn = u.firstName?.trim() ?? "";
	const byName = [ln, fn].filter(Boolean).join(" ").trim();
	if (byName) return byName;
	return u.email ? u.email.split("@")[0] : "Người dùng";
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

type SportCode = "shooting" | "archery" | "taekwondo" | "boxing" | "";
function normalizeSport(input?: string): SportCode {
	const s = (input || "").toLowerCase().trim();
	if (!s) return "";
	if (s.includes("shoot") || s.includes("bắn súng") || s.includes("ban sung")) return "shooting";
	if (s.includes("arch") || s.includes("bắn cung") || s.includes("ban cung")) return "archery";
	if (s.includes("taek")) return "taekwondo";
	if (s.includes("box")) return "boxing";
	return "";
}
function labelSport(s: SportCode): string {
	if (s === "shooting") return "Bắn súng";
	if (s === "archery") return "Bắn cung";
	if (s === "taekwondo") return "Taekwondo";
	if (s === "boxing") return "Boxing";
	return "-";
}

function normalizeGender(input?: string | number | null): "Nam" | "Nữ" | "Khác" | "-" {
	if (input === undefined || input === null) return "-";
	const v = String(input).toLowerCase().trim();
	if (["nam", "male", "m", "1"].includes(v)) return "Nam";
	if (["nữ", "nu", "female", "f", "0", "2"].includes(v)) return "Nữ";
	return "Khác";
}

type Row = {
	id: string;
	name: string;
	email?: string;
	phone?: string;
	avatar?: string;
	age?: number;
	sport?: SportCode;
	country?: string;
	gender?: "Nam" | "Nữ" | "Khác" | "-";
};

export default function CustomersPage(): React.JSX.Element {
	const router = useRouter();

	const [data, setData] = React.useState<Row[]>([]);
	const [loading, setLoading] = React.useState(true);

	const [search, setSearch] = React.useState("");
	const [sport, setSport] = React.useState<"all" | SportCode>("all");
	const [sortName, setSortName] = React.useState<"asc" | "desc">("asc");

	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);

	React.useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				setLoading(true);
				const users = await listUsers(undefined, "id-asc");

				const rows: Row[] = users.filter(isCoach).map((u) => ({
					id: String(u.id),
					name: fullName(u),
					email: u.email,
					phone: u.phoneNumber,
					avatar: buildImageUrl(u.profile_picture_path),
					age: calcAge(u.birthday),
					sport: normalizeSport(u.sport),
					country: u.country || undefined,
					gender: normalizeGender((u as any).gender),
				}));

				if (!cancelled) setData(rows);
			} catch {
				if (!cancelled) setData([]);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, []);

	const filtered = React.useMemo(() => {
		const q = search.trim().toLowerCase();
		return data.filter((u) => {
			const okName = q ? u.name.toLowerCase().includes(q) : true;
			const okSport = sport === "all" ? true : u.sport === sport;
			return okName && okSport;
		});
	}, [data, search, sport]);

	const sorted = React.useMemo(() => {
		const arr = [...filtered];
		arr.sort((a, b) =>
			sortName === "asc"
				? a.name.localeCompare(b.name, "vi", { sensitivity: "base" })
				: b.name.localeCompare(a.name, "vi", { sensitivity: "base" })
		);
		return arr;
	}, [filtered, sortName]);

	const rows = React.useMemo(() => applyPagination(sorted, page, rowsPerPage), [sorted, page, rowsPerPage]);

	const goDetail = (id: string) => router.push(`/dashboard/customers/${id}`);

	const visibleColCount = 5;

	return (
		<Stack spacing={3}>
			<Stack
				direction={{ xs: "column", md: "row" }}
				spacing={2}
				alignItems={{ xs: "stretch", md: "center" }}
				justifyContent="space-between"
			>
				<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flex: 1, minWidth: 0 }}>
					<Box sx={{ flex: 1, minWidth: 240 }}>
						<TextField
							fullWidth
							size="small"
							label="Tìm kiếm theo tên"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(0);
							}}
						/>
					</Box>

					<Box sx={{ width: { xs: "100%", sm: 260 } }}>
						<TextField
							select
							fullWidth
							size="small"
							label="Bộ môn"
							value={sport}
							onChange={(e) => {
								setSport(e.target.value as "all" | SportCode);
								setPage(0);
							}}
						>
							<MenuItem value="all">Tất cả</MenuItem>
							<MenuItem value="shooting">Bắn súng</MenuItem>
							<MenuItem value="archery">Bắn cung</MenuItem>
							<MenuItem value="taekwondo">Taekwondo</MenuItem>
							<MenuItem value="boxing">Boxing</MenuItem>
						</TextField>
					</Box>

					<Box sx={{ width: { xs: "100%", sm: 260 } }}>
						<TextField
							select
							fullWidth
							size="small"
							label="Sắp xếp theo tên"
							value={sortName}
							onChange={(e) => {
								setSortName(e.target.value as "asc" | "desc");
								setPage(0);
							}}
						>
							<MenuItem value="asc">A → Z</MenuItem>
							<MenuItem value="desc">Z → A</MenuItem>
						</TextField>
					</Box>
				</Stack>
			</Stack>

			<Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
				<TableContainer>
					<Table sx={{ minWidth: 900 }}>
						<TableHead>
							<TableRow>
								<TableCell>Huấn luyện viên</TableCell>
								<TableCell align="center">Bộ môn</TableCell>
								<TableCell>Quốc gia</TableCell>
								<TableCell align="center">Giới tính</TableCell>
								<TableCell align="center">Tuổi</TableCell>
								<TableCell align="right">Thao tác</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={visibleColCount}>
										<Box p={3} textAlign="center" color="text.secondary">
											Đang tải dữ liệu…
										</Box>
									</TableCell>
								</TableRow>
							) : (
								rows.map((row) => (
									<TableRow key={row.id} hover onClick={() => goDetail(row.id)} sx={{ cursor: "pointer" }}>
										<TableCell>
											<Stack direction="row" spacing={1.5} alignItems="center">
												<Avatar src={row.avatar} />
												<Box>
													<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
														{row.name}
													</Typography>
												</Box>
											</Stack>
										</TableCell>

										<TableCell align="center">{labelSport(row.sport || "")}</TableCell>

										<TableCell>
											<Typography variant="body2">{row.country || "-"}</Typography>
										</TableCell>

										<TableCell align="center">{row.gender ?? "-"}</TableCell>

										<TableCell align="center">{row.age ?? "-"}</TableCell>

										<TableCell align="right" onClick={(e) => e.stopPropagation()}>
											<Tooltip title="Chi tiết">
												<IconButton size="small" onClick={() => goDetail(row.id)}>
													<Eye />
												</IconButton>
											</Tooltip>
										</TableCell>
									</TableRow>
								))
							)}

							{!loading && rows.length === 0 && (
								<TableRow>
									<TableCell colSpan={visibleColCount}>
										<Box p={3} textAlign="center" color="text.secondary">
											Không có dữ liệu
										</Box>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>

				<TablePagination
					component="div"
					count={filtered.length}
					page={page}
					rowsPerPage={rowsPerPage}
					onPageChange={(_, newPage) => setPage(newPage)}
					onRowsPerPageChange={(e) => {
						setRowsPerPage(parseInt(e.target.value, 10));
						setPage(0);
					}}
					rowsPerPageOptions={[5, 10, 25]}
					labelRowsPerPage="Dòng / trang"
				/>
			</Paper>
		</Stack>
	);
}
