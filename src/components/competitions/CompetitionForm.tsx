"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	addCompetition,
	listCompetitions,
	updateCompetitionById,
	type CompetitionMasterDTO,
} from "@/services/competitions-master.service";
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

type Mode = "add" | "update";

const SPORT_OPTIONS = [
	{ value: "Boxing", label: "Boxing" },
	{ value: "Bắn súng", label: "Bắn súng" },
	{ value: "Bắn cung", label: "Bắn cung" },
	{ value: "Taekwondo", label: "Taekwondo" },
];

export default function CompetitionForm({ mode, id, title }: { mode: Mode; id?: number; title: string }) {
	const router = useRouter();
	const [saving, setSaving] = React.useState(false);
	const [loading, setLoading] = React.useState(mode === "update");
	const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

	const [form, setForm] = React.useState<Partial<CompetitionMasterDTO>>({
		sport_type: "",
		competition_name: "",
		city: "",
		country: "",
		start_date: dayjs().format("YYYY-MM-DD"),
		end_date: dayjs().format("YYYY-MM-DD"),
	});

	React.useEffect(() => {
		if (mode !== "update" || !id) return;
		let cancelled = false;
		(async () => {
			try {
				setLoading(true);
				const all = await listCompetitions(undefined, "id-desc");
				const data = all.find((x) => Number(x.id) === Number(id));
				if (!cancelled && data) {
					setForm({
						sport_type: data.sport_type ?? "",
						competition_name: data.competition_name ?? "",
						city: data.city ?? "",
						country: data.country ?? "",
						start_date: (data.start_date ?? "").slice(0, 10),
						end_date: (data.end_date ?? "").slice(0, 10),
					});
				}
			} catch (e: any) {
				const msg = e?.response?.data?.message || e?.response?.data || e?.message || "Lỗi tải dữ liệu";
				setToast({ type: "error", message: msg });
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [mode, id]);

	const change = (k: keyof CompetitionMasterDTO, v: any) => setForm((p) => ({ ...p, [k]: v }));

	const onSubmit = async () => {
		try {
			setSaving(true);
			const payload: Partial<CompetitionMasterDTO> = {
				sport_type: form.sport_type?.toString().trim() || undefined,
				competition_name: form.competition_name?.toString().trim() || undefined,
				city: form.city?.toString().trim() || undefined,
				country: form.country?.toString().trim() || undefined,
				start_date: form.start_date ? dayjs(form.start_date).format("YYYY-MM-DD") : undefined,
				end_date: form.end_date ? dayjs(form.end_date).format("YYYY-MM-DD") : undefined,
			};

			if (mode === "add") {
				await addCompetition(payload);
			} else if (mode === "update" && id) {
				await updateCompetitionById(id, payload);
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
			const msg = e?.response?.data?.message || e?.response?.data || e?.message || "Lỗi kết nối Cơ Sở Dữ Liệu";
			setToast({ type: "error", message: msg });
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
					<Box className="field">
						<TextField
							select
							fullWidth
							required
							label="Bộ môn"
							value={form.sport_type ?? ""}
							onChange={(e) => change("sport_type", e.target.value)}
						>
							{SPORT_OPTIONS.map((o) => (
								<MenuItem key={o.value} value={o.value}>
									{o.label}
								</MenuItem>
							))}
						</TextField>
					</Box>

					<Box className="field">
						<TextField
							fullWidth
							required
							label="Tên giải đấu"
							value={form.competition_name ?? ""}
							onChange={(e) => change("competition_name", e.target.value)}
						/>
					</Box>

					<Box className="field">
						<TextField
							fullWidth
							label="Thành phố"
							value={form.city ?? ""}
							onChange={(e) => change("city", e.target.value)}
						/>
					</Box>

					<Box className="field">
						<TextField
							fullWidth
							label="Quốc gia"
							value={form.country ?? ""}
							onChange={(e) => change("country", e.target.value)}
						/>
					</Box>

					<Box className="field">
						<TextField
							fullWidth
							required
							type="date"
							label="Ngày bắt đầu"
							InputLabelProps={{ shrink: true }}
							value={form.start_date ?? ""}
							onChange={(e) => change("start_date", e.target.value)}
						/>
					</Box>

					<Box className="field">
						<TextField
							fullWidth
							required
							type="date"
							label="Ngày kết thúc"
							InputLabelProps={{ shrink: true }}
							value={form.end_date ?? ""}
							onChange={(e) => change("end_date", e.target.value)}
						/>
					</Box>
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
