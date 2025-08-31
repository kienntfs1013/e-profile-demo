// src/components/training/PracticeForm.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	addArcheryPractice,
	addBoxingPractice,
	addShootingPractice,
	addTaekwondoPractice,
	listArcheryPracticesByAthlete,
	listBoxingPracticesByAthlete,
	listShootingPracticesByAthlete,
	listTaekwondoPracticesByAthlete,
	updateArcheryPracticeById,
	updateBoxingPracticeById,
	updateShootingPracticeById,
	updateTaekwondoPracticeById,
	type ArcheryPracticeDTO,
	type BoxingPracticeDTO,
	type ShootingPracticeDTO,
	type TaekwondoPracticeDTO,
} from "@/services/practice.service";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";

export type SportKey = "shooting" | "archery" | "boxing" | "taekwondo";
type Mode = "add" | "update";

type FieldDef = { key: string; label: string; type?: "text" | "number" | "date"; required?: boolean };

const defs: Record<SportKey, FieldDef[]> = {
	shooting: [
		{ key: "session_date", label: "Ngày tập", type: "date", required: true },
		{ key: "weapon_type", label: "Loại súng", type: "text", required: true },
		{ key: "distance", label: "Cự ly (m)", type: "number" },
		{ key: "target_type", label: "Loại bia", type: "text" },
		{ key: "shots_fired", label: "Số phát bắn", type: "number" },
		{ key: "shots_hit", label: "Trúng đích", type: "number" },
		{ key: "accuracy", label: "Độ chính xác (%)", type: "number" },
		{ key: "notes", label: "Ghi chú", type: "text" },
	],
	archery: [
		{ key: "session_date", label: "Ngày tập", type: "date", required: true },
		{ key: "target_distance", label: "Cự ly (m)", type: "number" },
		{ key: "end_number", label: "End số", type: "number" },
		{ key: "arrow_number", label: "Mũi tên số", type: "number" },
		{ key: "score", label: "Điểm", type: "number" },
		{ key: "x_coord", label: "Lệch X", type: "number" },
		{ key: "y_coord", label: "Lệch Y", type: "number" },
	],
	boxing: [
		{ key: "round_number", label: "Hiệp", type: "number", required: true },
		{ key: "punches_thrown", label: "Cú ra đòn", type: "number" },
		{ key: "punches_landed", label: "Đòn trúng", type: "number" },
		{ key: "defense_success_rate", label: "Phòng thủ (%)", type: "number" },
		{ key: "footwork_score", label: "Footwork điểm", type: "number" },
		{ key: "sparring_partner", label: "Đối luyện với", type: "text" },
		{ key: "notes", label: "Ghi chú", type: "text" },
	],
	taekwondo: [
		{ key: "session_date", label: "Ngày tập", type: "date", required: true },
		{ key: "technique", label: "Kỹ thuật", type: "text" },
		{ key: "drills_practiced", label: "Drills", type: "text" },
		{ key: "sparring_duration", label: "Đấu đối kháng (phút)", type: "number" },
		{ key: "fitness_exercises", label: "Bài thể lực", type: "text" },
		{ key: "notes", label: "Ghi chú", type: "text" },
	],
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

export default function PracticeForm({
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

	React.useEffect(() => {
		if (mode !== "update" || !athleteId || !id) return;
		let cancelled = false;
		async function load() {
			try {
				setLoading(true);
				if (sport === "shooting") {
					const rows = await listShootingPracticesByAthlete(athleteId, "id-desc");
					const found = rows.find((r) => Number(r.id) === Number(id));
					if (!cancelled && found) {
						const next: Record<string, any> = {};
						defs.shooting.forEach((f) => {
							const raw = (found as any)[f.key];
							next[f.key] = f.type === "date" && raw ? String(raw).slice(0, 10) : (raw ?? "");
						});
						setForm(next);
					}
				} else if (sport === "archery") {
					const rows = await listArcheryPracticesByAthlete(athleteId, "id-desc");
					const found = rows.find((r) => Number(r.id) === Number(id));
					if (!cancelled && found) {
						const next: Record<string, any> = {};
						defs.archery.forEach((f) => {
							const raw = (found as any)[f.key];
							next[f.key] = f.type === "date" && raw ? String(raw).slice(0, 10) : (raw ?? "");
						});
						setForm(next);
					}
				} else if (sport === "boxing") {
					const rows = await listBoxingPracticesByAthlete(athleteId, "id-desc");
					const found = rows.find((r) => Number(r.id) === Number(id));
					if (!cancelled && found) {
						const next: Record<string, any> = {};
						defs.boxing.forEach((f) => {
							const raw = (found as any)[f.key];
							next[f.key] = raw ?? "";
						});
						setForm(next);
					}
				} else if (sport === "taekwondo") {
					const rows = await listTaekwondoPracticesByAthlete(athleteId, "id-desc");
					const found = rows.find((r) => Number(r.id) === Number(id));
					if (!cancelled && found) {
						const next: Record<string, any> = {};
						defs.taekwondo.forEach((f) => {
							const raw = (found as any)[f.key];
							next[f.key] = f.type === "date" && raw ? String(raw).slice(0, 10) : (raw ?? "");
						});
						setForm(next);
					}
				}
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
				if (sport === "shooting") await addShootingPractice(payload as any);
				else if (sport === "archery") await addArcheryPractice(payload as any);
				else if (sport === "boxing") await addBoxingPractice(payload as any);
				else if (sport === "taekwondo") await addTaekwondoPractice(payload as any);
			} else if (mode === "update" && id) {
				if (sport === "shooting") await updateShootingPracticeById(id, payload as Partial<ShootingPracticeDTO>);
				else if (sport === "archery") await updateArcheryPracticeById(id, payload as Partial<ArcheryPracticeDTO>);
				else if (sport === "boxing") await updateBoxingPracticeById(id, payload as Partial<BoxingPracticeDTO>);
				else if (sport === "taekwondo") await updateTaekwondoPracticeById(id, payload as Partial<TaekwondoPracticeDTO>);
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
					{defs[sport].map((f) => (
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
							/>
						</Box>
					))}
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
