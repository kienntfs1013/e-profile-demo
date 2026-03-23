"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	deleteCompetitionById,
	listCompetitionsPage,
	type CompetitionMasterDTO,
} from "@/services/competitions-master.service";
import Alert from "@mui/material/Alert";
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
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Trash } from "@phosphor-icons/react/dist/ssr/Trash";

type SportKey = "all" | "shooting" | "archery" | "boxing" | "taekwondo";
type RealSportKey = Exclude<SportKey, "all">;

function normalizeSportKey(apiText?: string): RealSportKey | "" {
	const s = (apiText || "").toLowerCase();
	if (s.includes("shoot") || s.includes("bắn súng") || s.includes("ban sung")) return "shooting";
	if (s.includes("arch") || s.includes("bắn cung") || s.includes("ban cung")) return "archery";
	if (s.includes("taek")) return "taekwondo";
	if (s.includes("box")) return "boxing";
	return "";
}

function fmtDate(d?: string) {
	if (!d) return "-";
	const dt = new Date(d);
	if (isNaN(+dt)) return d;
	const dd = String(dt.getDate()).padStart(2, "0");
	const mm = String(dt.getMonth() + 1).padStart(2, "0");
	const yyyy = dt.getFullYear();
	return `${dd}/${mm}/${yyyy}`;
}

function useDebouncedValue<T>(value: T, delay = 350) {
	const [v, setV] = React.useState(value);
	React.useEffect(() => {
		const t = setTimeout(() => setV(value), delay);
		return () => clearTimeout(t);
	}, [value, delay]);
	return v;
}

function sportLabel(sport: RealSportKey | "") {
	if (sport === "shooting") return "Bắn súng";
	if (sport === "archery") return "Bắn cung";
	if (sport === "taekwondo") return "Taekwondo";
	if (sport === "boxing") return "Boxing";
	return "-";
}

function parseDateValue(v?: string) {
	if (!v) return null;
	const d = new Date(v);
	return isNaN(+d) ? null : d;
}

function matchesDateRange(row: Row, from?: string, to?: string) {
	if (!from && !to) return true;
	const start = parseDateValue(row.start);
	const end = parseDateValue(row.end) || start;
	if (!start && !end) return false;

	const rangeStart = (start || end) as Date;
	const rangeEnd = (end || start) as Date;

	const filterStart = from ? new Date(`${from}T00:00:00`) : null;
	const filterEnd = to ? new Date(`${to}T23:59:59.999`) : null;

	if (filterStart && rangeEnd.getTime() < filterStart.getTime()) return false;
	if (filterEnd && rangeStart.getTime() > filterEnd.getTime()) return false;
	return true;
}

type Row = {
	id: number;
	name: string;
	sport: RealSportKey | "";
	city?: string;
	country?: string;
	start?: string;
	end?: string;
	isDemo?: boolean;
};

const DEMO_ROWS: Row[] = [
	{
		id: -1,
		name: "Giải Vô địch Bắn cung Hà Nội Mở rộng 2026",
		sport: "archery",
		city: "Hà Nội",
		country: "Việt Nam",
		start: "2026-04-18",
		end: "2026-04-20",
		isDemo: true,
	},
	{
		id: -2,
		name: "Giải Boxing Trẻ Toàn quốc 2026",
		sport: "boxing",
		city: "TP. Hồ Chí Minh",
		country: "Việt Nam",
		start: "2026-05-10",
		end: "2026-05-14",
		isDemo: true,
	},
	{
		id: -3,
		name: "Cúp Bắn súng Quốc gia 2026",
		sport: "shooting",
		city: "Đà Nẵng",
		country: "Việt Nam",
		start: "2026-06-06",
		end: "2026-06-09",
		isDemo: true,
	},
	{
		id: -4,
		name: "Taekwondo Open Championship 2026",
		sport: "taekwondo",
		city: "Cần Thơ",
		country: "Việt Nam",
		start: "2026-07-22",
		end: "2026-07-25",
		isDemo: true,
	},
	{
		id: -5,
		name: "Giải Bắn cung Trẻ Miền Trung 2026",
		sport: "archery",
		city: "Huế",
		country: "Việt Nam",
		start: "2026-08-12",
		end: "2026-08-13",
		isDemo: true,
	},
	{
		id: -6,
		name: "Giải Boxing CLB Toàn quốc 2026",
		sport: "boxing",
		city: "Hải Phòng",
		country: "Việt Nam",
		start: "2026-09-05",
		end: "2026-09-08",
		isDemo: true,
	},
];

export default function CompetitionsPage(): React.JSX.Element {
	const router = useRouter();

	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);

	const [q, setQ] = React.useState("");
	const [sport, setSport] = React.useState<SportKey>("all");
	const [dateFrom, setDateFrom] = React.useState("");
	const [dateTo, setDateTo] = React.useState("");
	const qDebounced = useDebouncedValue(q, 350);

	const [sourceRows, setSourceRows] = React.useState<Row[]>([]);
	const [loading, setLoading] = React.useState(true);

	const [confirmItem, setConfirmItem] = React.useState<Row | null>(null);
	const [deleting, setDeleting] = React.useState(false);
	const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

	const loadSource = React.useCallback(async () => {
		const controller = new AbortController();
		try {
			setLoading(true);
			const res = await listCompetitionsPage(1, 500, {}, "id-desc", controller.signal);

			const mapped: Row[] = res.data.map((c: CompetitionMasterDTO) => ({
				id: c.id,
				name: c.competition_name || `Giải đấu #${c.id}`,
				sport: normalizeSportKey(c.sport_type),
				city: c.city,
				country: c.country,
				start: c.start_date,
				end: c.end_date,
				isDemo: false,
			}));

			setSourceRows(mapped.length > 0 ? mapped : DEMO_ROWS);
		} catch {
			setSourceRows(DEMO_ROWS);
		} finally {
			setLoading(false);
		}
		return () => controller.abort();
	}, []);

	React.useEffect(() => {
		loadSource();
	}, [loadSource]);

	React.useEffect(() => {
		setPage(0);
	}, [qDebounced, sport, dateFrom, dateTo]);

	const filteredRows = React.useMemo(() => {
		return sourceRows.filter((row) => {
			const okQ = qDebounced.trim()
				? [row.name, row.city, row.country]
						.filter(Boolean)
						.join(" ")
						.toLowerCase()
						.includes(qDebounced.trim().toLowerCase())
				: true;

			const okSport = sport === "all" ? true : row.sport === sport;
			const okDate = matchesDateRange(row, dateFrom || undefined, dateTo || undefined);

			return okQ && okSport && okDate;
		});
	}, [sourceRows, qDebounced, sport, dateFrom, dateTo]);

	React.useEffect(() => {
		const maxPage = Math.max(0, Math.ceil(filteredRows.length / rowsPerPage) - 1);
		if (page > maxPage) setPage(maxPage);
	}, [filteredRows.length, page, rowsPerPage]);

	const pagedRows = React.useMemo(() => {
		const start = page * rowsPerPage;
		return filteredRows.slice(start, start + rowsPerPage);
	}, [filteredRows, page, rowsPerPage]);

	const goEdit = (id: number, isDemo?: boolean) => {
		if (isDemo) return;
		router.push(`/dashboard/competitions/update/${id}`);
	};

	const onConfirmDelete = async () => {
		if (!confirmItem) return;

		try {
			setDeleting(true);

			if (confirmItem.isDemo) {
				setSourceRows((prev) => prev.filter((item) => item.id !== confirmItem.id));
				setToast({ type: "success", message: "Đã xóa dữ liệu demo" });
				setConfirmItem(null);
				return;
			}

			await deleteCompetitionById(confirmItem.id);
			setSourceRows((prev) => prev.filter((item) => item.id !== confirmItem.id));
			setToast({ type: "success", message: "Đã xóa giải đấu" });
			setConfirmItem(null);
		} catch (e: any) {
			setToast({ type: "error", message: e?.response?.data?.message || e?.message || "Không thể xóa giải đấu" });
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
				<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flex: 1, minWidth: 0, flexWrap: "wrap" }}>
					<Box sx={{ flex: 1, minWidth: 240 }}>
						<TextField fullWidth size="small" label="Tìm kiếm" value={q} onChange={(e) => setQ(e.target.value)} />
					</Box>

					<Box sx={{ width: { xs: "100%", sm: 220 } }}>
						<TextField
							select
							fullWidth
							size="small"
							label="Bộ môn"
							value={sport}
							onChange={(e) => setSport(e.target.value as SportKey)}
						>
							<MenuItem value="all">Tất cả</MenuItem>
							<MenuItem value="shooting">Bắn súng</MenuItem>
							<MenuItem value="archery">Bắn cung</MenuItem>
							<MenuItem value="taekwondo">Taekwondo</MenuItem>
							<MenuItem value="boxing">Boxing</MenuItem>
						</TextField>
					</Box>

					<Box sx={{ width: { xs: "100%", sm: 180 } }}>
						<TextField
							fullWidth
							size="small"
							type="date"
							label="Từ ngày"
							value={dateFrom}
							onChange={(e) => setDateFrom(e.target.value)}
							InputLabelProps={{ shrink: true }}
						/>
					</Box>

					<Box sx={{ width: { xs: "100%", sm: 180 } }}>
						<TextField
							fullWidth
							size="small"
							type="date"
							label="Đến ngày"
							value={dateTo}
							onChange={(e) => setDateTo(e.target.value)}
							InputLabelProps={{ shrink: true }}
						/>
					</Box>
				</Stack>

				<Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" }, gap: 1 }}>
					<Button
						startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
						variant="contained"
						onClick={() => router.push("/dashboard/competitions/add")}
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
								<TableCell>Giải đấu</TableCell>
								<TableCell align="center">Bộ môn</TableCell>
								<TableCell>Địa điểm</TableCell>
								<TableCell align="center">Thời gian</TableCell>
								<TableCell align="right">Thao tác</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={5}>
										<Box p={3} textAlign="center" color="text.secondary">
											Đang tải dữ liệu…
										</Box>
									</TableCell>
								</TableRow>
							) : pagedRows.length > 0 ? (
								pagedRows.map((row) => (
									<TableRow
										key={row.id}
										hover
										onClick={() => goEdit(row.id, row.isDemo)}
										sx={{ cursor: row.isDemo ? "default" : "pointer" }}
									>
										<TableCell>
											<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
												{row.name}
											</Typography>
										</TableCell>

										<TableCell align="center">
											<Chip size="small" label={sportLabel(row.sport)} variant="outlined" />
										</TableCell>

										<TableCell>
											<Typography variant="body2">
												{[row.city, row.country].filter(Boolean).join(", ") || "-"}
											</Typography>
										</TableCell>

										<TableCell align="center">
											<Typography variant="body2">
												{fmtDate(row.start)} – {fmtDate(row.end)}
											</Typography>
										</TableCell>

										<TableCell align="right" onClick={(e) => e.stopPropagation()}>
											<Stack direction="row" spacing={0.5} justifyContent="flex-end">
												<Tooltip title={row.isDemo ? "Dữ liệu demo" : "Sửa"}>
													<span>
														<IconButton
															size="small"
															onClick={() => goEdit(row.id, row.isDemo)}
															disabled={Boolean(row.isDemo)}
														>
															<PencilSimple />
														</IconButton>
													</span>
												</Tooltip>
												<Tooltip title="Xóa">
													<IconButton size="small" color="error" onClick={() => setConfirmItem(row)}>
														<Trash />
													</IconButton>
												</Tooltip>
											</Stack>
										</TableCell>
									</TableRow>
								))
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

				<TablePagination
					component="div"
					count={filteredRows.length}
					page={page}
					rowsPerPage={rowsPerPage}
					onPageChange={(_, p) => setPage(p)}
					onRowsPerPageChange={(e) => {
						setRowsPerPage(parseInt(e.target.value, 10));
						setPage(0);
					}}
					rowsPerPageOptions={[5, 10, 25, 50]}
					labelRowsPerPage="Dòng / trang"
				/>
			</Paper>

			<Dialog open={!!confirmItem} onClose={() => !deleting && setConfirmItem(null)} fullWidth maxWidth="xs">
				<DialogTitle>Xác nhận xóa</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Bạn có chắc muốn xóa giải đấu
						{confirmItem ? ` “${confirmItem.name}” (Mã: ${confirmItem.id})` : ""}?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button variant="outlined" onClick={() => setConfirmItem(null)} disabled={deleting}>
						Hủy
					</Button>
					<Button color="error" variant="contained" onClick={onConfirmDelete} disabled={deleting}>
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
