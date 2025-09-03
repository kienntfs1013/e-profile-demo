"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	addArcheryCompetition,
	addBoxingCompetition,
	addShootingCompetition,
	addTaekwondoCompetition,
	listArcheryCompetitionsByAthlete,
	listBoxingCompetitionsByAthlete,
	listShootingCompetitionsByAthlete,
	listTaekwondoCompetitionsByAthlete,
	updateArcheryCompetitionById,
	updateBoxingCompetitionById,
	updateShootingCompetitionById,
	updateTaekwondoCompetitionById,
	type ArcheryCompetitionDTO,
	type BoxingCompetitionDTO,
	type ShootingCompetitionDTO,
	type TaekwondoCompetitionDTO,
} from "@/services/competition.service";
import { listCompetitionsBySport, type CompetitionMasterDTO } from "@/services/competitions-master.service";
import { listUsers, type UserDTO } from "@/services/user.service";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";

export type SportKey = "shooting" | "archery" | "boxing" | "taekwondo";
type Mode = "add" | "update";

type FieldDef = {
	key: string;
	label: string;
	type?: "text" | "number" | "date" | "textarea" | "select";
	required?: boolean;
	options?: { value: string | number; label: string }[];
};

const medalOptions = [
	{ value: "Vàng", label: "Vàng" },
	{ value: "Bạc", label: "Bạc" },
	{ value: "Đồng", label: "Đồng" },
	{ value: "Không", label: "Không có" },
];

const baseFields: FieldDef[] = [
	{ key: "competition_id", label: "Giải đấu", type: "select", required: true },
	{ key: "medal_won", label: "Huy chương", type: "select", options: medalOptions },
	{ key: "final_rank", label: "Hạng", type: "number" },
	{ key: "opponent_user_id", label: "Đối thủ", type: "select" },
	{ key: "recorded_at", label: "Ngày ghi nhận", type: "date", required: true },
	{ key: "result_data", label: "Kết quả (JSON/Text)", type: "textarea" },
	{ key: "notes", label: "Ghi chú", type: "text" },
];

const defs: Record<SportKey, FieldDef[]> = {
	shooting: baseFields,
	archery: baseFields,
	boxing: baseFields,
	taekwondo: baseFields,
};

function toNumberOrUndef(v: any) {
	if (v === "" || v === null || v === undefined) return undefined;
	const n = Number(v);
	return Number.isFinite(n) ? n : undefined;
}

function normalizeForSend(sport: SportKey, form: Record<string, any>) {
	const obj: Record<string, any> = {};
	defs[sport].forEach((f) => {
		const val = form[f.key];
		if (f.type === "number") obj[f.key] = toNumberOrUndef(val);
		else if (f.type === "date") obj[f.key] = val ? dayjs(val).format("YYYY-MM-DD") : undefined;
		else obj[f.key] = val || undefined;
	});
	return obj;
}

type Row = ArcheryCompetitionDTO | BoxingCompetitionDTO | ShootingCompetitionDTO | TaekwondoCompetitionDTO;

export default function AchievementForm({
	sport,
	mode,
	athleteId,
	id,
	title,
}: {
	sport: SportKey;
	mode: Mode;
	athleteId: number;
	id?: number;
	title: string;
}) {
	const router = useRouter();
	const [form, setForm] = React.useState<Record<string, any>>({});
	const [saving, setSaving] = React.useState(false);
	const [loading, setLoading] = React.useState(mode === "update");
	const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

	const [users, setUsers] = React.useState<UserDTO[]>([]);
	const [competitions, setCompetitions] = React.useState<CompetitionMasterDTO[]>([]);

	React.useEffect(() => {
		let canceled = false;
		async function fetchRefs() {
			try {
				const [u, c] = await Promise.all([
					listUsers({ orderby: "id-asc" } as any, "id-asc"),
					listCompetitionsBySport(sport),
				]);
				if (!canceled) {
					setUsers(u);
					setCompetitions(c);
				}
			} catch {}
		}
		fetchRefs();
		return () => {
			canceled = true;
		};
	}, [sport]);

	React.useEffect(() => {
		if (mode !== "update" || !athleteId || !id) return;
		let cancelled = false;
		async function load() {
			try {
				setLoading(true);
				let rows: Row[] = [];
				if (sport === "shooting") rows = await listShootingCompetitionsByAthlete(athleteId, "id-desc");
				else if (sport === "archery") rows = await listArcheryCompetitionsByAthlete(athleteId, "id-desc");
				else if (sport === "boxing") rows = await listBoxingCompetitionsByAthlete(athleteId, "id-desc");
				else if (sport === "taekwondo") rows = await listTaekwondoCompetitionsByAthlete(athleteId, "id-desc");
				const found = rows.find((r) => Number(r.id) === Number(id));
				if (!cancelled && found) {
					const next: Record<string, any> = {};
					defs[sport].forEach((f) => {
						const raw = (found as any)[f.key];
						if (f.type === "date") next[f.key] = raw ? String(raw).slice(0, 10) : dayjs().format("YYYY-MM-DD");
						else next[f.key] = raw ?? "";
					});
					setForm(next);
				}
			} catch (e: any) {
				setToast({ type: "error", message: e?.response?.data?.message || e?.message || "Lỗi tải dữ liệu" });
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [mode, sport, athleteId, id]);

	React.useEffect(() => {
		if (mode === "add") {
			const init: Record<string, any> = {};
			defs[sport].forEach((f) => {
				if (f.type === "date") init[f.key] = dayjs().format("YYYY-MM-DD");
				else init[f.key] = "";
			});
			setForm(init);
		}
	}, [mode, sport]);

	const change = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

	const onSubmit = async () => {
		try {
			setSaving(true);
			const payload = { athlete_id: athleteId, ...normalizeForSend(sport, form) };
			if (mode === "add") {
				if (sport === "shooting") await addShootingCompetition(payload as any);
				else if (sport === "archery") await addArcheryCompetition(payload as any);
				else if (sport === "boxing") await addBoxingCompetition(payload as any);
				else if (sport === "taekwondo") await addTaekwondoCompetition(payload as any);
			} else if (mode === "update" && id) {
				if (sport === "shooting") await updateShootingCompetitionById(id, payload as Partial<ShootingCompetitionDTO>);
				else if (sport === "archery") await updateArcheryCompetitionById(id, payload as Partial<ArcheryCompetitionDTO>);
				else if (sport === "boxing") await updateBoxingCompetitionById(id, payload as Partial<BoxingCompetitionDTO>);
				else if (sport === "taekwondo")
					await updateTaekwondoCompetitionById(id, payload as Partial<TaekwondoCompetitionDTO>);
			}
			setToast({ type: "success", message: "Đã lưu thành công" });
			window.setTimeout(() => {
				if (typeof window !== "undefined" && window.history.length > 1) {
					router.back();
				} else {
					router.push("/");
				}
			}, 1200);
		} catch (e: any) {
			setToast({ type: "error", message: e?.response?.data?.message || e?.message || "Lỗi kết nối Cơ Sở Dữ Liệu" });
		} finally {
			setSaving(false);
		}
	};

	return (
		<Card>
			<CardHeader title={title} />
			<Divider />
			<CardContent>
				<Box
					sx={{
						display: "flex",
						flexWrap: "wrap",
						gap: 2,
						"& > .field": {
							flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 16px)", md: "1 1 calc(33.333% - 16px)" },
							minWidth: 0,
						},
					}}
				>
					{defs[sport].map((f) => {
						if (f.key === "competition_id") {
							return (
								<Box key={f.key} className="field">
									<TextField
										select
										fullWidth
										required
										label={f.label}
										value={form[f.key] ?? ""}
										onChange={(e) => change(f.key, e.target.value)}
									>
										{competitions.map((c) => (
											<MenuItem key={c.id} value={c.id}>
												{c.competition_name || `#${c.id}`}
											</MenuItem>
										))}
									</TextField>
								</Box>
							);
						}
						if (f.key === "medal_won") {
							return (
								<Box key={f.key} className="field">
									<TextField
										select
										fullWidth
										label={f.label}
										value={form[f.key] ?? ""}
										onChange={(e) => change(f.key, e.target.value)}
									>
										{medalOptions.map((o) => (
											<MenuItem key={o.value} value={o.value}>
												{o.label}
											</MenuItem>
										))}
									</TextField>
								</Box>
							);
						}
						if (f.key === "opponent_user_id") {
							return (
								<Box key={f.key} className="field">
									<TextField
										select
										fullWidth
										label={f.label}
										value={form[f.key] ?? ""}
										onChange={(e) => change(f.key, e.target.value)}
									>
										<MenuItem value="">Không chọn</MenuItem>
										{users.map((u) => (
											<MenuItem key={u.id} value={u.id}>
												{[u.lastName, u.firstName].filter(Boolean).join(" ") || u.email || `User #${u.id}`}
											</MenuItem>
										))}
									</TextField>
								</Box>
							);
						}
						return (
							<Box key={f.key} className="field">
								<TextField
									fullWidth
									required={!!f.required}
									type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
									label={f.label}
									value={form[f.key] ?? ""}
									InputLabelProps={f.type === "date" ? { shrink: true } : undefined}
									onChange={(e) => change(f.key, e.target.value)}
									size="medium"
									multiline={f.type === "textarea"}
									minRows={f.type === "textarea" ? 4 : undefined}
								/>
							</Box>
						);
					})}
				</Box>
				<Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
					<Button variant="outlined" onClick={() => router.back()} disabled={saving || loading}>
						Hủy
					</Button>
					<Button variant="contained" onClick={onSubmit} disabled={saving || loading}>
						{saving ? "Đang lưu..." : "Lưu"}
					</Button>
				</Stack>
			</CardContent>

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
		</Card>
	);
}
