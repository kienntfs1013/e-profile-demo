"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	deleteArcheryCompetitionById,
	deleteBoxingCompetitionById,
	deleteShootingCompetitionById,
	deleteTaekwondoCompetitionById,
	listArcheryCompetitionsByAthlete,
	listBoxingCompetitionsByAthlete,
	listShootingCompetitionsByAthlete,
	listTaekwondoCompetitionsByAthlete,
	type ArcheryCompetitionDTO,
	type BoxingCompetitionDTO,
	type ShootingCompetitionDTO,
	type TaekwondoCompetitionDTO,
} from "@/services/competition.service";
import { fetchUserByIdFromList, getLoggedInUserId, getUserById, type UserDTO } from "@/services/user.service";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
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

type SportKey = "shooting" | "archery" | "boxing" | "taekwondo";
type Row = ArcheryCompetitionDTO | BoxingCompetitionDTO | ShootingCompetitionDTO | TaekwondoCompetitionDTO;

function SectionCard({
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

function parseResult(v?: string) {
	if (!v) return "—";
	try {
		const o = JSON.parse(v);
		if (o && typeof o === "object") {
			return Object.entries(o)
				.slice(0, 4)
				.map(([k, val]) => `${k}: ${val}`)
				.join(", ");
		}
	} catch {}
	return v;
}

function rand(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fakeRows(sport: SportKey, athleteId: number): Row[] {
	const medals = ["Gold", "Silver", "Bronze", "—"];
	const notes = ["Phong độ ổn định", "Cần cải thiện chiến thuật", "Thi đấu tự tin", "Áp lực tâm lý ở vòng cuối"];
	return Array.from({ length: rand(6, 12) }).map((_, i) => {
		const d = dayjs().subtract(i * rand(3, 7), "day");
		const base: any = {
			id: 100000 + i,
			athlete_id: athleteId,
			competition_id: `Giải đấu ${i + 1}`,
			medal_won: medals[rand(0, medals.length - 1)],
			final_rank: rand(1, 16),
			result_data: JSON.stringify({ score: rand(50, 700) }),
			notes: notes[rand(0, notes.length - 1)],
			created_at: d.toISOString(),
			recorded_at: d.add(1, "day").toISOString(),
		};
		return base as Row;
	});
}

type ExtraUserFields = { id?: number | string; user_id?: number | string; sport?: string };

export function AchievementSection({ id }: { id?: number | string }) {
	const router = useRouter();
	const [user, setUser] = React.useState<(UserDTO & ExtraUserFields) | null>(null);

	React.useEffect(() => {
		let off = false;
		(async () => {
			const viewerId = getLoggedInUserId?.();
			const targetId = id != null && !Number.isNaN(Number(id)) ? Number(id) : viewerId || undefined;
			if (!targetId) return;
			const u =
				(await getUserById(targetId).catch(() => null)) ?? (await fetchUserByIdFromList(targetId).catch(() => null));
			if (!off) setUser((u as any) ?? null);
		})();
		return () => {
			off = true;
		};
	}, [id]);

	const athleteId = React.useMemo(() => {
		const raw = (user as any)?.id ?? (user as any)?.user_id;
		const n = Number(raw);
		return Number.isFinite(n) ? n : undefined;
	}, [user]);

	const sportKey: SportKey | "" = React.useMemo(() => {
		const s = String((user as any)?.sport ?? "").toLowerCase();
		if (s.includes("bắn súng") || s === "shooting") return "shooting";
		if (s.includes("bắn cung") || s === "archery") return "archery";
		if (s === "boxing") return "boxing";
		if (s === "taekwondo") return "taekwondo";
		return "";
	}, [user]);

	const [arch, setArch] = React.useState<ArcheryCompetitionDTO[]>([]);
	const [shoot, setShoot] = React.useState<ShootingCompetitionDTO[]>([]);
	const [box, setBox] = React.useState<BoxingCompetitionDTO[]>([]);
	const [tkd, setTkd] = React.useState<TaekwondoCompetitionDTO[]>([]);
	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		let off = false;
		(async () => {
			if (!athleteId || !sportKey) return;
			setLoading(true);
			try {
				if (sportKey === "archery") {
					const r = await listArcheryCompetitionsByAthlete(athleteId, "id-desc").catch(() => []);
					if (!off) setArch(r.length ? r : (fakeRows("archery", athleteId) as any));
				}
				if (sportKey === "shooting") {
					const r = await listShootingCompetitionsByAthlete(athleteId, "id-desc").catch(() => []);
					if (!off) setShoot(r.length ? r : (fakeRows("shooting", athleteId) as any));
				}
				if (sportKey === "boxing") {
					const r = await listBoxingCompetitionsByAthlete(athleteId, "id-desc").catch(() => []);
					if (!off) setBox(r.length ? r : (fakeRows("boxing", athleteId) as any));
				}
				if (sportKey === "taekwondo") {
					const r = await listTaekwondoCompetitionsByAthlete(athleteId, "id-desc").catch(() => []);
					if (!off) setTkd(r.length ? r : (fakeRows("taekwondo", athleteId) as any));
				}
			} finally {
				if (!off) setLoading(false);
			}
		})();
		return () => {
			off = true;
		};
	}, [athleteId, sportKey]);

	const handleAdd = () => {
		if (!athleteId || !sportKey) return;
		router.push(`/dashboard/customers/achievements/${sportKey}/add?athlete=${athleteId}`);
	};

	const handleEdit = (cid: number | string) => {
		if (!athleteId || !sportKey) return;
		router.push(`/dashboard/customers/achievements/${sportKey}/update/${cid}?athlete=${athleteId}`);
	};

	const [confirm, setConfirm] = React.useState<{ id: number | string; sport: SportKey } | null>(null);

	const doDelete = async () => {
		if (!confirm) return;
		const { id, sport } = confirm;
		if (sport === "archery") {
			await deleteArcheryCompetitionById(Number(id)).catch(() => {});
			setArch((p) => p.filter((x) => Number(x.id) !== Number(id)));
		}
		if (sport === "shooting") {
			await deleteShootingCompetitionById(Number(id)).catch(() => {});
			setShoot((p) => p.filter((x) => Number(x.id) !== Number(id)));
		}
		if (sport === "boxing") {
			await deleteBoxingCompetitionById(Number(id)).catch(() => {});
			setBox((p) => p.filter((x) => Number(x.id) !== Number(id)));
		}
		if (sport === "taekwondo") {
			await deleteTaekwondoCompetitionById(Number(id)).catch(() => {});
			setTkd((p) => p.filter((x) => Number(x.id) !== Number(id)));
		}
		setConfirm(null);
	};

	const dataMap: Record<SportKey, Row[]> = {
		archery: arch,
		shooting: shoot,
		boxing: box,
		taekwondo: tkd,
	};

	if (!sportKey) {
		return (
			<Box p={2} textAlign="center" color="text.secondary" border="1px dashed" borderRadius={1.5}>
				Không xác định bộ môn của vận động viên.
			</Box>
		);
	}

	return (
		<SectionCard
			title="Thành tích thi đấu"
			header={
				<Button onClick={handleAdd} startIcon={<Plus />} size="small" variant="contained">
					Thêm mới
				</Button>
			}
		>
			<Table sx={{ minWidth: 1100 }}>
				<TableHead>
					<TableRow>
						<TableCell>Giải đấu</TableCell>
						<TableCell>Huy chương</TableCell>
						<TableCell>Hạng</TableCell>
						<TableCell>Kết quả</TableCell>
						<TableCell>Ghi chú</TableCell>
						<TableCell>Ngày</TableCell>
						<TableCell align="right">Thao tác</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{dataMap[sportKey].map((r: any) => (
						<TableRow key={r.id} hover>
							<TableCell>{r.competition_id ?? "—"}</TableCell>
							<TableCell>{r.medal_won ?? "—"}</TableCell>
							<TableCell>{r.final_rank != null ? <Chip size="small" label={r.final_rank} /> : "—"}</TableCell>
							<TableCell>{parseResult(r.result_data)}</TableCell>
							<TableCell>{r.notes || "—"}</TableCell>
							<TableCell>
								{r.recorded_at
									? dayjs(r.recorded_at).format("DD/MM/YYYY")
									: r.created_at
										? dayjs(r.created_at).format("DD/MM/YYYY")
										: "—"}
							</TableCell>
							<TableCell align="right">
								<IconButton size="small" onClick={() => handleEdit(r.id)}>
									<PencilSimple />
								</IconButton>
								<IconButton size="small" color="error" onClick={() => setConfirm({ id: r.id!, sport: sportKey })}>
									<Trash />
								</IconButton>
							</TableCell>
						</TableRow>
					))}
					{!loading && dataMap[sportKey].length === 0 && (
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

			<Dialog open={!!confirm} onClose={() => setConfirm(null)} fullWidth maxWidth="xs">
				<DialogTitle>Xác nhận xóa</DialogTitle>
				<DialogContent>
					<DialogContentText>Bạn có chắc muốn xóa bản ghi {confirm?.id}?</DialogContentText>
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
		</SectionCard>
	);
}
