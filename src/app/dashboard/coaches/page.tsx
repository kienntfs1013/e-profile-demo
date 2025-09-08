"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { buildImageUrl, listUsersPage, type UserDTO } from "@/services/user.service";
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

type SportCode = "shooting" | "archery" | "taekwondo" | "boxing" | "";
const DEFAULT_ORDER = "id-asc";
const visibleColCount = 6; // HLV | Bộ môn | Quốc gia | Giới tính | Tuổi | Thao tác

/* ===== helpers ===== */
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

	const [rows, setRows] = React.useState<Row[]>([]);
	const [loading, setLoading] = React.useState(true);

	// filter
	const [search, setSearch] = React.useState("");
	const [sport, setSport] = React.useState<"all" | SportCode>("all");
	const [sortName, setSortName] = React.useState<"asc" | "desc">("asc");

	// server pagination
	const [page, setPage] = React.useState(0); // 0-based UI
	const [rowsPerPage, setRowsPerPage] = React.useState(10);
	const [total, setTotal] = React.useState(0);

	// debounce search (lọc trong trang hiện tại)
	const searchDeferred = React.useDeferredValue(search);

	// chống race condition
	const reqIdRef = React.useRef(0);

	const mapToRow = (u: UserDTO): Row => ({
		id: String(u.id),
		name: fullName(u),
		email: u.email,
		phone: u.phoneNumber,
		avatar: buildImageUrl(u.profile_picture_path),
		age: calcAge(u.birthday),
		sport: normalizeSport(u.sport),
		country: u.country || undefined,
		gender: normalizeGender((u as any).gender),
	});

	const fetchPage = React.useCallback(
		async (uiPage: number, pageSize: number) => {
			const myReq = ++reqIdRef.current;
			try {
				setLoading(true);

				// chỉ lấy HLV từ API
				const filters: Record<string, any> = { role: 2 };
				// Nếu backend hỗ trợ lọc sport thì có thể bật:
				// if (sport !== "all") filters.sport = sport;

				const res = await listUsersPage(uiPage + 1, filters, DEFAULT_ORDER, pageSize);

				if (reqIdRef.current !== myReq) return;

				const onlyCoaches = res.data.filter(isCoach);

				// lọc trong trang (search + sport) + sort tên
				const filtered = onlyCoaches.filter((u) => {
					const okSport = sport === "all" ? true : normalizeSport(u.sport) === sport;
					const okQ = searchDeferred
						? [fullName(u), u.email, u.phoneNumber]
								.filter(Boolean)
								.join(" ")
								.toLowerCase()
								.includes(searchDeferred.toLowerCase())
						: true;
					return okSport && okQ;
				});

				filtered.sort((a, b) =>
					sortName === "asc"
						? fullName(a).localeCompare(fullName(b), "vi", { sensitivity: "base" })
						: fullName(b).localeCompare(fullName(a), "vi", { sensitivity: "base" })
				);

				setRows(filtered.map(mapToRow));
				setTotal(res.total ?? res.data.length);
			} catch {
				setRows([]);
				setTotal(0);
			} finally {
				if (reqIdRef.current === myReq) setLoading(false);
			}
		},
		[searchDeferred, sport, sortName]
	);

	// load mỗi khi filter/pagination đổi
	React.useEffect(() => {
		fetchPage(page, rowsPerPage);
	}, [fetchPage, page, rowsPerPage]);

	// đổi filter -> về trang 0
	React.useEffect(() => {
		setPage(0);
	}, [searchDeferred, sport, sortName]);

	const goDetail = (id: string) => router.push(`/dashboard/customers/${id}`);

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
							label="Tìm kiếm"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</Box>

					<Box sx={{ width: { xs: "100%", sm: 220 } }}>
						<TextField
							select
							fullWidth
							size="small"
							label="Bộ môn"
							value={sport}
							onChange={(e) => setSport(e.target.value as "all" | SportCode)}
						>
							<MenuItem value="all">Tất cả</MenuItem>
							<MenuItem value="shooting">Bắn súng</MenuItem>
							<MenuItem value="archery">Bắn cung</MenuItem>
							<MenuItem value="taekwondo">Taekwondo</MenuItem>
							<MenuItem value="boxing">Boxing</MenuItem>
						</TextField>
					</Box>

					<Box sx={{ width: { xs: "100%", sm: 220 } }}>
						<TextField
							select
							fullWidth
							size="small"
							label="Sắp xếp theo tên"
							value={sortName}
							onChange={(e) => setSortName(e.target.value as "asc" | "desc")}
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
							) : rows.length > 0 ? (
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
							) : (
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
					count={total}
					page={page}
					rowsPerPage={rowsPerPage}
					onPageChange={(_, newPage) => setPage(newPage)}
					onRowsPerPageChange={(e) => {
						setRowsPerPage(parseInt(e.target.value, 10));
						setPage(0);
					}}
					rowsPerPageOptions={[5, 10, 25, 50]}
					labelRowsPerPage="Dòng / trang"
				/>
			</Paper>
		</Stack>
	);
}
