"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	deleteArcheryPerformanceAssessmentById,
	deleteBoxingPerformanceAssessmentById,
	deleteShootingPerformanceAssessmentById,
	deleteTaekwondoPerformanceAssessmentById,
	listArcheryPerformanceAssessmentsByAthlete,
	listBoxingPerformanceAssessmentsByAthlete,
	listShootingPerformanceAssessmentsByAthlete,
	listTaekwondoPerformanceAssessmentsByAthlete,
	type ArcheryPerformanceAssessmentDTO,
	type BoxingPerformanceAssessmentDTO,
	type ShootingPerformanceAssessmentDTO,
	type TaekwondoPerformanceAssessmentDTO,
} from "@/services/evaluation.service";
import {
	deleteArcheryPracticeById,
	deleteBoxingPracticeById,
	deleteShootingPracticeById,
	deleteTaekwondoPracticeById,
	listArcheryPracticesByAthlete,
	listBoxingPracticesByAthlete,
	listShootingPracticesByAthlete,
	listTaekwondoPracticesByAthlete,
	type ArcheryPracticeDTO,
	type BoxingPracticeDTO,
	type ShootingPracticeDTO,
	type TaekwondoPracticeDTO,
} from "@/services/practice.service";
import { fetchUserByIdFromList, getLoggedInUserId, getUserById, type UserDTO } from "@/services/user.service";
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

type ExtraUserFields = {
	id?: number | string;
	user_id?: number | string;
	sport?: string;
};

type SportKey = "taekwondo" | "shooting" | "boxing" | "archery";

function buildFakePractices(sport: SportKey, athleteId: number) {
	const baseDate = dayjs().startOf("day");
	const days = [0, 1, 2, 3, 5, 7];

	if (sport === "taekwondo") {
		return days.map((d, idx) => {
			const dt = baseDate.subtract(d, "day").format("YYYY-MM-DD");
			return {
				id: 1000 + idx,
				athlete_id: athleteId,
				session_date: dt,
				technique: idx % 2 === 0 ? "Dollyo chagi" : "Ap chagi",
				drills_practiced: idx % 2 === 0 ? "Padwork, combos" : "Shadow, steps",
				sparring_duration: 10 + idx * 5,
				fitness_exercises: idx % 2 === 0 ? "Core, HIIT" : "Strength",
				offense_score: 6 + (idx % 3),
				defense_score: 5 + (idx % 3),
				punch_power: 6 + (idx % 3),
				notes: "Dữ liệu demo",
				created_at: baseDate.subtract(d, "day").add(2, "hour").toISOString(),
			} as any as TaekwondoPracticeDTO;
		});
	}

	if (sport === "shooting") {
		return days.map((d, idx) => {
			const dt = baseDate.subtract(d, "day").format("YYYY-MM-DD");
			const fired = 40 + idx * 10;
			const hit = Math.max(0, fired - (6 + idx));
			const acc = Math.round((hit / fired) * 100);
			return {
				id: 2000 + idx,
				athlete_id: athleteId,
				session_date: dt,
				weapon_type: idx % 2 === 0 ? "Pistol" : "Rifle",
				distance: idx % 2 === 0 ? 10 : 25,
				target_type: idx % 2 === 0 ? "Paper" : "Electronic",
				shots_fired: fired,
				shots_hit: hit,
				accuracy: acc,
				notes: "Dữ liệu demo",
				created_at: baseDate.subtract(d, "day").add(1, "hour").toISOString(),
			} as any as ShootingPracticeDTO;
		});
	}

	if (sport === "boxing") {
		return [1, 2, 3, 4, 5].map((round, idx) => {
			const dt = baseDate.subtract(idx, "day").toISOString();
			const thrown = 80 + idx * 15;
			const landed = Math.max(0, thrown - (22 + idx * 2));
			return {
				id: 3000 + idx,
				athlete_id: athleteId,
				round_number: round,
				punches_thrown: thrown,
				punches_landed: landed,
				defense_success_rate: 45 + idx * 3,
				footwork_score: 6 + (idx % 4),
				sparring_partner: idx % 2 === 0 ? "Demo Partner A" : "Demo Partner B",
				notes: "Dữ liệu demo",
				created_at: dt,
			} as any as BoxingPracticeDTO;
		});
	}

	return days.map((d, idx) => {
		const dt = baseDate.subtract(d, "day").format("YYYY-MM-DD");
		return {
			id: 4000 + idx,
			athlete_id: athleteId,
			session_date: dt,
			target_distance: idx % 2 === 0 ? 18 : 30,
			end_number: 8 + (idx % 3),
			arrow_number: 48 + idx * 6,
			score: 420 + idx * 12,
			x_coord: idx % 2 === 0 ? 1 : -2,
			y_coord: idx % 2 === 0 ? -1 : 2,
			created_at: baseDate.subtract(d, "day").add(3, "hour").toISOString(),
		} as any as ArcheryPracticeDTO;
	});
}

function buildFakeEvaluations(sport: SportKey, athleteId: number) {
	const baseDate = dayjs().startOf("day");
	const days = [0, 3, 6, 10];

	return days.map((d, idx) => {
		const date = baseDate.subtract(d, "day").format("YYYY-MM-DD");
		return {
			id: 9000 + idx + (sport === "shooting" ? 100 : sport === "boxing" ? 200 : sport === "archery" ? 300 : 0),
			athlete_id: athleteId,
			date,
			score: 6 + (idx % 4),
			comment: "Dữ liệu demo",
			created_at: baseDate.subtract(d, "day").add(4, "hour").toISOString(),
		} as any;
	});
}

function safeDateStr(v: any) {
	if (!v) return "";
	const s = String(v).trim();
	const d = dayjs(s);
	return d.isValid() ? d.format("YYYY-MM-DD") : "";
}

export function TrainingSection({ id }: { id?: number | string }) {
	const router = useRouter();

	const [user, setUser] = React.useState<(UserDTO & ExtraUserFields) | null>(null);

	React.useEffect(() => {
		let off = false;
		(async () => {
			const viewerId = getLoggedInUserId?.();
			const targetId = id != null && !Number.isNaN(Number(id)) ? Number(id) : viewerId || undefined;
			if (!targetId) {
				if (!off) setUser(null);
				return;
			}
			try {
				const u =
					(await getUserById(targetId).catch(() => null)) ?? (await fetchUserByIdFromList(targetId).catch(() => null));
				if (!off) setUser((u as any) ?? null);
			} catch {
				if (!off) setUser(null);
			}
		})();
		return () => {
			off = true;
		};
	}, [id]);

	const [sort, setSort] = React.useState<"newest" | "oldest">("newest");
	const [date, setDate] = React.useState<string>("");
	const [search, setSearch] = React.useState<string>("");

	const [tkd, setTkd] = React.useState<TaekwondoPracticeDTO[]>([]);
	const [shoot, setShoot] = React.useState<ShootingPracticeDTO[]>([]);
	const [box, setBox] = React.useState<BoxingPracticeDTO[]>([]);
	const [arch, setArch] = React.useState<ArcheryPracticeDTO[]>([]);

	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);

	const [confirm, setConfirm] = React.useState<{
		id: number | string;
		sport: SportKey;
	} | null>(null);

	const [evalDate, setEvalDate] = React.useState<string>("");
	const [evalSearch, setEvalSearch] = React.useState<string>("");
	const [evalSort, setEvalSort] = React.useState<"newest" | "oldest">("newest");
	const [evalPage, setEvalPage] = React.useState(0);
	const [evalRowsPerPage, setEvalRowsPerPage] = React.useState(5);

	const [tkdEval, setTkdEval] = React.useState<TaekwondoPerformanceAssessmentDTO[]>([]);
	const [shootEval, setShootEval] = React.useState<ShootingPerformanceAssessmentDTO[]>([]);
	const [boxEval, setBoxEval] = React.useState<BoxingPerformanceAssessmentDTO[]>([]);
	const [archEval, setArchEval] = React.useState<ArcheryPerformanceAssessmentDTO[]>([]);

	const [evalConfirm, setEvalConfirm] = React.useState<{
		id: number | string;
		sport: SportKey;
	} | null>(null);

	const athleteId = React.useMemo(() => {
		const raw = (user as any)?.id ?? (user as any)?.user_id;
		const n = Number(raw);
		return Number.isFinite(n) ? n : undefined;
	}, [user]);

	const sportKey = React.useMemo(() => {
		const s = String((user as any)?.sport ?? "")
			.toLowerCase()
			.trim();
		if (s === "shooting" || s.includes("bắn súng")) return "shooting";
		if (s === "archery" || s.includes("bắn cung")) return "archery";
		if (s === "taekwondo") return "taekwondo";
		if (s === "boxing") return "boxing";
		return "" as const;
	}, [user]);

	React.useEffect(() => {
		let cancelled = false;
		async function load() {
			if (!athleteId || !sportKey) return;
			try {
				setLoading(true);
				setError(null);

				const normalizeArr = (x: any) => (Array.isArray(x) ? x : Array.isArray(x?.data) ? x.data : []);

				const resolveData = (sport: SportKey, practicesRaw: any, evalsRaw: any) => {
					const pArr = normalizeArr(practicesRaw);
					const eArr = normalizeArr(evalsRaw);
					const useFakeP = pArr.length === 0;
					const useFakeE = eArr.length === 0;
					const practices = useFakeP ? buildFakePractices(sport, athleteId) : pArr;
					const evals = useFakeE ? buildFakeEvaluations(sport, athleteId) : eArr;
					return { practices, evals, usedFake: useFakeP || useFakeE };
				};

				if (sportKey === "taekwondo") {
					let p: any = [];
					let e: any = [];
					try {
						[p, e] = await Promise.all([
							listTaekwondoPracticesByAthlete(athleteId, "id-desc"),
							listTaekwondoPerformanceAssessmentsByAthlete(athleteId, "id-desc"),
						]);
					} catch {
						p = [];
						e = [];
					}
					const { practices, evals, usedFake } = resolveData("taekwondo", p, e);
					if (!cancelled) {
						setTkd(practices as TaekwondoPracticeDTO[]);
						setTkdEval(evals as TaekwondoPerformanceAssessmentDTO[]);
						if (usedFake) {
							setDate("");
							setEvalDate("");
						}
					}
				} else if (sportKey === "shooting") {
					let p: any = [];
					let e: any = [];
					try {
						[p, e] = await Promise.all([
							listShootingPracticesByAthlete(athleteId, "id-desc"),
							listShootingPerformanceAssessmentsByAthlete(athleteId, "id-desc"),
						]);
					} catch {
						p = [];
						e = [];
					}
					const { practices, evals, usedFake } = resolveData("shooting", p, e);
					if (!cancelled) {
						setShoot(practices as ShootingPracticeDTO[]);
						setShootEval(evals as ShootingPerformanceAssessmentDTO[]);
						if (usedFake) {
							setDate("");
							setEvalDate("");
						}
					}
				} else if (sportKey === "boxing") {
					let p: any = [];
					let e: any = [];
					try {
						[p, e] = await Promise.all([
							listBoxingPracticesByAthlete(athleteId, "id-desc"),
							listBoxingPerformanceAssessmentsByAthlete(athleteId, "id-desc"),
						]);
					} catch {
						p = [];
						e = [];
					}
					const { practices, evals, usedFake } = resolveData("boxing", p, e);
					if (!cancelled) {
						setBox(practices as BoxingPracticeDTO[]);
						setBoxEval(evals as BoxingPerformanceAssessmentDTO[]);
						if (usedFake) {
							setDate("");
							setEvalDate("");
						}
					}
				} else if (sportKey === "archery") {
					let p: any = [];
					let e: any = [];
					try {
						[p, e] = await Promise.all([
							listArcheryPracticesByAthlete(athleteId, "id-desc"),
							listArcheryPerformanceAssessmentsByAthlete(athleteId, "id-desc"),
						]);
					} catch {
						p = [];
						e = [];
					}
					const { practices, evals, usedFake } = resolveData("archery", p, e);
					if (!cancelled) {
						setArch(practices as ArcheryPracticeDTO[]);
						setArchEval(evals as ArcheryPerformanceAssessmentDTO[]);
						if (usedFake) {
							setDate("");
							setEvalDate("");
						}
					}
				}
			} catch (e: any) {
				if (!cancelled) setError(e?.message || "Không tải được dữ liệu");
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

	React.useEffect(() => {
		setEvalPage(0);
	}, [sportKey, evalSearch, evalSort, evalDate]);

	const applyCommonSort = <T extends { created_at?: string; session_date?: string }>(arr: T[]) => {
		const byTime = [...arr].sort((a, b) => {
			const da = safeDateStr((a as any).session_date) || String(a.created_at || "");
			const db = safeDateStr((b as any).session_date) || String(b.created_at || "");
			return sort === "newest" ? db.localeCompare(da) : da.localeCompare(db);
		});
		const q = search.trim().toLowerCase();
		const bySearch = q ? byTime.filter((r) => JSON.stringify(r).toLowerCase().includes(q)) : byTime;
		const d = safeDateStr(date);
		const byDate = d
			? bySearch.filter(
					(r) =>
						safeDateStr((r as any).session_date) && dayjs(safeDateStr((r as any).session_date)).isSame(dayjs(d), "day")
				)
			: bySearch;
		return byDate;
	};

	const applyEvalSort = <T extends { date?: string; created_at?: string }>(arr: T[]) => {
		const byTime = [...arr].sort((a, b) => {
			const da = safeDateStr((a as any).date) || String((a as any).created_at || "");
			const db = safeDateStr((b as any).date) || String((b as any).created_at || "");
			return evalSort === "newest" ? db.localeCompare(da) : da.localeCompare(db);
		});
		const q = evalSearch.trim().toLowerCase();
		const bySearch = q ? byTime.filter((r) => JSON.stringify(r).toLowerCase().includes(q)) : byTime;
		const d = safeDateStr(evalDate);
		const byDate = d
			? bySearch.filter((r: any) => safeDateStr(r.date) && dayjs(safeDateStr(r.date)).isSame(dayjs(d), "day"))
			: bySearch;
		return byDate;
	};

	const applyPagination = <T,>(rows: T[], p: number, rpp: number) => rows.slice(p * rpp, p * rpp + rpp);

	const handleAdd = () => {
		if (!athleteId || !sportKey) return;
		router.push(`/dashboard/customers/training/${sportKey}/add?athlete=${athleteId}`);
	};

	const handleAddEvaluation = () => {
		if (!athleteId || !sportKey) return;
		router.push(`/dashboard/customers/evaluation/${sportKey}/add?athlete=${athleteId}`);
	};

	const handleEdit = (rid: number | string) => {
		if (!athleteId || !sportKey) return;
		router.push(`/dashboard/customers/training/${sportKey}/update/${rid}?athlete=${athleteId}`);
	};

	const handleEditEvaluation = (rid: number | string) => {
		if (!athleteId || !sportKey) return;
		router.push(`/dashboard/customers/evaluation/${sportKey}/update/${rid}?athlete=${athleteId}`);
	};

	const doDelete = async () => {
		if (!confirm) return;
		const { id: rid, sport } = confirm;
		try {
			if (sport === "taekwondo") {
				await deleteTaekwondoPracticeById(Number(rid));
				setTkd((prev) => prev.filter((r: any) => Number(r.id) !== Number(rid)));
			} else if (sport === "shooting") {
				await deleteShootingPracticeById(Number(rid));
				setShoot((prev) => prev.filter((r: any) => Number(r.id) !== Number(rid)));
			} else if (sport === "boxing") {
				await deleteBoxingPracticeById(Number(rid));
				setBox((prev) => prev.filter((r: any) => Number(r.id) !== Number(rid)));
			} else if (sport === "archery") {
				await deleteArcheryPracticeById(Number(rid));
				setArch((prev) => prev.filter((r: any) => Number(r.id) !== Number(rid)));
			}
		} finally {
			setConfirm(null);
		}
	};

	const doDeleteEvaluation = async () => {
		if (!evalConfirm) return;
		const { id: rid, sport } = evalConfirm;
		try {
			if (sport === "taekwondo") {
				await deleteTaekwondoPerformanceAssessmentById(Number(rid));
				setTkdEval((prev) => prev.filter((r: any) => Number(r.id) !== Number(rid)));
			} else if (sport === "shooting") {
				await deleteShootingPerformanceAssessmentById(Number(rid));
				setShootEval((prev) => prev.filter((r: any) => Number(r.id) !== Number(rid)));
			} else if (sport === "boxing") {
				await deleteBoxingPerformanceAssessmentById(Number(rid));
				setBoxEval((prev) => prev.filter((r: any) => Number(r.id) !== Number(rid)));
			} else if (sport === "archery") {
				await deleteArcheryPerformanceAssessmentById(Number(rid));
				setArchEval((prev) => prev.filter((r: any) => Number(r.id) !== Number(rid)));
			}
		} finally {
			setEvalConfirm(null);
		}
	};

	const evalRows =
		sportKey === "taekwondo"
			? tkdEval
			: sportKey === "shooting"
				? shootEval
				: sportKey === "boxing"
					? boxEval
					: sportKey === "archery"
						? archEval
						: [];

	const evalFiltered = applyEvalSort(evalRows as any[]);
	const tkdFiltered = applyCommonSort(tkd);
	const shootFiltered = applyCommonSort(shoot);
	const boxFiltered = applyCommonSort(box);
	const archFiltered = applyCommonSort(arch);

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
							onChange={(e) => setEvalSort(e.target.value as "newest" | "oldest")}
							size="small"
							sx={{ width: { xs: "100%", md: 200 }, flex: { xs: "1 1 200px", md: "0 0 200px" } }}
						>
							<MenuItem value="newest">Mới nhất</MenuItem>
							<MenuItem value="oldest">Cũ nhất</MenuItem>
						</TextField>
					</Stack>

					<PracticeTableCard
						title="Đánh giá của huấn luyện viên"
						header={
							<Button onClick={handleAddEvaluation} startIcon={<Plus />} size="small" variant="contained">
								Thêm mới
							</Button>
						}
					>
						<Table sx={{ minWidth: 980 }}>
							<TableHead>
								<TableRow>
									<TableCell>Ngày đánh giá</TableCell>
									<TableCell>Điểm</TableCell>
									<TableCell>Nội dung</TableCell>
									<TableCell>Ngày tạo</TableCell>
									<TableCell align="right">Thao tác</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{applyPagination(evalFiltered, evalPage, evalRowsPerPage).map((r: any) => (
									<TableRow key={r.id} hover>
										<TableCell>{r.date ? dayjs(r.date).format("DD/MM/YYYY") : "-"}</TableCell>
										<TableCell>{r.score ?? "-"}</TableCell>
										<TableCell sx={{ maxWidth: 520 }}>{r.comment ?? r.comments ?? "-"}</TableCell>
										<TableCell>{r.created_at ? dayjs(r.created_at).format("DD/MM/YYYY") : "-"}</TableCell>
										<TableCell align="right">
											<IconButton size="small" onClick={() => handleEditEvaluation(r.id)}>
												<PencilSimple />
											</IconButton>
											<IconButton
												size="small"
												color="error"
												onClick={() => setEvalConfirm({ id: r.id!, sport: sportKey as SportKey })}
											>
												<Trash />
											</IconButton>
										</TableCell>
									</TableRow>
								))}
								{!loading && evalFiltered.length === 0 && (
									<TableRow>
										<TableCell colSpan={6}>
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
							count={evalFiltered.length}
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
					onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
					size="small"
					sx={{ width: { xs: "100%", md: 200 }, flex: { xs: "1 1 200px", md: "0 0 200px" } }}
				>
					<MenuItem value="newest">Mới nhất</MenuItem>
					<MenuItem value="oldest">Cũ nhất</MenuItem>
				</TextField>
			</Stack>

			{sportKey === "archery" && (
				<PracticeTableCard
					title="Bắn cung — Buổi tập"
					header={
						<Button onClick={handleAdd} startIcon={<Plus />} size="small" variant="contained">
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
							{applyPagination(archFiltered, page, rowsPerPage).map((r: any) => (
								<TableRow key={r.id} hover>
									<TableCell>{r.session_date ? dayjs(r.session_date).format("DD/MM/YYYY") : "-"}</TableCell>
									<TableCell>{r.target_distance ?? "-"}</TableCell>
									<TableCell>{r.end_number ?? "-"}</TableCell>
									<TableCell>{r.arrow_number ?? "-"}</TableCell>
									<TableCell>{r.score ?? "-"}</TableCell>
									<TableCell>{r.x_coord ?? "-"}</TableCell>
									<TableCell>{r.y_coord ?? "-"}</TableCell>
									<TableCell align="right">
										<IconButton size="small" onClick={() => handleEdit(r.id)}>
											<PencilSimple />
										</IconButton>
										<IconButton size="small" color="error" onClick={() => setConfirm({ id: r.id!, sport: "archery" })}>
											<Trash />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
							{!loading && archFiltered.length === 0 && (
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
						count={archFiltered.length}
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

			{sportKey === "taekwondo" && (
				<PracticeTableCard
					title="Taekwondo — Buổi tập"
					header={
						<Button onClick={handleAdd} startIcon={<Plus />} size="small" variant="contained">
							Thêm mới
						</Button>
					}
				>
					<Table sx={{ minWidth: 1080 }}>
						<TableHead>
							<TableRow>
								<TableCell>Ngày tập</TableCell>
								<TableCell>Kỹ thuật</TableCell>
								<TableCell>Drills</TableCell>
								<TableCell>Đấu đối kháng (phút)</TableCell>
								<TableCell>Bài thể lực</TableCell>
								<TableCell>Tấn công</TableCell>
								<TableCell>Phòng thủ</TableCell>
								<TableCell>Sức mạnh đòn</TableCell>
								<TableCell>Ghi chú</TableCell>
								<TableCell align="right">Thao tác</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{applyPagination(tkdFiltered, page, rowsPerPage).map((r: any) => (
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
									<TableCell align="right">
										<IconButton size="small" onClick={() => handleEdit(r.id)}>
											<PencilSimple />
										</IconButton>
										<IconButton
											size="small"
											color="error"
											onClick={() => setConfirm({ id: r.id!, sport: "taekwondo" })}
										>
											<Trash />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
							{!loading && tkdFiltered.length === 0 && (
								<TableRow>
									<TableCell colSpan={10}>
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
						count={tkdFiltered.length}
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
						<Button onClick={handleAdd} startIcon={<Plus />} size="small" variant="contained">
							Thêm mới
						</Button>
					}
				>
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
								<TableCell align="right">Thao tác</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{applyPagination(shootFiltered, page, rowsPerPage).map((r: any) => (
								<TableRow key={r.id} hover>
									<TableCell>{r.session_date ? dayjs(r.session_date).format("DD/MM/YYYY") : "-"}</TableCell>
									<TableCell>{r.weapon_type || "-"}</TableCell>
									<TableCell>{r.distance ?? "-"}</TableCell>
									<TableCell>{r.target_type || "-"}</TableCell>
									<TableCell>{r.shots_fired ?? "-"}</TableCell>
									<TableCell>{r.shots_hit ?? "-"}</TableCell>
									<TableCell>{r.accuracy ?? "-"}</TableCell>
									<TableCell>{r.notes || "-"}</TableCell>
									<TableCell align="right">
										<IconButton size="small" onClick={() => handleEdit(r.id)}>
											<PencilSimple />
										</IconButton>
										<IconButton size="small" color="error" onClick={() => setConfirm({ id: r.id!, sport: "shooting" })}>
											<Trash />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
							{!loading && shootFiltered.length === 0 && (
								<TableRow>
									<TableCell colSpan={10}>
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
						count={shootFiltered.length}
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
						<Button onClick={handleAdd} startIcon={<Plus />} size="small" variant="contained">
							Thêm mới
						</Button>
					}
				>
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
								<TableCell align="right">Thao tác</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{applyPagination(boxFiltered, page, rowsPerPage).map((r: any) => (
								<TableRow key={r.id} hover>
									<TableCell>{r.round_number ?? "-"}</TableCell>
									<TableCell>{r.punches_thrown ?? "-"}</TableCell>
									<TableCell>{r.punches_landed ?? "-"}</TableCell>
									<TableCell>{r.defense_success_rate ?? "-"}</TableCell>
									<TableCell>{r.footwork_score ?? "-"}</TableCell>
									<TableCell>{r.sparring_partner || "-"}</TableCell>
									<TableCell>{r.notes || "-"}</TableCell>
									<TableCell>{r.created_at ? dayjs(r.created_at).format("DD/MM/YYYY") : "-"}</TableCell>
									<TableCell align="right">
										<IconButton size="small" onClick={() => handleEdit(r.id)}>
											<PencilSimple />
										</IconButton>
										<IconButton size="small" color="error" onClick={() => setConfirm({ id: r.id!, sport: "boxing" })}>
											<Trash />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
							{!loading && boxFiltered.length === 0 && (
								<TableRow>
									<TableCell colSpan={10}>
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
						count={boxFiltered.length}
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

			<Dialog open={!!confirm} onClose={() => setConfirm(null)} fullWidth maxWidth="xs">
				<DialogTitle>Xác nhận xóa buổi tập</DialogTitle>
				<DialogContent>
					<DialogContentText>Bạn có chắc muốn xóa bản ghi {confirm?.id ?? ""}?</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button variant="outlined" onClick={() => setConfirm(null)}>
						Hủy
					</Button>
					<Button color="error" variant="contained" onClick={doDelete}>
						Đồng ý
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={!!evalConfirm} onClose={() => setEvalConfirm(null)} fullWidth maxWidth="xs">
				<DialogTitle>Xác nhận xóa đánh giá</DialogTitle>
				<DialogContent>
					<DialogContentText>Bạn có chắc muốn xóa bản ghi {evalConfirm?.id ?? ""}?</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button variant="outlined" onClick={() => setEvalConfirm(null)}>
						Hủy
					</Button>
					<Button color="error" variant="contained" onClick={doDeleteEvaluation}>
						Đồng ý
					</Button>
				</DialogActions>
			</Dialog>

			{error ? (
				<Box
					p={2}
					textAlign="center"
					color="error.main"
					border="1px dashed"
					borderColor="error.main"
					borderRadius={1.5}
				>
					{error}
				</Box>
			) : null}
		</Stack>
	);
}
