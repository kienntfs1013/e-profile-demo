"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	listArcheryPerformanceAssessmentsPageByAthlete,
	listBoxingPerformanceAssessmentsPageByAthlete,
	listShootingPerformanceAssessmentsPageByAthlete,
	listTaekwondoPerformanceAssessmentsPageByAthlete,
	type ArcheryPerformanceAssessmentDTO,
	type BoxingPerformanceAssessmentDTO,
	type ShootingPerformanceAssessmentDTO,
	type TaekwondoPerformanceAssessmentDTO,
} from "@/services/evaluation.service";
import {
	deleteArcheryPracticeById,
	listArcheryPracticesPageByAthlete,
	listBoxingPracticesPageByAthlete,
	listShootingPracticesPageByAthlete,
	listTaekwondoPracticesPageByAthlete,
	type ArcheryPracticeDTO,
	type BoxingPracticeDTO,
	type ShootingPracticeDTO,
	type TaekwondoPracticeDTO,
} from "@/services/practice.service";
import { fetchUserByIdFromList, getLoggedInUserId, getUserById } from "@/services/user.service";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import { Trash } from "@phosphor-icons/react/dist/ssr/Trash";
import dayjs from "dayjs";

import "dayjs/locale/vi";

dayjs.locale("vi");

function useDebouncedValue<T>(value: T, delay = 350) {
	const [v, setV] = React.useState(value);
	React.useEffect(() => {
		const t = setTimeout(() => setV(value), delay);
		return () => clearTimeout(t);
	}, [value, delay]);
	return v;
}

function PracticeTableCard({
	title,
	header,
	children,
	sx,
}: {
	title: string;
	header?: React.ReactNode;
	children: React.ReactNode;
	sx?: SxProps;
}) {
	return (
		<Card sx={{ ...sx, minWidth: 0 }}>
			<CardHeader title={title} action={header} />
			<Divider />
			<Box sx={{ overflowX: "auto", width: "100%" }}>{children}</Box>
		</Card>
	);
}

export default function Page(): React.JSX.Element {
	const router = useRouter();

	const [sort, setSort] = React.useState<"newest" | "oldest">("newest");
	const [date, setDate] = React.useState<string>(dayjs().format("YYYY-MM-DD"));
	const [search, setSearch] = React.useState<string>("");

	const debSearch = useDebouncedValue(search, 350);
	const debDate = useDebouncedValue(date, 350);

	const [rows, setRows] = React.useState<any[]>([]);
	const [total, setTotal] = React.useState(0);
	const [loading, setLoading] = React.useState(false);

	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);

	const [athleteId, setAthleteId] = React.useState<number | undefined>(undefined);
	const [sportKey, setSportKey] = React.useState<"taekwondo" | "shooting" | "boxing" | "archery" | "">("");

	const [evalSort, setEvalSort] = React.useState<"newest" | "oldest">("newest");
	const [evalDate, setEvalDate] = React.useState<string>("");
	const [evalSearch, setEvalSearch] = React.useState<string>("");
	const debEvalSearch = useDebouncedValue(evalSearch, 350);
	const debEvalDate = useDebouncedValue(evalDate, 350);
	const [evalRows, setEvalRows] = React.useState<any[]>([]);
	const [evalTotal, setEvalTotal] = React.useState(0);
	const [evalPage, setEvalPage] = React.useState(0);
	const [evalRowsPerPage, setEvalRowsPerPage] = React.useState(5);

	const [confirmArchery, setConfirmArchery] = React.useState<number | null>(null);

	React.useEffect(() => {
		let cancelled = false;
		(async () => {
			const uid = getLoggedInUserId();
			if (!uid) return;

			let user = await getUserById(uid);
			if (!user) user = await fetchUserByIdFromList(uid);
			if (!user || cancelled) return;

			setAthleteId(Number((user as any).id ?? (user as any).user_id));
			const s = String((user as any)?.sport ?? "")
				.toLowerCase()
				.trim();
			if (s === "shooting" || s.includes("bắn súng")) setSportKey("shooting");
			else if (s === "archery" || s.includes("bắn cung")) setSportKey("archery");
			else if (s === "taekwondo") setSportKey("taekwondo");
			else if (s === "boxing") setSportKey("boxing");
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	React.useEffect(() => {
		setPage(0);
	}, [sportKey, debSearch, debDate, sort]);

	React.useEffect(() => {
		if (!athleteId || !sportKey) return;
		const controller = new AbortController();

		(async () => {
			try {
				setLoading(true);

				const extraFilters: Record<string, string> = {};
				if (debSearch.trim()) extraFilters.q = debSearch.trim();
				if (debDate) extraFilters.session_date = debDate;

				const orderby = sort === "newest" ? "id-desc" : "id-asc";
				const p = page + 1;

				let res;
				if (sportKey === "taekwondo")
					res = await listTaekwondoPracticesPageByAthlete(
						athleteId,
						p,
						rowsPerPage,
						orderby,
						extraFilters,
						controller.signal
					);
				else if (sportKey === "shooting")
					res = await listShootingPracticesPageByAthlete(
						athleteId,
						p,
						rowsPerPage,
						orderby,
						extraFilters,
						controller.signal
					);
				else if (sportKey === "boxing")
					res = await listBoxingPracticesPageByAthlete(
						athleteId,
						p,
						rowsPerPage,
						orderby,
						extraFilters,
						controller.signal
					);
				else
					res = await listArcheryPracticesPageByAthlete(
						athleteId,
						p,
						rowsPerPage,
						orderby,
						extraFilters,
						controller.signal
					);

				setRows(res.data);
				setTotal(res.total ?? res.data.length);
			} catch (e: any) {
				if (e?.name !== "CanceledError" && e?.name !== "AbortError") {
					setRows([]);
					setTotal(0);
				}
			} finally {
				setLoading(false);
			}
		})();

		return () => controller.abort();
	}, [athleteId, sportKey, page, rowsPerPage, debSearch, debDate, sort]);

	React.useEffect(() => {
		setEvalPage(0);
	}, [sportKey, debEvalSearch, debEvalDate, evalSort]);

	React.useEffect(() => {
		if (!athleteId || !sportKey) return;
		const controller = new AbortController();

		(async () => {
			try {
				setLoading(true);

				const extra: Record<string, string> = {};
				if (debEvalSearch.trim()) extra.q = debEvalSearch.trim();
				if (debEvalDate) extra.date = debEvalDate;

				const orderby = evalSort === "newest" ? "id-desc" : "id-asc";
				const p = evalPage + 1;

				let res;
				if (sportKey === "taekwondo") {
					res = await listTaekwondoPerformanceAssessmentsPageByAthlete(
						athleteId,
						p,
						evalRowsPerPage,
						orderby,
						extra,
						controller.signal
					);
				} else if (sportKey === "shooting") {
					res = await listShootingPerformanceAssessmentsPageByAthlete(
						athleteId,
						p,
						evalRowsPerPage,
						orderby,
						extra,
						controller.signal
					);
				} else if (sportKey === "boxing") {
					res = await listBoxingPerformanceAssessmentsPageByAthlete(
						athleteId,
						p,
						evalRowsPerPage,
						orderby,
						extra,
						controller.signal
					);
				} else {
					res = await listArcheryPerformanceAssessmentsPageByAthlete(
						athleteId,
						p,
						evalRowsPerPage,
						orderby,
						extra,
						controller.signal
					);
				}

				setEvalRows(res.data);
				setEvalTotal(res.total ?? res.data.length);
			} catch (e: any) {
				if (e?.name !== "CanceledError" && e?.name !== "AbortError") {
					setEvalRows([]);
					setEvalTotal(0);
				}
			} finally {
				setLoading(false);
			}
		})();

		return () => controller.abort();
	}, [athleteId, sportKey, evalPage, evalRowsPerPage, debEvalSearch, debEvalDate, evalSort]);

	const handleAddArchery = () => {
		if (!athleteId) return;
		router.push(`/dashboard/customers/training/archery/add?athlete=${athleteId}`);
	};

	const handleEditArchery = (id: number | string) => {
		if (!athleteId) return;
		router.push(`/dashboard/customers/training/archery/update/${id}?athlete=${athleteId}`);
	};

	const doDeleteArchery = async () => {
		if (!confirmArchery) return;
		await deleteArcheryPracticeById(Number(confirmArchery));
		setRows((prev) => prev.filter((r) => Number(r.id) !== Number(confirmArchery)));
		setTotal((t) => Math.max(0, t - 1));
		setConfirmArchery(null);
	};

	return (
		<Stack spacing={3}>
			{sportKey ? (
				<>
					<Stack
						direction="row"
						spacing={2}
						alignItems="center"
						sx={{ width: "100%", flexWrap: { xs: "wrap", md: "nowrap" }, "& > *": { height: 40 } }}
					>
						<TextField
							fullWidth
							label="Tìm kiếm đánh giá"
							value={evalSearch}
							onChange={(e) => setEvalSearch(e.target.value)}
							size="small"
							sx={{ flex: "1 1 auto", minWidth: 240 }}
						/>
						<TextField
							type="date"
							label="Ngày đánh giá"
							value={evalDate}
							onChange={(e) => setEvalDate(e.target.value)}
							InputLabelProps={{ shrink: true }}
							size="small"
							sx={{ width: { xs: "100%", md: 220 }, flex: { xs: "1 1 220px", md: "0 0 220px" } }}
						/>
						<Button
							variant="outlined"
							size="small"
							onClick={() => setEvalDate("")}
							sx={{ flex: { xs: "0 0 auto", md: "0 0 110px" }, px: 2 }}
						>
							Xóa ngày
						</Button>
						<TextField
							select
							label="Sắp xếp thời gian"
							value={evalSort}
							onChange={(e) => setEvalSort(e.target.value as any)}
							size="small"
							sx={{ width: { xs: "100%", md: 200 }, flex: { xs: "1 1 200px", md: "0 0 200px" } }}
						>
							<MenuItem value="newest">Mới nhất</MenuItem>
							<MenuItem value="oldest">Cũ nhất</MenuItem>
						</TextField>
					</Stack>

					<PracticeTableCard title="Đánh giá của huấn luyện viên">
						<Table sx={{ minWidth: 980 }}>
							<TableHead>
								<TableRow>
									<TableCell>Ngày đánh giá</TableCell>
									<TableCell>Điểm</TableCell>
									<TableCell>Nội dung</TableCell>
									<TableCell>Ngày tạo</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{(loading
									? []
									: (evalRows as (
											| TaekwondoPerformanceAssessmentDTO
											| ShootingPerformanceAssessmentDTO
											| BoxingPerformanceAssessmentDTO
											| ArcheryPerformanceAssessmentDTO
										)[])
								).map((r: any) => (
									<TableRow key={r.id} hover>
										<TableCell>{r.date ? dayjs(r.date).format("DD/MM/YYYY") : "-"}</TableCell>
										<TableCell>{r.score ?? "-"}</TableCell>
										<TableCell sx={{ maxWidth: 520 }}>{r.comment ?? r.comments ?? "-"}</TableCell>
										<TableCell>{r.created_at ? dayjs(r.created_at).format("DD/MM/YYYY") : "-"}</TableCell>
									</TableRow>
								))}
								{!loading && evalRows.length === 0 && (
									<TableRow>
										<TableCell colSpan={5}>
											<Box p={2} textAlign="center" color="text.secondary">
												Không có dữ liệu
											</Box>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
						<TablePagination
							component="div"
							count={evalTotal}
							page={evalPage}
							rowsPerPage={evalRowsPerPage}
							onPageChange={(_, p) => setEvalPage(p)}
							onRowsPerPageChange={(e) => {
								setEvalRowsPerPage(parseInt(e.target.value, 10));
								setEvalPage(0);
							}}
							rowsPerPageOptions={[5, 10, 25]}
							labelRowsPerPage="Dòng / trang"
						/>
					</PracticeTableCard>
				</>
			) : null}

			<Stack
				direction="row"
				spacing={2}
				alignItems="center"
				sx={{ width: "100%", flexWrap: { xs: "wrap", md: "nowrap" }, "& > *": { height: 40 } }}
			>
				<TextField
					fullWidth
					label="Tìm kiếm"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					size="small"
					sx={{ flex: "1 1 auto", minWidth: 240 }}
				/>
				<TextField
					type="date"
					label="Ngày tập"
					value={date}
					onChange={(e) => setDate(e.target.value)}
					InputLabelProps={{ shrink: true }}
					size="small"
					sx={{ width: { xs: "100%", md: 220 }, flex: { xs: "1 1 220px", md: "0 0 220px" } }}
				/>
				<Button
					variant="outlined"
					size="small"
					onClick={() => setDate("")}
					sx={{ flex: { xs: "0 0 auto", md: "0 0 110px" }, px: 2 }}
				>
					Xóa ngày
				</Button>
				<TextField
					select
					label="Sắp xếp thời gian"
					value={sort}
					onChange={(e) => setSort(e.target.value as any)}
					size="small"
					sx={{ width: { xs: "100%", md: 200 }, flex: { xs: "1 1 200px", md: "0 0 200px" } }}
				>
					<MenuItem value="newest">Mới nhất</MenuItem>
					<MenuItem value="oldest">Cũ nhất</MenuItem>
				</TextField>
			</Stack>

			{sportKey === "taekwondo" && (
				<PracticeTableCard title="Taekwondo — Buổi tập">
					<Table sx={{ minWidth: 1080 }}>
						<TableHead>
							<TableRow>
								<TableCell>Ngày tập</TableCell>
								<TableCell>Kỹ thuật</TableCell>
								<TableCell>Drills</TableCell>
								<TableCell>Đối kháng (phút)</TableCell>
								<TableCell>Bài thể lực</TableCell>
								<TableCell>Tấn công</TableCell>
								<TableCell>Phòng thủ</TableCell>
								<TableCell>Sức mạnh đòn</TableCell>
								<TableCell>Ghi chú</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{(loading ? [] : (rows as TaekwondoPracticeDTO[])).map((r) => (
								<TableRow key={r.id} hover>
									<TableCell>{r.session_date ? dayjs(r.session_date).format("DD/MM/YYYY") : "-"}</TableCell>
									<TableCell>{r.technique || "-"}</TableCell>
									<TableCell>{r.drills_practiced || "-"}</TableCell>
									<TableCell>{r.sparring_duration ?? "-"}</TableCell>
									<TableCell>{r.fitness_exercises || "-"}</TableCell>
									<TableCell>{r.offense_score ?? "-"}</TableCell>
									<TableCell>{r.defense_score ?? "-"}</TableCell>
									<TableCell>{r.punch_power ?? "-"}</TableCell>
									<TableCell>{r.notes || "-"}</TableCell>
								</TableRow>
							))}
							{!loading && rows.length === 0 && (
								<TableRow>
									<TableCell colSpan={9}>
										<Box p={2} textAlign="center" color="text.secondary">
											Không có dữ liệu
										</Box>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
					<TablePagination
						component="div"
						count={total}
						page={page}
						rowsPerPage={rowsPerPage}
						onPageChange={(_, p) => setPage(p)}
						onRowsPerPageChange={(e) => {
							setRowsPerPage(parseInt(e.target.value, 10));
							setPage(0);
						}}
						rowsPerPageOptions={[5, 10, 25]}
						labelRowsPerPage="Dòng / trang"
					/>
				</PracticeTableCard>
			)}

			{sportKey === "shooting" && (
				<PracticeTableCard title="Bắn súng — Buổi tập">
					<Table sx={{ minWidth: 1180 }}>
						<TableHead>
							<TableRow>
								<TableCell>Ngày tập</TableCell>
								<TableCell>Loại súng</TableCell>
								<TableCell>Cự ly</TableCell>
								<TableCell>Loại bia</TableCell>
								<TableCell>Số phát bắn</TableCell>
								<TableCell>Trúng đích</TableCell>
								<TableCell>Độ chính xác (%)</TableCell>
								<TableCell>Ghi chú</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{(loading ? [] : (rows as ShootingPracticeDTO[])).map((r) => (
								<TableRow key={r.id} hover>
									<TableCell>{r.session_date ? dayjs(r.session_date).format("DD/MM/YYYY") : "-"}</TableCell>
									<TableCell>{r.weapon_type || "-"}</TableCell>
									<TableCell>{r.distance ?? "-"}</TableCell>
									<TableCell>{r.target_type || "-"}</TableCell>
									<TableCell>{r.shots_fired ?? "-"}</TableCell>
									<TableCell>{r.shots_hit ?? "-"}</TableCell>
									<TableCell>{r.accuracy ?? "-"}</TableCell>
									<TableCell>{r.notes || "-"}</TableCell>
								</TableRow>
							))}
							{!loading && rows.length === 0 && (
								<TableRow>
									<TableCell colSpan={9}>
										<Box p={2} textAlign="center" color="text.secondary">
											Không có dữ liệu
										</Box>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
					<TablePagination
						component="div"
						count={total}
						page={page}
						rowsPerPage={rowsPerPage}
						onPageChange={(_, p) => setPage(p)}
						onRowsPerPageChange={(e) => {
							setRowsPerPage(parseInt(e.target.value, 10));
							setPage(0);
						}}
						rowsPerPageOptions={[5, 10, 25]}
						labelRowsPerPage="Dòng / trang"
					/>
				</PracticeTableCard>
			)}

			{sportKey === "boxing" && (
				<PracticeTableCard title="Boxing — Buổi tập">
					<Table sx={{ minWidth: 1180 }}>
						<TableHead>
							<TableRow>
								<TableCell>Hiệp</TableCell>
								<TableCell>Cú ra đòn</TableCell>
								<TableCell>Đòn trúng</TableCell>
								<TableCell>Phòng thủ (%)</TableCell>
								<TableCell>Footwork điểm</TableCell>
								<TableCell>Đối luyện với</TableCell>
								<TableCell>Ghi chú</TableCell>
								<TableCell>Ngày tạo</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{(loading ? [] : (rows as BoxingPracticeDTO[])).map((r) => (
								<TableRow key={r.id} hover>
									<TableCell>{r.round_number ?? "-"}</TableCell>
									<TableCell>{r.punches_thrown ?? "-"}</TableCell>
									<TableCell>{r.punches_landed ?? "-"}</TableCell>
									<TableCell>{r.defense_success_rate ?? "-"}</TableCell>
									<TableCell>{r.footwork_score ?? "-"}</TableCell>
									<TableCell>{r.sparring_partner || "-"}</TableCell>
									<TableCell>{r.notes || "-"}</TableCell>
									<TableCell>{r.created_at ? dayjs(r.created_at).format("DD/MM/YYYY") : "-"}</TableCell>
								</TableRow>
							))}
							{!loading && rows.length === 0 && (
								<TableRow>
									<TableCell colSpan={9}>
										<Box p={2} textAlign="center" color="text.secondary">
											Không có dữ liệu
										</Box>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
					<TablePagination
						component="div"
						count={total}
						page={page}
						rowsPerPage={rowsPerPage}
						onPageChange={(_, p) => setPage(p)}
						onRowsPerPageChange={(e) => {
							setRowsPerPage(parseInt(e.target.value, 10));
							setPage(0);
						}}
						rowsPerPageOptions={[5, 10, 25]}
						labelRowsPerPage="Dòng / trang"
					/>
				</PracticeTableCard>
			)}

			{sportKey === "archery" && (
				<PracticeTableCard
					title="Bắn cung — Buổi tập"
					header={
						<Button onClick={handleAddArchery} startIcon={<Plus />} size="small" variant="contained">
							Thêm mới
						</Button>
					}
				>
					<Table sx={{ minWidth: 1180 }}>
						<TableHead>
							<TableRow>
								<TableCell>Ngày tập</TableCell>
								<TableCell>Cự ly (m)</TableCell>
								<TableCell>End số</TableCell>
								<TableCell>Mũi tên số</TableCell>
								<TableCell>Điểm</TableCell>
								<TableCell>Lệch X</TableCell>
								<TableCell>Lệch Y</TableCell>
								<TableCell align="right">Thao tác</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{(loading ? [] : (rows as ArcheryPracticeDTO[])).map((r) => (
								<TableRow key={r.id} hover>
									<TableCell>{r.session_date ? dayjs(r.session_date).format("DD/MM/YYYY") : "-"}</TableCell>
									<TableCell>{r.target_distance ?? "-"}</TableCell>
									<TableCell>{r.end_number ?? "-"}</TableCell>
									<TableCell>{r.arrow_number ?? "-"}</TableCell>
									<TableCell>{r.score ?? "-"}</TableCell>
									<TableCell>{r.x_coord ?? "-"}</TableCell>
									<TableCell>{r.y_coord ?? "-"}</TableCell>
									<TableCell align="right">
										<IconButton size="small" onClick={() => handleEditArchery(r.id)}>
											<PencilSimple />
										</IconButton>
										<IconButton size="small" color="error" onClick={() => setConfirmArchery(Number(r.id))}>
											<Trash />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
							{!loading && rows.length === 0 && (
								<TableRow>
									<TableCell colSpan={9}>
										<Box p={2} textAlign="center" color="text.secondary">
											Không có dữ liệu
										</Box>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
					<TablePagination
						component="div"
						count={total}
						page={page}
						rowsPerPage={rowsPerPage}
						onPageChange={(_, p) => setPage(p)}
						onRowsPerPageChange={(e) => {
							setRowsPerPage(parseInt(e.target.value, 10));
							setPage(0);
						}}
						rowsPerPageOptions={[5, 10, 25]}
						labelRowsPerPage="Dòng / trang"
					/>
				</PracticeTableCard>
			)}

			{!sportKey && (
				<Box p={2} textAlign="center" color="text.secondary" border="1px dashed" borderRadius={1.5}>
					Không xác định bộ môn của vận động viên.
				</Box>
			)}

			<Dialog open={confirmArchery != null} onClose={() => setConfirmArchery(null)} fullWidth maxWidth="xs">
				<DialogTitle>Xác nhận xóa buổi tập</DialogTitle>
				<DialogContent>
					<DialogContentText>Bạn có chắc muốn xóa bản ghi {confirmArchery ?? ""}?</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button variant="outlined" onClick={() => setConfirmArchery(null)}>
						Hủy
					</Button>
					<Button color="error" variant="contained" onClick={doDeleteArchery}>
						Đồng ý
					</Button>
				</DialogActions>
			</Dialog>
		</Stack>
	);
}
