"use client";

import * as React from "react";
import { getIotDataByPhone, HrRow, setGoCareCredentials, SleepRow, Spo2Row, StepsRow } from "@/services/gocare.service";
import { fetchUserByIdFromList, getLoggedInUserId, getUserById, type UserDTO } from "@/services/user.service";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Drop } from "@phosphor-icons/react/dist/ssr/Drop";
import { Footprints } from "@phosphor-icons/react/dist/ssr/Footprints";
import { Heartbeat } from "@phosphor-icons/react/dist/ssr/Heartbeat";
import { Moon } from "@phosphor-icons/react/dist/ssr/Moon";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

type Group = "vitals" | "activity" | "labs" | "all";
type StatusKey = "all" | "good" | "normal" | "danger";

type Metric = {
	key: string;
	label: string;
	value: string;
	unit?: string;
	helper?: string;
	icon: React.ElementType;
	color: string;
	badge?: string;
	group: Group;
};

type DayPoint = { d: string; bpm?: number; steps?: number; spo2?: number; sleepH?: number; glucose?: number };

type Extra = {
	phoneNumber?: string;
	phone?: string;
	mobile?: string;
};

const PIE_COLORS = ["#22c55e", "#ef4444", "#6366f1"];

function toNumber(v: string): number {
	return Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
}

function parseSleepHours(v: string): number {
	const m = /(\d+)\s*h(?:\s*(\d+)\s*m)?/i.exec(v);
	if (!m) return 0;
	const h = Number(m[1] || 0);
	const min = Number(m[2] || 0);
	return h + min / 60;
}

function parseBP(v: string): { sys: number; dia: number } {
	const [s, d] = v.split("/").map((x) => Number(x));
	return { sys: s || 0, dia: d || 0 };
}

function evaluateMetric(m: Metric): { key: StatusKey; label: string; color: "success" | "warning" | "error" } {
	switch (m.key) {
		case "spo2": {
			const n = toNumber(m.value);
			if (n >= 97) return { key: "good", label: "Tốt", color: "success" };
			if (n >= 94) return { key: "normal", label: "Bình thường", color: "warning" };
			return { key: "danger", label: "Nguy hiểm", color: "error" };
		}
		case "bpm": {
			const n = toNumber(m.value);
			if (n >= 60 && n <= 80) return { key: "good", label: "Tốt", color: "success" };
			if ((n > 80 && n <= 100) || (n >= 50 && n < 60)) return { key: "normal", label: "Bình thường", color: "warning" };
			return { key: "danger", label: "Nguy hiểm", color: "error" };
		}
		case "bp": {
			const { sys, dia } = parseBP(m.value);
			if (sys >= 90 && sys <= 120 && dia >= 60 && dia <= 80) return { key: "good", label: "Tốt", color: "success" };
			if ((sys > 120 && sys < 140) || (dia > 80 && dia < 90))
				return { key: "normal", label: "Bình thường", color: "warning" };
			if (sys >= 140 || dia >= 90 || sys < 85 || dia < 55) return { key: "danger", label: "Nguy hiểm", color: "error" };
			return { key: "normal", label: "Bình thường", color: "warning" };
		}
		case "temp": {
			const n = toNumber(m.value);
			if (n >= 36.4 && n <= 36.9) return { key: "good", label: "Tốt", color: "success" };
			if ((n >= 36.1 && n < 36.4) || (n > 36.9 && n <= 37.2))
				return { key: "normal", label: "Bình thường", color: "warning" };
			return { key: "danger", label: "Nguy hiểm", color: "error" };
		}
		case "glucose": {
			const n = toNumber(m.value);
			if (n >= 70 && n <= 99) return { key: "good", label: "Tốt", color: "success" };
			if ((n >= 100 && n <= 125) || (n >= 60 && n < 70))
				return { key: "normal", label: "Bình thường", color: "warning" };
			return { key: "danger", label: "Nguy hiểm", color: "error" };
		}
		case "sleep": {
			const h = parseSleepHours(m.value);
			if (h >= 7) return { key: "good", label: "Tốt", color: "success" };
			if (h >= 6) return { key: "normal", label: "Bình thường", color: "warning" };
			return { key: "danger", label: "Nguy hiểm", color: "error" };
		}
		case "steps": {
			const n = toNumber(m.value);
			if (n >= 7000) return { key: "good", label: "Tốt", color: "success" };
			if (n >= 4000) return { key: "normal", label: "Bình thường", color: "warning" };
			return { key: "danger", label: "Nguy hiểm", color: "error" };
		}
		case "hrv": {
			const n = toNumber(m.value);
			if (n >= 50) return { key: "good", label: "Tốt", color: "success" };
			if (n >= 35) return { key: "normal", label: "Bình thường", color: "warning" };
			return { key: "danger", label: "Nguy hiểm", color: "error" };
		}
		case "ecg": {
			const ok = /bình thường|normal/i.test(m.value);
			return ok
				? { key: "good", label: "Tốt", color: "success" }
				: { key: "danger", label: "Nguy hiểm", color: "error" };
		}
		case "uric": {
			const n = toNumber(m.value);
			if (n > 7.2 || n < 2.5) return { key: "danger", label: "Nguy hiểm", color: "error" };
			if (n >= 5 && n <= 6.5) return { key: "good", label: "Tốt", color: "success" };
			return { key: "normal", label: "Bình thường", color: "warning" };
		}
		default:
			return { key: "normal", label: "Bình thường", color: "warning" };
	}
}

function StatCard({ m }: { m: Metric }) {
	const Icon = m.icon;
	const status = evaluateMetric(m);
	return (
		<Paper
			variant="outlined"
			sx={{
				p: 2,
				borderRadius: 2,
				height: "100%",
				display: "flex",
				flexDirection: "column",
				gap: 1,
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
				<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
					{m.label}
				</Typography>
				<Box
					sx={{
						width: 36,
						height: 36,
						borderRadius: "999px",
						bgcolor: m.color,
						color: "#fff",
						display: "grid",
						placeItems: "center",
						flex: "0 0 auto",
					}}
				>
					<Icon weight="fill" />
				</Box>
			</Box>
			<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
				<Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
					<Typography variant="h5" sx={{ fontWeight: 800 }}>
						{m.value}
					</Typography>
					{m.unit ? (
						<Typography variant="body2" color="text.secondary">
							{m.unit}
						</Typography>
					) : null}
				</Box>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<Chip size="small" color={status.color} label={status.label} />
				</Box>
			</Box>
			{m.helper ? (
				<Typography variant="caption" color="text.secondary">
					{m.helper}
				</Typography>
			) : null}
		</Paper>
	);
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
	return (
		<Card sx={{ height: 415, borderRadius: 2, minWidth: 0 }}>
			<CardContent sx={{ height: "100%" }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
					{title}
				</Typography>
				<Box sx={{ height: "80%" }}>
					{React.isValidElement(children) ? (
						<ResponsiveContainer width="100%" height="100%">
							{children}
						</ResponsiveContainer>
					) : (
						<Box sx={{ display: "grid", placeItems: "center", height: "100%" }}>
							<Typography variant="body2" color="text.secondary">
								Không có dữ liệu biểu đồ
							</Typography>
						</Box>
					)}
				</Box>
			</CardContent>
		</Card>
	);
}

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

function normalizePhone(p?: string | null) {
	const digits = String(p || "").replace(/\D+/g, "");
	if (digits.startsWith("0")) return digits.slice(1);
	if (digits.startsWith("84") && digits.length >= 10) return digits.slice(2);
	return digits;
}

function toE164(phoneDigits: string, prefix = "84") {
	const p = String(prefix || "84").replace(/\D+/g, "") || "84";
	const d = normalizePhone(phoneDigits);
	if (!d) return "";
	return d.startsWith(p) ? d : `${p}${d}`;
}

function extractPhoneFromUser(u: (UserDTO & Extra) | null | undefined): string {
	const raw =
		(String((u as any)?.phoneNumber || "").trim() ||
			String((u as any)?.phone || "").trim() ||
			String((u as any)?.mobile || "").trim()) ??
		"";
	return normalizePhone(raw);
}

async function resolvePhoneFromUserDetail(targetUserId?: number): Promise<string> {
	if (!targetUserId) return "";
	const detail = await getUserById(targetUserId).catch(() => null);
	const phone = extractPhoneFromUser((detail as any) ?? null);
	if (phone) return phone;

	const fromList = await fetchUserByIdFromList(targetUserId).catch(() => null);
	return extractPhoneFromUser((fromList as any) ?? null);
}

function buildFakeSeries(days: number, startMs: number): DayPoint[] {
	const rows: DayPoint[] = [];
	for (let i = 0; i < days; i++) {
		const k = startMs + i * 86400000;
		const wave = Math.sin(i / 2.3);
		const steps = Math.round(5200 + (i % 2 ? 1200 : 650) + wave * 900);
		const bpm = Math.round(66 + wave * 6 + (i % 3) * 2);
		const spo2 = Math.round(96 + (wave > 0 ? 1 : 0));
		const sleepH = +Math.max(5.2, Math.min(8.8, 7.1 + Math.cos(i / 2.8) * 0.8)).toFixed(1);
		rows.push({ d: fmtDay(k), bpm, steps, spo2, sleepH });
	}
	return rows;
}

function buildFakeMetricsFromSeries(last: DayPoint): Metric[] {
	return [
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
	];
}

function buildSleepPieFromSeries(rows: DayPoint[]) {
	const totalSleep = rows.reduce((acc, r) => acc + (r.sleepH || 0), 0);
	const deep = +(totalSleep * 0.35).toFixed(1);
	const light = +(totalSleep * 0.45).toFixed(1);
	const rem = +(totalSleep - deep - light).toFixed(1);
	return [
		{ name: "Ngủ sâu", value: deep },
		{ name: "Ngủ nông", value: light },
		{ name: "REM", value: rem },
	];
}

function hasAnyRealData(rows: DayPoint[]) {
	return rows.length > 0 && rows.some((r) => (r.bpm ?? r.steps ?? r.spo2 ?? r.sleepH) != null);
}

function fillMissingWithFake(rows: DayPoint[], days: number, startMs: number): DayPoint[] {
	const fake = buildFakeSeries(days, startMs);
	const byD = new Map<string, DayPoint>();
	fake.forEach((r) => byD.set(r.d, r));
	const out: DayPoint[] = [];
	for (let i = 0; i < days; i++) {
		const d = fmtDay(startMs + i * 86400000);
		const real = rows.find((x) => x.d === d);
		if (!real) out.push(byD.get(d)!);
		else {
			const f = byD.get(d)!;
			out.push({
				d,
				bpm: real.bpm ?? f.bpm,
				steps: real.steps ?? f.steps,
				spo2: real.spo2 ?? f.spo2,
				sleepH: real.sleepH ?? f.sleepH,
				glucose: real.glucose ?? f.glucose,
			});
		}
	}
	return out;
}

export function HealthSection({ id }: { id?: number | string }) {
	const [date, setDate] = React.useState<string>(new Date().toISOString().slice(0, 10));
	const [range, setRange] = React.useState<"7d" | "30d">("7d");
	const [type, setType] = React.useState<Group>("all");
	const [status, setStatus] = React.useState<StatusKey>("all");
	const [series, setSeries] = React.useState<DayPoint[]>([]);
	const [sleepPie, setSleepPie] = React.useState<{ name: string; value: number }[]>([]);
	const [metrics, setMetrics] = React.useState<Metric[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [user, setUser] = React.useState<(UserDTO & Extra) | null>(null);

	React.useEffect(() => {
		setGoCareCredentials({
			baseURL: process.env.NEXT_PUBLIC_GOCARE_API || "https://portal.gocare.vn/api",
			tenant: process.env.NEXT_PUBLIC_GOCARE_TENANT || "epr",
			partnerId: process.env.NEXT_PUBLIC_GOCARE_PARTNER_ID,
			partnerSecret: process.env.NEXT_PUBLIC_GOCARE_PARTNER_SECRET,
		});
	}, []);

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

	const fetchData = React.useCallback(async () => {
		const viewerId = getLoggedInUserId?.();
		const targetUserId = id != null && !Number.isNaN(Number(id)) ? Number(id) : viewerId || undefined;

		const end = new Date(date + "T23:59:59").getTime();
		const days = range === "7d" ? 7 : 30;
		const start = startOfDayMs(new Date(end - (days - 1) * 24 * 60 * 60 * 1000));

		const phoneDigits = await resolvePhoneFromUserDetail(targetUserId);
		const phone = phoneDigits ? toE164(phoneDigits, process.env.NEXT_PUBLIC_GOCARE_PHONE_PREFIX || "84") : "";

		if (!phone) {
			const fake = buildFakeSeries(days, start);
			setSeries(fake);
			setSleepPie(buildSleepPieFromSeries(fake));
			setMetrics(buildFakeMetricsFromSeries(fake[fake.length - 1] || { d: fmtDay(end) }));
			return;
		}

		setLoading(true);
		try {
			const [hrs, spo2s, steps, sleeps] = await Promise.all([
				getIotDataByPhone<"hr">("hr", phone, start, end),
				getIotDataByPhone<"spo2">("spo2", phone, start, end),
				getIotDataByPhone<"steps">("steps", phone, start, end),
				getIotDataByPhone<"sleep">("sleep", phone, start, end),
			]);

			const map = new Map<number, { hr: number[]; sp: number[]; st: number; slHours: number[] }>();

			hrs.forEach((r: HrRow) => {
				const t = Number(r.timestamp || 0);
				if (!t) return;
				const k = startOfDayMs(new Date(t));
				const m = map.get(k) || { hr: [], sp: [], st: 0, slHours: [] };
				if (typeof r.heartValue === "number") m.hr.push(r.heartValue);
				map.set(k, m);
			});

			spo2s.forEach((r: Spo2Row) => {
				const t = Number(r.timestamp || 0);
				if (!t) return;
				const k = startOfDayMs(new Date(t));
				const m = map.get(k) || { hr: [], sp: [], st: 0, slHours: [] };
				if (typeof r.oxygenValue === "number") m.sp.push(r.oxygenValue);
				map.set(k, m);
			});

			steps.forEach((r: StepsRow) => {
				const t = Number(r.timestamp || 0);
				if (!t) return;
				const k = startOfDayMs(new Date(t));
				const m = map.get(k) || { hr: [], sp: [], st: 0, slHours: [] };
				if (typeof r.stepValue === "number") m.st += r.stepValue;
				map.set(k, m);
			});

			sleeps.forEach((r: SleepRow) => {
				const sl = Number(r.sleepTime || 0);
				const wk = Number(r.wakeupTime || 0);
				if (sl && wk && wk > sl) {
					const k = startOfDayMs(new Date(sl));
					const m = map.get(k) || { hr: [], sp: [], st: 0, slHours: [] };
					const hours = (wk - sl) / 3600000;
					m.slHours.push(hours);
					map.set(k, m);
				}
			});

			const rows: DayPoint[] = [];
			for (let i = 0; i < days; i++) {
				const k = start + i * 86400000;
				const v = map.get(k) || { hr: [], sp: [], st: 0, slHours: [] };
				const avg = (arr: number[]) =>
					arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : undefined;
				const sl = v.slHours.length ? +v.slHours.reduce((a, b) => a + b, 0).toFixed(1) : undefined;
				rows.push({
					d: fmtDay(k),
					bpm: avg(v.hr),
					steps: v.st ? Math.round(v.st) : undefined,
					spo2: avg(v.sp),
					sleepH: sl,
				});
			}

			const fixed = hasAnyRealData(rows) ? fillMissingWithFake(rows, days, start) : buildFakeSeries(days, start);
			const last = fixed[fixed.length - 1] || { d: fmtDay(end) };

			setSeries(fixed);
			setSleepPie(buildSleepPieFromSeries(fixed));
			setMetrics(buildFakeMetricsFromSeries(last));
		} catch {
			const fake = buildFakeSeries(days, start);
			setSeries(fake);
			setSleepPie(buildSleepPieFromSeries(fake));
			setMetrics(buildFakeMetricsFromSeries(fake[fake.length - 1] || { d: fmtDay(end) }));
		} finally {
			setLoading(false);
		}
	}, [id, date, range]);

	React.useEffect(() => {
		fetchData();
	}, [fetchData]);

	const visible = React.useMemo(
		() => metrics.filter((x) => (type === "all" ? true : x.group === type)),
		[metrics, type]
	);
	const visibleWithEval = React.useMemo(() => visible.map((m) => ({ metric: m, eval: evaluateMetric(m) })), [visible]);
	const filtered = React.useMemo(
		() => visibleWithEval.filter((x) => (status === "all" ? true : x.eval.key === status)),
		[visibleWithEval, status]
	);

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
			<Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, width: "100%" }}>
				<TextField
					select
					size="small"
					label="Loại chỉ số"
					value={type}
					onChange={(e) => setType(e.target.value as Group)}
					sx={{ flex: "1 1 200px" }}
				>
					<MenuItem value="all">Tất cả</MenuItem>
					<MenuItem value="vitals">Sinh tồn</MenuItem>
					<MenuItem value="activity">Hoạt động</MenuItem>
					<MenuItem value="labs">Xét nghiệm</MenuItem>
				</TextField>
				<TextField
					type="date"
					size="small"
					label="Ngày kết thúc"
					value={date}
					onChange={(e) => setDate(e.target.value)}
					InputLabelProps={{ shrink: true }}
					sx={{ flex: "1 1 200px" }}
				/>
				<TextField
					select
					size="small"
					label="Khoảng thời gian"
					value={range}
					onChange={(e) => setRange(e.target.value as "7d" | "30d")}
					sx={{ flex: "1 1 200px" }}
				>
					<MenuItem value="7d">7 ngày</MenuItem>
					<MenuItem value="30d">1 tháng</MenuItem>
				</TextField>
				<TextField
					select
					size="small"
					label="Tình trạng"
					value={status}
					onChange={(e) => setStatus(e.target.value as StatusKey)}
					sx={{ flex: "1 1 200px" }}
				>
					<MenuItem value="all">Tất cả</MenuItem>
					<MenuItem value="good">Tốt</MenuItem>
					<MenuItem value="normal">Bình thường</MenuItem>
					<MenuItem value="danger">Nguy hiểm</MenuItem>
				</TextField>
			</Box>

			<Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between" }}>
				{filtered.map(({ metric }) => (
					<Box key={metric.key} sx={{ flex: "1 1 calc(20% - 16px)", minWidth: 160 }}>
						<StatCard m={metric} />
					</Box>
				))}
			</Box>

			<Box
				sx={{
					display: "grid",
					gap: 2,
					gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
					alignItems: "stretch",
				}}
			>
				<Box sx={{ minWidth: 0 }}>
					<ChartCard title={`Bước đi theo ngày (${range === "7d" ? "7 ngày" : "30 ngày"})`}>
						<BarChart data={loading ? [] : series}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="d" />
							<YAxis />
							<Tooltip />
							<Bar dataKey="steps" fill="#6366f1" />
						</BarChart>
					</ChartCard>
				</Box>
				<Box sx={{ minWidth: 0 }}>
					<ChartCard title="Nhịp tim (BPM) theo ngày">
						<LineChart data={loading ? [] : series}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="d" />
							<YAxis />
							<Tooltip />
							<Legend />
							<Line type="monotone" dataKey="bpm" dot={false} />
						</LineChart>
					</ChartCard>
				</Box>
				<Box sx={{ minWidth: 0 }}>
					<ChartCard title={`Cấu trúc giấc ngủ (${range === "7d" ? "7 ngày" : "30 ngày"})`}>
						<PieChart>
							<Tooltip />
							<Legend />
							<Pie data={sleepPie} dataKey="value" nameKey="name" outerRadius={110} label>
								{sleepPie.map((_, i) => (
									<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
								))}
							</Pie>
						</PieChart>
					</ChartCard>
				</Box>
				<Box sx={{ minWidth: 0 }}>
					<ChartCard title="SpO₂ & Đường huyết theo ngày">
						<LineChart data={loading ? [] : series}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="d" />
							<YAxis />
							<Tooltip />
							<Legend />
							<Line type="monotone" dataKey="spo2" dot={false} />
							<Line type="monotone" dataKey="glucose" dot={false} />
						</LineChart>
					</ChartCard>
				</Box>
			</Box>
		</Box>
	);
}
