"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	listArcheryPracticesByAthlete,
	listBoxingPracticesByAthlete,
	listShootingPracticesByAthlete,
	listTaekwondoPracticesByAthlete,
	type ArcheryPracticeDTO,
	type BoxingPracticeDTO,
	type ShootingPracticeDTO,
	type TaekwondoPracticeDTO,
} from "@/services/practice.service";
import { fetchUserByIdFromList, getLoggedInUserId } from "@/services/user.service";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
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
import dayjs from "dayjs";

import "dayjs/locale/vi";

dayjs.locale("vi");

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

	const [tkd, setTkd] = React.useState<TaekwondoPracticeDTO[]>([]);
	const [shoot, setShoot] = React.useState<ShootingPracticeDTO[]>([]);
	const [box, setBox] = React.useState<BoxingPracticeDTO[]>([]);
	const [arch, setArch] = React.useState<ArcheryPracticeDTO[]>([]);

	const [loading, setLoading] = React.useState(false);

	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);

	const [athleteId, setAthleteId] = React.useState<number | undefined>(undefined);
	const [sportKey, setSportKey] = React.useState<"taekwondo" | "shooting" | "boxing" | "archery" | "">("");

	React.useEffect(() => {
		let cancelled = false;
		async function loadUser() {
			const uid = getLoggedInUserId();
			if (!uid) return;
			const user = await fetchUserByIdFromList(uid);
			if (!user) return;
			if (!cancelled) {
				setAthleteId(Number((user as any)?.id ?? (user as any)?.user_id));
				const s = String((user as any)?.sport ?? "")
					.toLowerCase()
					.trim();
				if (s === "shooting" || s.includes("bắn súng")) setSportKey("shooting");
				else if (s === "archery" || s.includes("bắn cung")) setSportKey("archery");
				else if (s === "taekwondo") setSportKey("taekwondo");
				else if (s === "boxing") setSportKey("boxing");
			}
		}
		loadUser();
		return () => {
			cancelled = true;
		};
	}, []);

	React.useEffect(() => {
		let cancelled = false;
		async function load() {
			if (!athleteId) return;
			try {
				setLoading(true);
				if (sportKey === "taekwondo") {
					const r = await listTaekwondoPracticesByAthlete(athleteId, "id-desc");
					if (!cancelled) setTkd(r);
				} else if (sportKey === "shooting") {
					const r = await listShootingPracticesByAthlete(athleteId, "id-desc");
					if (!cancelled) setShoot(r);
				} else if (sportKey === "boxing") {
					const r = await listBoxingPracticesByAthlete(athleteId, "id-desc");
					if (!cancelled) setBox(r);
				} else if (sportKey === "archery") {
					const r = await listArcheryPracticesByAthlete(athleteId, "id-desc");
					if (!cancelled) setArch(r);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [athleteId, sportKey]);

	React.useEffect(() => {
		setPage(0);
	}, [sportKey, search, sort, date]);

	const applyCommonSort = <T extends { created_at?: string; session_date?: string }>(arr: T[]) => {
		const byTime = [...arr].sort((a, b) => {
			const da = a.session_date || a.created_at || "";
			const db = b.session_date || b.created_at || "";
			return sort === "newest" ? db.localeCompare(da) : da.localeCompare(db);
		});
		const q = search.trim().toLowerCase();
		const bySearch = q ? byTime.filter((r) => JSON.stringify(r).toLowerCase().includes(q)) : byTime;
		const byDate = date
			? bySearch.filter((r) => (r as any).session_date && dayjs((r as any).session_date).isSame(dayjs(date), "day"))
			: bySearch;
		return byDate;
	};

	const applyPagination = <T,>(rows: T[]) => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	const handleAdd = () => {
		if (!athleteId || !sportKey) return;
		router.push(`/dashboard/customers/training/${sportKey}/add?athlete=${athleteId}`);
	};

	return (
		<Stack spacing={3}>
			<Stack
				direction="row"
				spacing={2}
				alignItems="center"
				sx={{
					width: "100%",
					flexWrap: { xs: "wrap", md: "nowrap" },
					"& > *": { height: 40 },
				}}
			>
				<TextField
					fullWidth
					label="Tìm kiếm (theo nội dung)"
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
					onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
					size="small"
					sx={{ width: { xs: "100%", md: 200 }, flex: { xs: "1 1 200px", md: "0 0 200px" } }}
				>
					<MenuItem value="newest">Mới nhất</MenuItem>
					<MenuItem value="oldest">Cũ nhất</MenuItem>
				</TextField>
			</Stack>

			{sportKey === "taekwondo" && (
				<PracticeTableCard
					title="Taekwondo — Buổi tập"
					header={
						<Button onClick={handleAdd} startIcon={<></>} size="small" variant="contained">
							Thêm mới
						</Button>
					}
				>
					<Table sx={{ minWidth: 980 }}>
						<TableHead>
							<TableRow>
								<TableCell>Mã</TableCell>
								<TableCell>Ngày tập</TableCell>
								<TableCell>Kỹ thuật</TableCell>
								<TableCell>Drills</TableCell>
								<TableCell>Đấu đối kháng (phút)</TableCell>
								<TableCell>Bài thể lực</TableCell>
								<TableCell>Ghi chú</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{applyPagination(applyCommonSort(tkd)).map((r) => (
								<TableRow key={r.id} hover>
									<TableCell>{r.id}</TableCell>
									<TableCell>{r.session_date ? dayjs(r.session_date).format("DD/MM/YYYY") : "-"}</TableCell>
									<TableCell>{r.technique || "-"}</TableCell>
									<TableCell>{r.drills_practiced || "-"}</TableCell>
									<TableCell>{r.sparring_duration ?? "-"}</TableCell>
									<TableCell>{r.fitness_exercises || "-"}</TableCell>
									<TableCell>{r.notes || "-"}</TableCell>
								</TableRow>
							))}
							{!loading && tkd.length === 0 && (
								<TableRow>
									<TableCell colSpan={7}>
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
						count={applyCommonSort(tkd).length}
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
				<PracticeTableCard
					title="Bắn súng — Buổi tập"
					header={
						<Button onClick={handleAdd} startIcon={<></>} size="small" variant="contained">
							Thêm mới
						</Button>
					}
				>
					<Table sx={{ minWidth: 1180 }}>
						<TableHead>
							<TableRow>
								<TableCell>Mã</TableCell>
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
							{applyPagination(applyCommonSort(shoot)).map((r) => (
								<TableRow key={r.id} hover>
									<TableCell>{r.id}</TableCell>
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
							{!loading && shoot.length === 0 && (
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
						count={applyCommonSort(shoot).length}
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
				<PracticeTableCard
					title="Boxing — Buổi tập"
					header={
						<Button onClick={handleAdd} startIcon={<></>} size="small" variant="contained">
							Thêm mới
						</Button>
					}
				>
					<Table sx={{ minWidth: 1180 }}>
						<TableHead>
							<TableRow>
								<TableCell>Mã</TableCell>
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
							{applyPagination(applyCommonSort(box)).map((r) => (
								<TableRow key={r.id} hover>
									<TableCell>{r.id}</TableCell>
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
							{!loading && box.length === 0 && (
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
						count={applyCommonSort(box).length}
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
						<Button onClick={handleAdd} startIcon={<></>} size="small" variant="contained">
							Thêm mới
						</Button>
					}
				>
					<Table sx={{ minWidth: 1180 }}>
						<TableHead>
							<TableRow>
								<TableCell>Mã</TableCell>
								<TableCell>Ngày tập</TableCell>
								<TableCell>Cự ly (m)</TableCell>
								<TableCell>End số</TableCell>
								<TableCell>Mũi tên số</TableCell>
								<TableCell>Điểm</TableCell>
								<TableCell>Lệch X</TableCell>
								<TableCell>Lệch Y</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{applyPagination(applyCommonSort(arch)).map((r) => (
								<TableRow key={r.id} hover>
									<TableCell>{r.id}</TableCell>
									<TableCell>{r.session_date ? dayjs(r.session_date).format("DD/MM/YYYY") : "-"}</TableCell>
									<TableCell>{r.target_distance ?? "-"}</TableCell>
									<TableCell>{r.end_number ?? "-"}</TableCell>
									<TableCell>{r.arrow_number ?? "-"}</TableCell>
									<TableCell>{r.score ?? "-"}</TableCell>
									<TableCell>{r.x_coord ?? "-"}</TableCell>
									<TableCell>{r.y_coord ?? "-"}</TableCell>
								</TableRow>
							))}
							{!loading && arch.length === 0 && (
								<TableRow>
									<TableCell colSpan={8}>
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
						count={applyCommonSort(arch).length}
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
		</Stack>
	);
}
