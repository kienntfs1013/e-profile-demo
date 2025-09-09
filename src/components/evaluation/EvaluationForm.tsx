"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	addArcheryPerformanceAssessment,
	addBoxingPerformanceAssessment,
	addShootingPerformanceAssessment,
	addTaekwondoPerformanceAssessment,
	listArcheryPerformanceAssessmentsByAthlete,
	listBoxingPerformanceAssessmentsByAthlete,
	listShootingPerformanceAssessmentsByAthlete,
	listTaekwondoPerformanceAssessmentsByAthlete,
	updateArcheryPerformanceAssessmentById,
	updateBoxingPerformanceAssessmentById,
	updateShootingPerformanceAssessmentById,
	updateTaekwondoPerformanceAssessmentById,
	type ArcheryPerformanceAssessmentDTO,
	type BoxingPerformanceAssessmentDTO,
	type ShootingPerformanceAssessmentDTO,
	type TaekwondoPerformanceAssessmentDTO,
} from "@/services/evaluation.service";
import { getLoggedInUserId } from "@/services/user.service";
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

type FieldDef = {
	key: "date" | "score" | "comments";
	label: string;
	type?: "text" | "number" | "date";
	required?: boolean;
};

const defs: Record<SportKey, FieldDef[]> = {
	shooting: [
		{ key: "date", label: "Ngày đánh giá", type: "date", required: true },
		{ key: "score", label: "Điểm", type: "number" },
		{ key: "comments", label: "Nội dung", type: "text" },
	],
	archery: [
		{ key: "date", label: "Ngày đánh giá", type: "date", required: true },
		{ key: "score", label: "Điểm", type: "number" },
		{ key: "comments", label: "Nội dung", type: "text" },
	],
	boxing: [
		{ key: "date", label: "Ngày đánh giá", type: "date", required: true },
		{ key: "score", label: "Điểm", type: "number" },
		{ key: "comments", label: "Nội dung", type: "text" },
	],
	taekwondo: [
		{ key: "date", label: "Ngày đánh giá", type: "date", required: true },
		{ key: "score", label: "Điểm", type: "number" },
		{ key: "comments", label: "Nội dung", type: "text" },
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

function readLocalAuthId(): number | undefined {
	try {
		const cand =
			Number(localStorage.getItem("uid")) ||
			Number(localStorage.getItem("user_id")) ||
			Number(localStorage.getItem("userId"));
		return Number.isFinite(cand) && cand > 0 ? cand : undefined;
	} catch {
		return undefined;
	}
}

export default function EvaluationForm({
	sport,
	mode,
	athleteId,
	id,
	title,
	coachId,
}: {
	sport: SportKey;
	mode: Mode;
	athleteId: number;
	id?: number;
	title: string;
	coachId?: number;
}) {
	const router = useRouter();
	const [form, setForm] = React.useState<Record<string, any>>({});
	const [saving, setSaving] = React.useState(false);
	const [loading, setLoading] = React.useState(mode === "update");
	const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
	const [coach, setCoach] = React.useState<number | undefined>(coachId);

	React.useEffect(() => {
		if (!coachId) {
			let uid = getLoggedInUserId();
			if (!uid) {
				const localId = readLocalAuthId();
				uid = typeof localId === "undefined" ? null : localId;
			}
			if (uid && Number.isFinite(uid)) setCoach(Number(uid));
		}
	}, [coachId]);

	React.useEffect(() => {
		if (mode !== "update" || !athleteId || !id) return;
		let cancelled = false;

		async function load() {
			try {
				setLoading(true);
				if (sport === "shooting") {
					const rows = await listShootingPerformanceAssessmentsByAthlete(athleteId, "id-desc");
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
					const rows = await listArcheryPerformanceAssessmentsByAthlete(athleteId, "id-desc");
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
					const rows = await listBoxingPerformanceAssessmentsByAthlete(athleteId, "id-desc");
					const found = rows.find((r) => Number(r.id) === Number(id));
					if (!cancelled && found) {
						const next: Record<string, any> = {};
						defs.boxing.forEach((f) => {
							const raw = (found as any)[f.key];
							next[f.key] = f.type === "date" && raw ? String(raw).slice(0, 10) : (raw ?? "");
						});
						setForm(next);
					}
				} else if (sport === "taekwondo") {
					const rows = await listTaekwondoPerformanceAssessmentsByAthlete(athleteId, "id-desc");
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
			const payloadBase = { athlete_id: athleteId, ...(coach ? { coach_id: coach } : {}) };
			const payload = { ...payloadBase, ...normalizeForSend(sport, form) };

			if (mode === "add") {
				if (sport === "shooting")
					await addShootingPerformanceAssessment(payload as Omit<ShootingPerformanceAssessmentDTO, "id">);
				else if (sport === "archery")
					await addArcheryPerformanceAssessment(payload as Omit<ArcheryPerformanceAssessmentDTO, "id">);
				else if (sport === "boxing")
					await addBoxingPerformanceAssessment(payload as Omit<BoxingPerformanceAssessmentDTO, "id">);
				else if (sport === "taekwondo")
					await addTaekwondoPerformanceAssessment(payload as Omit<TaekwondoPerformanceAssessmentDTO, "id">);
			} else if (mode === "update" && id) {
				if (sport === "shooting")
					await updateShootingPerformanceAssessmentById(id, payload as Partial<ShootingPerformanceAssessmentDTO>);
				else if (sport === "archery")
					await updateArcheryPerformanceAssessmentById(id, payload as Partial<ArcheryPerformanceAssessmentDTO>);
				else if (sport === "boxing")
					await updateBoxingPerformanceAssessmentById(id, payload as Partial<BoxingPerformanceAssessmentDTO>);
				else if (sport === "taekwondo")
					await updateTaekwondoPerformanceAssessmentById(id, payload as Partial<TaekwondoPerformanceAssessmentDTO>);
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
