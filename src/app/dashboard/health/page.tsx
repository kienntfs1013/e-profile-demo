"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
	getIotDataByType,
	getUserProfileByPhone,
	HrRow,
	setGoCareCredentials,
	SleepRow,
	Spo2Row,
	StepsRow,
} from "@/services/gocare.service";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Drop } from "@phosphor-icons/react/dist/ssr/Drop";
import { Footprints } from "@phosphor-icons/react/dist/ssr/Footprints";
import { Heartbeat } from "@phosphor-icons/react/dist/ssr/Heartbeat";
import { Moon } from "@phosphor-icons/react/dist/ssr/Moon";
import { Scales } from "@phosphor-icons/react/dist/ssr/Scales";

const StepsBar = dynamic(() => import("./charts/StepsBar"), { ssr: false, loading: () => <Box height={320} /> });
const BpmLine = dynamic(() => import("./charts/BpmLine"), { ssr: false, loading: () => <Box height={320} /> });
const SleepPie = dynamic(() => import("./charts/SleepPie"), { ssr: false, loading: () => <Box height={320} /> });
const SpO2GlucoseLine = dynamic(() => import("./charts/SpO2GlucoseLine"), {
	ssr: false,
	loading: () => <Box height={320} />,
});

type HealthStatus = "good" | "normal" | "danger";
type HealthEval = { status: HealthStatus; label: string; chipColor: "success" | "warning" | "error" };

type Metric = {
	key: "spo2" | "bpm" | "sleep" | "steps" | "weight";
	label: string;
	value: string;
	unit?: string;
	helper?: string;
	icon: React.ElementType;
	color: string;
	group: "vitals" | "activity";
};

const toNumber = (s: string) => Number(String(s).replace(/[^\d.-]/g, ""));
const parseSleepHours = (h: number) => h;
const lbToKg = (lb: number) => +(lb * 0.453592).toFixed(2);

function evalMetric(m: Metric): HealthEval {
	switch (m.key) {
		case "spo2": {
			const v = toNumber(m.value);
			if (v >= 97) return { status: "good", label: "Tốt", chipColor: "success" };
			if (v >= 95) return { status: "normal", label: "Bình thường", chipColor: "warning" };
			return { status: "danger", label: "Nguy hiểm", chipColor: "error" };
		}
		case "bpm": {
			const v = toNumber(m.value);
			if (v >= 60 && v <= 80) return { status: "good", label: "Tốt", chipColor: "success" };
			if ((v >= 50 && v < 60) || (v > 80 && v <= 100))
				return { status: "normal", label: "Bình thường", chipColor: "warning" };
			return { status: "danger", label: "Nguy hiểm", chipColor: "error" };
		}
		case "sleep": {
			const h = parseSleepHours(toNumber(m.value));
			if (h >= 7 && h <= 9) return { status: "good", label: "Tốt", chipColor: "success" };
			if ((h >= 6 && h < 7) || (h > 9 && h <= 10))
				return { status: "normal", label: "Bình thường", chipColor: "warning" };
			return { status: "danger", label: "Nguy hiểm", chipColor: "error" };
		}
		case "steps": {
			const v = toNumber(m.value);
			if (v >= 8000) return { status: "good", label: "Tốt", chipColor: "success" };
			if (v >= 5000) return { status: "normal", label: "Bình thường", chipColor: "warning" };
			return { status: "danger", label: "Nguy hiểm", chipColor: "error" };
		}
		case "weight": {
			return { status: "normal", label: "Bình thường", chipColor: "warning" };
		}
		default:
			return { status: "normal", label: "Bình thường", chipColor: "warning" };
	}
}

const MetricCard = React.memo(function MetricCard({ m }: { m: Metric }) {
	const Icon = m.icon;
	const evalRes = evalMetric(m);
	const isWeightLb = m.key === "weight" && ((m.unit || "").toLowerCase() === "lb" || /lb/i.test(m.value));
	const displayValue = isWeightLb ? String(lbToKg(toNumber(m.value))) : m.value;
	const displayUnit = isWeightLb ? "kg" : m.unit;
	return (
		<Card sx={{ height: "100%", borderRadius: 2 }}>
			<CardContent>
				<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25, gap: 1 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: 600, flex: "1 1 auto", minWidth: 0 }}>
						{m.label}
					</Typography>
					<Box
						sx={{
							width: 32,
							height: 32,
							borderRadius: "999px",
							display: "grid",
							placeItems: "center",
							bgcolor: m.color,
							color: "#fff",
							flex: "0 0 auto",
						}}
					>
						<Icon weight="fill" />
					</Box>
				</Box>
				<Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
					<Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
						<Typography variant="h5" sx={{ fontWeight: 700 }}>
							{displayValue}
						</Typography>
						{displayUnit ? (
							<Typography variant="body2" color="text.secondary">
								{displayUnit}
							</Typography>
						) : null}
					</Box>
					<Chip size="small" label={evalRes.label} color={evalRes.chipColor} />
				</Box>
				{m.helper ? (
					<Typography variant="caption" color="text.secondary">
						{m.helper}
					</Typography>
				) : null}
			</CardContent>
		</Card>
	);
});

type DayPoint = { d: string; bpm?: number; steps?: number; spo2?: number; sleepH?: number; glucose?: number };

function startOfDayMs(d: Date) {
	const x = new Date(d);
	x.setHours(0, 0, 0, 0);
	return x.getTime();
}

function fmtDay(ms: number) {
	const d = new Date(ms);
	const dd = String(d.getDate()).padStart(2, "0");
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	return `${dd}/${mm}`;
}

function normPhoneToNumber(p: string) {
	const digits = p.replace(/\D+/g, "");
	if (digits.startsWith("0")) return digits.slice(1);
	if (digits.startsWith("84")) return digits.slice(2);
	return digits;
}

function buildFakeSeries(startIso: string, endIso: string): DayPoint[] {
	const start = new Date(startIso + "T00:00:00").getTime();
	const end = new Date(endIso + "T00:00:00").getTime();
	const days = Math.max(1, Math.min(31, Math.floor((end - start) / 86400000) + 1));

	const rows: DayPoint[] = [];
	for (let i = 0; i < days; i++) {
		const t = start + i * 86400000;
		const wave = Math.sin(i / 2.2);
		const steps = Math.round(5200 + (i % 2 ? 1200 : 600) + wave * 900);
		const bpm = Math.round(66 + wave * 6 + (i % 3) * 2);
		const spo2 = Math.round(96 + (wave > 0 ? 1 : 0));
		const sleepH = +Math.max(5.2, Math.min(8.8, 7.1 + Math.cos(i / 2.8) * 0.8)).toFixed(1);
		rows.push({ d: fmtDay(t), steps, bpm, spo2, sleepH });
	}
	return rows;
}

function buildFakeSleepPie(series: DayPoint[]) {
	const total = series.reduce((acc, r) => acc + (r.sleepH || 0), 0);
	const deep = +(total * 0.35).toFixed(1);
	const light = +(total * 0.45).toFixed(1);
	const rem = +(total - deep - light).toFixed(1);
	return [
		{ name: "Ngủ sâu", value: deep },
		{ name: "Ngủ nông", value: light },
		{ name: "REM", value: rem },
	];
}

export default function Page(): React.JSX.Element {
	const [startDate, setStartDate] = React.useState<string>(() => {
		const t = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
		return t.toISOString().slice(0, 10);
	});
	const [endDate, setEndDate] = React.useState<string>(() => new Date().toISOString().slice(0, 10));
	const [type, setType] = React.useState<"all" | "vitals" | "activity">("all");
	const [statusFilter, setStatusFilter] = React.useState<"all" | HealthStatus>("all");
	const [series, setSeries] = React.useState<DayPoint[]>([]);
	const [sleepPie, setSleepPie] = React.useState<{ name: string; value: number }[]>([]);
	const [metrics, setMetrics] = React.useState<Metric[]>([]);

	React.useEffect(() => {
		setGoCareCredentials({
			tenant: process.env.NEXT_PUBLIC_GOCARE_TENANT || "epr",
			partnerId: process.env.NEXT_PUBLIC_GOCARE_PARTNER_ID,
			partnerSecret: process.env.NEXT_PUBLIC_GOCARE_PARTNER_SECRET,
		});
	}, []);

	const fetchData = React.useCallback(async () => {
		console.groupCollapsed("%c[HealthPage] fetchData", "color:#8b5cf6");
		console.time("[HealthPage] fetchData");
		try {
			const startTime = new Date(startDate + "T00:00:00").getTime();
			const endTime = new Date(endDate + "T23:59:59").getTime();

			const envPhone = process.env.NEXT_PUBLIC_GOCARE_DEFAULT_PHONE || "0987999975";
			const envPrefix = process.env.NEXT_PUBLIC_GOCARE_PHONE_PREFIX || "84";
			const number = normPhoneToNumber(envPhone);

			let resolvedUserId: number | undefined = undefined;

			if (number) {
				const profile = await getUserProfileByPhone(envPrefix, number);
				const got = Number((profile as any)?.userId ?? (profile as any)?.id);
				if (Number.isFinite(got)) resolvedUserId = got;
			}

			if (!resolvedUserId) {
				const fallback = Number(process.env.NEXT_PUBLIC_GOCARE_DEFAULT_USER_ID || "");
				resolvedUserId = Number.isFinite(fallback) ? fallback : undefined;
			}

			if (!resolvedUserId) {
				const fakeSeries = buildFakeSeries(startDate, endDate);
				const last = fakeSeries[fakeSeries.length - 1] || {};
				const m: Metric[] = [
					{
						key: "spo2",
						label: "Oxy trong máu",
						value: last.spo2 != null ? String(last.spo2) : "—",
						unit: "%",
						icon: Drop,
						color: "#22c55e",
						group: "vitals",
					},
					{
						key: "bpm",
						label: "Nhịp tim",
						value: last.bpm != null ? String(last.bpm) : "—",
						unit: "BPM",
						icon: Heartbeat,
						color: "#ef4444",
						group: "vitals",
					},
					{
						key: "sleep",
						label: "Giấc ngủ",
						value: last.sleepH != null ? String(last.sleepH) : "—",
						unit: "h",
						icon: Moon,
						color: "#8b5cf6",
						group: "activity",
					},
					{
						key: "steps",
						label: "Bước đi",
						value: last.steps != null ? String(last.steps) : "—",
						icon: Footprints,
						color: "#6366f1",
						group: "activity",
					},
					{
						key: "weight",
						label: "Cân nặng",
						value: "154.3",
						unit: "lb",
						icon: Scales,
						color: "#0ea5e9",
						group: "vitals",
					},
				];
				setSeries(fakeSeries);
				setSleepPie(buildFakeSleepPie(fakeSeries));
				setMetrics(m);
				return;
			}

			const [hrs, spo2s, steps, sleeps] = await Promise.all([
				getIotDataByType("hr", startTime, endTime, resolvedUserId),
				getIotDataByType("spo2", startTime, endTime, resolvedUserId),
				getIotDataByType("steps", startTime, endTime, resolvedUserId),
				getIotDataByType("sleep", startTime, endTime, resolvedUserId),
			]);

			const map = new Map<number, { hr: number[]; sp: number[]; st: number; slHours: number[] }>();

			(hrs as HrRow[]).forEach((r) => {
				const t = r.timestamp ? Number(r.timestamp) : 0;
				const k = startOfDayMs(new Date(t));
				const m = map.get(k) || { hr: [], sp: [], st: 0, slHours: [] };
				if (typeof (r as any).heartValue === "number") m.hr.push((r as any).heartValue);
				map.set(k, m);
			});

			(spo2s as Spo2Row[]).forEach((r) => {
				const t = r.timestamp ? Number(r.timestamp) : 0;
				const k = startOfDayMs(new Date(t));
				const m = map.get(k) || { hr: [], sp: [], st: 0, slHours: [] };
				if (typeof (r as any).oxygenValue === "number") m.sp.push((r as any).oxygenValue);
				map.set(k, m);
			});

			(steps as StepsRow[]).forEach((r) => {
				const t = r.timestamp ? Number(r.timestamp) : 0;
				const k = startOfDayMs(new Date(t));
				const m = map.get(k) || { hr: [], sp: [], st: 0, slHours: [] };
				if (typeof (r as any).stepValue === "number") m.st += (r as any).stepValue;
				map.set(k, m);
			});

			(sleeps as SleepRow[]).forEach((r) => {
				const sl = Number((r as any).sleepTime || 0);
				const wk = Number((r as any).wakeupTime || 0);
				if (sl && wk && wk > sl) {
					const k = startOfDayMs(new Date(sl));
					const m = map.get(k) || { hr: [], sp: [], st: 0, slHours: [] };
					const hours = (wk - sl) / 3600000;
					m.slHours.push(hours);
					map.set(k, m);
				}
			});

			const keys = Array.from(map.keys()).sort((a, b) => a - b);
			const rows: DayPoint[] = keys.map((k) => {
				const v = map.get(k)!;
				const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : undefined);
				const sl = v.slHours.length ? v.slHours.reduce((a, b) => a + b, 0) : undefined;
				return {
					d: fmtDay(k),
					bpm: avg(v.hr) ? Math.round(avg(v.hr)!) : undefined,
					steps: v.st ? Math.round(v.st) : undefined,
					spo2: avg(v.sp) ? Math.round(avg(v.sp)!) : undefined,
					sleepH: sl ? +sl.toFixed(1) : undefined,
				};
			});

			const hasAny = rows.length > 0 && rows.some((r) => (r.bpm ?? r.spo2 ?? r.steps ?? r.sleepH) != null);

			const finalRows = hasAny ? rows : buildFakeSeries(startDate, endDate);
			const last = finalRows[finalRows.length - 1] || {};

			const m: Metric[] = [
				{
					key: "spo2",
					label: "Oxy trong máu",
					value: last.spo2 != null ? String(last.spo2) : "—",
					unit: "%",
					icon: Drop,
					color: "#22c55e",
					group: "vitals",
				},
				{
					key: "bpm",
					label: "Nhịp tim",
					value: last.bpm != null ? String(last.bpm) : "—",
					unit: "BPM",
					icon: Heartbeat,
					color: "#ef4444",
					group: "vitals",
				},
				{
					key: "sleep",
					label: "Giấc ngủ",
					value: last.sleepH != null ? String(last.sleepH) : "—",
					unit: "h",
					icon: Moon,
					color: "#8b5cf6",
					group: "activity",
				},
				{
					key: "steps",
					label: "Bước đi",
					value: last.steps != null ? String(last.steps) : "—",
					icon: Footprints,
					color: "#6366f1",
					group: "activity",
				},
				{
					key: "weight",
					label: "Cân nặng",
					value: "154.3",
					unit: "lb",
					icon: Scales,
					color: "#0ea5e9",
					group: "vitals",
				},
			];

			setSeries(finalRows);
			setSleepPie(buildFakeSleepPie(finalRows));
			setMetrics(m);
		} catch {
			const fakeSeries = buildFakeSeries(startDate, endDate);
			const last = fakeSeries[fakeSeries.length - 1] || {};
			const m: Metric[] = [
				{
					key: "spo2",
					label: "Oxy trong máu",
					value: last.spo2 != null ? String(last.spo2) : "—",
					unit: "%",
					icon: Drop,
					color: "#22c55e",
					group: "vitals",
				},
				{
					key: "bpm",
					label: "Nhịp tim",
					value: last.bpm != null ? String(last.bpm) : "—",
					unit: "BPM",
					icon: Heartbeat,
					color: "#ef4444",
					group: "vitals",
				},
				{
					key: "sleep",
					label: "Giấc ngủ",
					value: last.sleepH != null ? String(last.sleepH) : "—",
					unit: "h",
					icon: Moon,
					color: "#8b5cf6",
					group: "activity",
				},
				{
					key: "steps",
					label: "Bước đi",
					value: last.steps != null ? String(last.steps) : "—",
					icon: Footprints,
					color: "#6366f1",
					group: "activity",
				},
				{
					key: "weight",
					label: "Cân nặng",
					value: "154.3",
					unit: "lb",
					icon: Scales,
					color: "#0ea5e9",
					group: "vitals",
				},
			];
			setSeries(fakeSeries);
			setSleepPie(buildFakeSleepPie(fakeSeries));
			setMetrics(m);
		} finally {
			console.timeEnd("[HealthPage] fetchData");
			console.groupEnd();
		}
	}, [startDate, endDate]);

	React.useEffect(() => {
		fetchData();
	}, [fetchData]);

	const visible = React.useMemo(
		() => metrics.filter((m) => (type === "all" ? true : m.group === type)),
		[metrics, type]
	);
	const visibleWithEval = React.useMemo(() => visible.map((m) => ({ metric: m, eval: evalMetric(m) })), [visible]);
	const filtered = React.useMemo(
		() => visibleWithEval.filter((x) => (statusFilter === "all" ? true : x.eval.status === statusFilter)),
		[visibleWithEval, statusFilter]
	);

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			<Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
				<TextField
					type="date"
					size="small"
					label="Từ ngày"
					value={startDate}
					onChange={(e) => setStartDate(e.target.value)}
					InputLabelProps={{ shrink: true }}
					sx={{ flex: "1 1 220px", minWidth: 200 }}
				/>
				<TextField
					type="date"
					size="small"
					label="Đến ngày"
					value={endDate}
					onChange={(e) => setEndDate(e.target.value)}
					InputLabelProps={{ shrink: true }}
					sx={{ flex: "1 1 220px", minWidth: 200 }}
				/>
				<TextField
					select
					size="small"
					label="Nhóm"
					value={type}
					onChange={(e) => setType(e.target.value as any)}
					sx={{ flex: "1 1 220px", minWidth: 200 }}
				>
					<MenuItem value="all">Tất cả</MenuItem>
					<MenuItem value="vitals">Sinh tồn</MenuItem>
					<MenuItem value="activity">Hoạt động</MenuItem>
				</TextField>
				<TextField
					select
					size="small"
					label="Tình trạng"
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value as any)}
					sx={{ flex: "1 1 220px", minWidth: 200 }}
				>
					<MenuItem value="all">Tất cả</MenuItem>
					<MenuItem value="good">Tốt</MenuItem>
					<MenuItem value="normal">Bình thường</MenuItem>
					<MenuItem value="danger">Nguy hiểm</MenuItem>
				</TextField>
			</Box>

			<Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
				{filtered.slice(0, 5).map(({ metric }) => (
					<Box
						key={metric.key}
						sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(20% - 12px)" } }}
					>
						<MetricCard m={metric} />
					</Box>
				))}
			</Box>

			<Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
				<Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
					<Card sx={{ height: 400, borderRadius: 2 }}>
						<CardContent sx={{ height: "100%" }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
								Bước đi theo ngày
							</Typography>
							<StepsBar data={series} />
						</CardContent>
					</Card>
				</Box>

				<Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
					<Card sx={{ height: 400, borderRadius: 2 }}>
						<CardContent sx={{ height: "100%" }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
								Nhịp tim (BPM) theo ngày
							</Typography>
							<BpmLine data={series} />
						</CardContent>
					</Card>
				</Box>

				<Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
					<Card sx={{ height: 400, borderRadius: 2 }}>
						<CardContent sx={{ height: "100%" }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
								Cấu trúc giấc ngủ
							</Typography>
							<SleepPie data={sleepPie} />
						</CardContent>
					</Card>
				</Box>

				<Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
					<Card sx={{ height: 400, borderRadius: 2 }}>
						<CardContent sx={{ height: "100%" }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
								SpO₂
							</Typography>
							<SpO2GlucoseLine data={series} />
						</CardContent>
					</Card>
				</Box>
			</Box>
		</Box>
	);
}
