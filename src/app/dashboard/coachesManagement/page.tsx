"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	deleteManagementCoachAssignmentById,
	listManagementCoachAssignments,
} from "@/services/managementCoachAssignments.service";
import { buildImageUrl, deleteUser, getLoggedInUserId, listAllUsers, type UserDTO } from "@/services/user.service";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
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
import { PencilSimple } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Trash } from "@phosphor-icons/react/dist/ssr/Trash";

const VISIBLE_COLS = 7;
const DEFAULT_ORDER = "id-asc";

type SportCode = "shooting" | "archery" | "taekwondo" | "boxing" | "";

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
function normalizeGender(input?: string | number | null): "Nam" | "Nữ" | "Khác" | "-" {
	if (input === undefined || input === null) return "-";
	const v = String(input).toLowerCase().trim();
	if (["nam", "male", "m", "1"].includes(v)) return "Nam";
	if (["nữ", "nu", "female", "f", "0", "2"].includes(v)) return "Nữ";
	return "Khác";
}
function sportLabelVi(code?: SportCode): string {
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
			return "-";
	}
}

type Row = {
	id: string;
	name: string;
	email?: string;
	phone?: string;
	avatar?: string;
	status: "Đang hoạt động" | "Tạm ngưng";
	age?: number;
	sport?: SportCode;
	gender?: "Nam" | "Nữ" | "Khác" | "-";
};

export default function CoachesManagementPage(): React.JSX.Element {
	const router = useRouter();

	const [rows, setRows] = React.useState<Row[]>([]);
	const [loading, setLoading] = React.useState(true);

	const [search, setSearch] = React.useState("");
	const [status, setStatus] = React.useState<"all" | "active" | "paused">("all");
	const [genderFilter, setGenderFilter] = React.useState<"all" | "Nam" | "Nữ" | "Khác" | "-">("all");

	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);
	const [total, setTotal] = React.useState(0);

	const searchDeferred = React.useDeferredValue(search);

	const reqIdRef = React.useRef(0);
	const [assignedCoachIds, setAssignedCoachIds] = React.useState<number[] | null>(null);

	const mapToRow = (u: UserDTO): Row => ({
		id: String(u.id),
		name: fullName(u),
		email: u.email,
		phone: u.phoneNumber,
		avatar: buildImageUrl(u.profile_picture_path),
		status: u.is_active === 1 ? "Đang hoạt động" : "Tạm ngưng",
		age: calcAge(u.birthday),
		sport: normalizeSport(u.sport),
		gender: normalizeGender((u as any).gender),
	});

	const fetchAssignedIds = React.useCallback(async (): Promise<number[]> => {
		const managerUserId = getLoggedInUserId?.() ?? null;
		if (!managerUserId) return [];
		const asgs = await listManagementCoachAssignments({ manager_id: managerUserId });
		const ids = asgs.map((a) => Number(a.coach_id)).filter((n) => Number.isFinite(n));
		return Array.from(new Set(ids));
	}, []);

	const fetchPage = React.useCallback(
		async (uiPage: number, pageSize: number) => {
			const myReq = ++reqIdRef.current;
			try {
				setLoading(true);

				let ids = assignedCoachIds ?? [];
				if (assignedCoachIds === null) {
					ids = await fetchAssignedIds();
					if (reqIdRef.current !== myReq) return;
					setAssignedCoachIds(ids);
				}

				if (!ids.length) {
					setRows([]);
					setTotal(0);
					return;
				}

				const filters: Record<string, any> = { role: 2 };
				if (status === "active") filters.is_active = 1;
				else if (status === "paused") filters.is_active = 0;

				const all = await listAllUsers(filters, DEFAULT_ORDER);

				if (reqIdRef.current !== myReq) return;

				const myId = getLoggedInUserId?.();
				const base = all.filter((u) => (myId ? Number(u.id) !== Number(myId) : true));
				const onlyCoaches = base.filter(isCoach);
				const assignedOnly = onlyCoaches.filter((u) => ids.includes(Number(u.id)));

				const filtered = assignedOnly.filter((u) => {
					const okGender = genderFilter === "all" ? true : normalizeGender((u as any).gender) === genderFilter;
					const okQ = searchDeferred
						? [fullName(u), u.email, u.phoneNumber]
								.filter(Boolean)
								.join(" ")
								.toLowerCase()
								.includes(searchDeferred.toLowerCase())
						: true;
					return okGender && okQ;
				});

				const start = uiPage * pageSize;
				const pageSlice = filtered.slice(start, start + pageSize);

				setRows(pageSlice.map(mapToRow));
				setTotal(filtered.length);
			} catch {
				setRows([]);
				setTotal(0);
			} finally {
				if (reqIdRef.current === myReq) setLoading(false);
			}
		},
		[searchDeferred, genderFilter, status, assignedCoachIds, fetchAssignedIds]
	);

	React.useEffect(() => {
		fetchPage(page, rowsPerPage);
	}, [fetchPage, page, rowsPerPage]);

	React.useEffect(() => {
		setPage(0);
	}, [searchDeferred, genderFilter, status]);

	const goDetail = (id: string) => router.push(`/dashboard/customers/${id}`);

	const [confirmUser, setConfirmUser] = React.useState<Row | null>(null);
	const [deleting, setDeleting] = React.useState(false);
	const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

	const onRequestDelete = (u: Row) => setConfirmUser(u);
	const onCancelDelete = () => {
		if (!deleting) setConfirmUser(null);
	};

	const onConfirmDelete = async () => {
		if (!confirmUser) return;
		try {
			setDeleting(true);
			const idNum = Number(confirmUser.id);
			if (Number.isNaN(idNum)) throw new Error("ID người dùng không hợp lệ");

			const managerUserId = getLoggedInUserId?.() ?? null;
			if (managerUserId) {
				const matches = await listManagementCoachAssignments({ manager_id: managerUserId, coach_id: idNum });
				for (const m of matches) await deleteManagementCoachAssignmentById(m.id);
			}

			const res = await deleteUser(idNum);
			if (!res.ok) throw new Error(res.message || "Xóa người dùng thất bại");

			setToast({ type: "success", message: "Đã xóa người dùng và liên kết quản lý" });
			setConfirmUser(null);

			setAssignedCoachIds(null);
			fetchPage(page, rowsPerPage);
		} catch (e: any) {
			setToast({
				type: "error",
				message: e?.response?.data?.message || e?.message || "Không thể xóa người dùng",
			});
		} finally {
			setDeleting(false);
		}
	};

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
							label="Giới tính"
							value={genderFilter}
							onChange={(e) => setGenderFilter(e.target.value as typeof genderFilter)}
						>
							<MenuItem value="all">Tất cả</MenuItem>
							<MenuItem value="Nam">Nam</MenuItem>
							<MenuItem value="Nữ">Nữ</MenuItem>
							<MenuItem value="Khác">Khác</MenuItem>
						</TextField>
					</Box>

					<Box sx={{ width: { xs: "100%", sm: 220 } }}>
						<TextField
							select
							fullWidth
							size="small"
							label="Trạng thái"
							value={status}
							onChange={(e) => setStatus(e.target.value as "all" | "active" | "paused")}
						>
							<MenuItem value="all">Tất cả</MenuItem>
							<MenuItem value="active">Đang hoạt động</MenuItem>
							<MenuItem value="paused">Tạm ngưng</MenuItem>
						</TextField>
					</Box>
				</Stack>

				<Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
					<Button
						startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
						variant="contained"
						onClick={() => router.push("/dashboard/customers/add")}
					>
						Thêm mới
					</Button>
				</Box>
			</Stack>

			<Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
				<TableContainer>
					<Table sx={{ minWidth: 900 }}>
						<TableHead>
							<TableRow>
								<TableCell>Huấn luyện viên</TableCell>
								<TableCell align="center">Giới tính</TableCell>
								<TableCell align="center">Tuổi</TableCell>
								<TableCell>Email</TableCell>
								<TableCell>SĐT</TableCell>
								<TableCell align="center">Trạng thái</TableCell>
								<TableCell align="right">Thao tác</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={VISIBLE_COLS}>
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
													<Typography variant="caption" color="text.secondary">
														{sportLabelVi(row.sport)}
													</Typography>
												</Box>
											</Stack>
										</TableCell>

										<TableCell align="center">{row.gender ?? "-"}</TableCell>
										<TableCell align="center">{row.age ?? "-"}</TableCell>
										<TableCell>
											<Typography variant="body2">{row.email || "-"}</Typography>
										</TableCell>
										<TableCell>
											<Typography variant="body2">{row.phone || "-"}</Typography>
										</TableCell>
										<TableCell align="center">
											<Chip
												size="small"
												label={row.status}
												color={(row.status === "Đang hoạt động" ? "success" : "default") as any}
												variant={row.status === "Đang hoạt động" ? "filled" : "outlined"}
											/>
										</TableCell>

										<TableCell align="right" onClick={(e) => e.stopPropagation()}>
											<Stack direction="row" spacing={0.5} justifyContent="flex-end">
												<Tooltip title="Sửa">
													<IconButton size="small" onClick={() => router.push(`/dashboard/customers/update/${row.id}`)}>
														<PencilSimple />
													</IconButton>
												</Tooltip>
												<Tooltip title="Xóa">
													<IconButton size="small" color="error" onClick={() => onRequestDelete(row)}>
														<Trash />
													</IconButton>
												</Tooltip>
											</Stack>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={VISIBLE_COLS}>
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

			<Dialog open={!!confirmUser} onClose={onCancelDelete} fullWidth maxWidth="xs">
				<DialogTitle>Xác nhận xóa</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Bạn có chắc muốn xóa huấn luyện viên
						{confirmUser ? ` “${confirmUser.name}” (Mã: ${confirmUser.id})` : ""} khỏi danh sách?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={onCancelDelete} variant="outlined" disabled={deleting}>
						Hủy
					</Button>
					<Button onClick={onConfirmDelete} color="error" variant="contained" disabled={deleting}>
						{deleting ? "Đang xóa..." : "Đồng ý"}
					</Button>
				</DialogActions>
			</Dialog>

			{toast ? (
				<Snackbar
					open
					autoHideDuration={3000}
					onClose={() => setToast(null)}
					anchorOrigin={{ vertical: "top", horizontal: "right" }}
				>
					<Alert severity={toast.type}>{toast.message}</Alert>
				</Snackbar>
			) : null}
		</Stack>
	);
}
