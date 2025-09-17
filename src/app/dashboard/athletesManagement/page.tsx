"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	deleteAssignmentById,
	listAssignments as listAthleteCoachAssignments,
} from "@/services/athleteCoachAssignments.service";
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

type SportCode = "shooting" | "archery" | "taekwondo" | "boxing" | "";
const visibleColCount = 7;

function isAthlete(u: UserDTO): boolean {
	const r = (u.role as any)?.toString?.().toLowerCase?.() ?? "";
	return r === "athlete" || r === "vận động viên" || r === "van dong vien" || r === "1";
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

export default function AthletesManagementPage(): React.JSX.Element {
	const router = useRouter();

	const [rows, setRows] = React.useState<Row[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

	const [q, setQ] = React.useState("");
	const [status, setStatus] = React.useState<"all" | "active" | "paused">("all");
	const [genderFilter, setGenderFilter] = React.useState<"all" | "Nam" | "Nữ" | "Khác" | "-">("all");

	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);
	const [total, setTotal] = React.useState(0);

	const [confirmUser, setConfirmUser] = React.useState<Row | null>(null);
	const [deleting, setDeleting] = React.useState(false);

	const qDeferred = React.useDeferredValue(q);
	const reqIdRef = React.useRef(0);
	const [assignedAthleteIds, setAssignedAthleteIds] = React.useState<number[] | null>(null);

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
		const coachUserId = getLoggedInUserId?.() ?? null;
		if (!coachUserId) return [];
		const asgs = await listAthleteCoachAssignments({ coach_id: coachUserId });
		const ids = asgs.map((a) => Number(a.athlete_id)).filter((n) => Number.isFinite(n));
		return Array.from(new Set(ids));
	}, []);

	const fetchPage = React.useCallback(
		async (uiPage: number, pageSize: number) => {
			const myReq = ++reqIdRef.current;
			try {
				setLoading(true);

				let ids = assignedAthleteIds ?? [];
				if (assignedAthleteIds === null) {
					ids = await fetchAssignedIds();
					if (reqIdRef.current !== myReq) return;
					setAssignedAthleteIds(ids);
				}

				if (!ids.length) {
					setRows([]);
					setTotal(0);
					return;
				}

				const filters: Record<string, any> = { role: 1 };
				if (status !== "all") filters.is_active = status === "active" ? 1 : 0;

				const allUsers = await listAllUsers(filters);

				if (reqIdRef.current !== myReq) return;

				const viewerId = getLoggedInUserId?.();
				const base = viewerId != null ? allUsers.filter((u) => Number(u.id) !== Number(viewerId)) : allUsers;

				const onlyAthletes = base.filter(isAthlete);
				const assignedOnly = onlyAthletes.filter((u) => ids.includes(Number(u.id)));

				const clientFiltered = assignedOnly.filter((u) => {
					const okGender = genderFilter === "all" ? true : normalizeGender((u as any).gender) === genderFilter;
					const okQ = qDeferred
						? [fullName(u), u.email, u.phoneNumber]
								.filter(Boolean)
								.join(" ")
								.toLowerCase()
								.includes(qDeferred.toLowerCase())
						: true;
					return okGender && okQ;
				});

				const start = uiPage * pageSize;
				const end = start + pageSize;
				setTotal(clientFiltered.length);
				setRows(clientFiltered.slice(start, end).map(mapToRow));
			} catch {
				setRows([]);
				setTotal(0);
			} finally {
				if (reqIdRef.current === myReq) setLoading(false);
			}
		},
		[qDeferred, genderFilter, status, assignedAthleteIds, fetchAssignedIds]
	);

	React.useEffect(() => {
		fetchPage(page, rowsPerPage);
	}, [fetchPage, page, rowsPerPage]);

	React.useEffect(() => {
		setPage(0);
	}, [qDeferred, genderFilter, status]);

	const goDetail = (id: string) => router.push(`/dashboard/customers/${id}`);

	const onRequestDelete = (u: Row) => setConfirmUser(u);
	const onCancelDelete = () => {
		if (deleting) return;
		setConfirmUser(null);
	};

	const reloadCurrent = React.useCallback(() => {
		fetchPage(page, rowsPerPage);
	}, [fetchPage, page, rowsPerPage]);

	const onConfirmDelete = async () => {
		if (!confirmUser) return;
		try {
			setDeleting(true);
			const idNum = Number(confirmUser.id);
			if (Number.isNaN(idNum)) throw new Error("ID người dùng không hợp lệ");

			const coachUserId = getLoggedInUserId?.() ?? null;
			if (coachUserId) {
				const matches = await listAthleteCoachAssignments({ coach_id: coachUserId, athlete_id: idNum });
				for (const m of matches) {
					await deleteAssignmentById(m.id);
				}
			}

			const res = await deleteUser(idNum);
			if (!res.ok) throw new Error(res.message || "Xóa người dùng thất bại");

			setToast({ type: "success", message: "Đã xóa người dùng và liên kết huấn luyện" });
			setConfirmUser(null);

			setAssignedAthleteIds(null);
			reloadCurrent();
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
						<TextField fullWidth size="small" label="Tìm kiếm" value={q} onChange={(e) => setQ(e.target.value)} />
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
								<TableCell>Vận động viên</TableCell>
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
													<IconButton size="small" color="error" onClick={() => setConfirmUser(row)}>
														<Trash />
													</IconButton>
												</Tooltip>
											</Stack>
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

			<Dialog open={!!confirmUser} onClose={() => (!deleting ? setConfirmUser(null) : null)} fullWidth maxWidth="xs">
				<DialogTitle>Xác nhận xóa</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Bạn có chắc muốn xóa vận động viên
						{confirmUser ? ` “${confirmUser.name}” (Mã: ${confirmUser.id})` : ""} khỏi danh sách?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => (!deleting ? setConfirmUser(null) : null)} variant="outlined" disabled={deleting}>
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
