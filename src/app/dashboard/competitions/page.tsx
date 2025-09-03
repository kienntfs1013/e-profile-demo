"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	deleteCompetitionById,
	listCompetitions,
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
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Trash } from "@phosphor-icons/react/dist/ssr/Trash";

type SportKey = "all" | "shooting" | "archery" | "boxing" | "taekwondo";

function applyPagination<T>(rows: T[], page: number, rowsPerPage: number): T[] {
	return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

function normalizeSportKey(apiText?: string): Exclude<SportKey, "all"> | "" {
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

type Row = {
	id: number;
	name: string;
	sport: Exclude<SportKey, "all"> | "";
	city?: string;
	country?: string;
	start?: string;
	end?: string;
};

export default function CompetitionsPage(): React.JSX.Element {
	const router = useRouter();

	const [data, setData] = React.useState<Row[]>([]);
	const [loading, setLoading] = React.useState(true);

	const [q, setQ] = React.useState("");
	const [sport, setSport] = React.useState<SportKey>("all");
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);

	const [confirmItem, setConfirmItem] = React.useState<Row | null>(null);
	const [deleting, setDeleting] = React.useState(false);
	const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

	React.useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				setLoading(true);
				const list = await listCompetitions(undefined, "id-desc");
				const rows: Row[] = list.map((c: CompetitionMasterDTO) => ({
					id: c.id,
					name: c.competition_name || `Giải đấu #${c.id}`,
					sport: normalizeSportKey(c.sport_type),
					city: c.city,
					country: c.country,
					start: c.start_date,
					end: c.end_date,
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
		const key = q.trim().toLowerCase();
		return data.filter((r) => {
			const okSport = sport === "all" ? true : r.sport === sport;
			const haystack = [r.name, r.city, r.country].filter(Boolean).join(" ").toLowerCase();
			const okQ = key ? haystack.includes(key) : true;
			return okSport && okQ;
		});
	}, [data, sport, q]);

	const rows = React.useMemo(() => applyPagination(filtered, page, rowsPerPage), [filtered, page, rowsPerPage]);

	const goEdit = (id: number) => router.push(`/dashboard/competitions/update/${id}`);

	const onConfirmDelete = async () => {
		if (!confirmItem) return;
		try {
			setDeleting(true);
			await deleteCompetitionById(confirmItem.id);
			setToast({ type: "success", message: "Đã xóa giải đấu" });
			setConfirmItem(null);
			setData((prev) => prev.filter((x) => x.id !== confirmItem.id));
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
				<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flex: 1, minWidth: 0 }}>
					<Box sx={{ flex: 1, minWidth: 240 }}>
						<TextField
							fullWidth
							size="small"
							label="Tìm kiếm"
							value={q}
							onChange={(e) => {
								setQ(e.target.value);
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
								setSport(e.target.value as SportKey);
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
				</Stack>

				<Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
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
							) : (
								rows.map((row) => (
									<TableRow
										key={row.id}
										hover
										onClick={() => goEdit(row.id)} // click cả dòng -> Edit (như mẫu)
										sx={{ cursor: "pointer" }}
									>
										<TableCell>
											<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
												{row.name}
											</Typography>
										</TableCell>

										<TableCell align="center">
											<Chip
												size="small"
												label={
													row.sport === "shooting"
														? "Bắn súng"
														: row.sport === "archery"
															? "Bắn cung"
															: row.sport === "taekwondo"
																? "Taekwondo"
																: row.sport === "boxing"
																	? "Boxing"
																	: "-"
												}
												variant="outlined"
											/>
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
												<Tooltip title="Sửa">
													<IconButton size="small" onClick={() => goEdit(row.id)}>
														<PencilSimple />
													</IconButton>
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
							)}

							{!loading && rows.length === 0 && (
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

			<Dialog open={!!confirmItem} onClose={() => !deleting && setConfirmItem(null)} fullWidth maxWidth="xs">
				<DialogTitle>Xác nhận xóa</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Bạn có chắc muốn xóa giải đấu{confirmItem ? ` “${confirmItem.name}” (Mã: ${confirmItem.id})` : ""}?
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
