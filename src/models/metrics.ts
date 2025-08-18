// src/models/metrics.ts
import { Drop } from "@phosphor-icons/react/dist/ssr/Drop";
import { Footprints } from "@phosphor-icons/react/dist/ssr/Footprints";
import { Gauge } from "@phosphor-icons/react/dist/ssr/Gauge";
import { Heartbeat } from "@phosphor-icons/react/dist/ssr/Heartbeat";
import { Moon } from "@phosphor-icons/react/dist/ssr/Moon";
import { Pulse } from "@phosphor-icons/react/dist/ssr/Pulse";
import { Scales } from "@phosphor-icons/react/dist/ssr/Scales";
import { Syringe } from "@phosphor-icons/react/dist/ssr/Syringe";
import { TestTube } from "@phosphor-icons/react/dist/ssr/TestTube";
import { Thermometer } from "@phosphor-icons/react/dist/ssr/Thermometer";
import { Waveform } from "@phosphor-icons/react/dist/ssr/Waveform";

export type Metric = {
	key: string;
	label: string;
	value: string;
	unit?: string;
	helper?: string;
	icon: React.ElementType;
	color: string; // bg color for icon
	group: "vitals" | "activity" | "labs" | "all";
};

export const ALL_METRICS: Metric[] = [
	{ key: "spo2", label: "Oxy trong máu", value: "98", unit: "%", icon: Drop, color: "#22c55e", group: "vitals" },
	{ key: "bpm", label: "Nhịp tim", value: "72", unit: "BPM", icon: Heartbeat, color: "#ef4444", group: "vitals" },
	{ key: "bp", label: "Huyết áp", value: "118/76", unit: "mmHg", icon: Gauge, color: "#f97316", group: "vitals" },
	{ key: "temp", label: "Nhiệt độ", value: "36.6", unit: "°C", icon: Thermometer, color: "#3b82f6", group: "vitals" },
	{ key: "glucose", label: "Đường huyết", value: "92", unit: "mg/dL", icon: Syringe, color: "#ef4444", group: "labs" },
	{ key: "weight", label: "Cân nặng", value: "154.3", unit: "lb", icon: Scales, color: "#22c55e", group: "vitals" },
	{ key: "sleep", label: "Giấc ngủ", value: "7h 45m", icon: Moon, color: "#8b5cf6", group: "activity" },
	{
		key: "steps",
		label: "Bước đi",
		value: "3,580",
		helper: "35% mục tiêu",
		icon: Footprints,
		color: "#6366f1",
		group: "activity",
	},
	{ key: "hrv", label: "HRV", value: "42", unit: "ms", icon: Pulse, color: "#06b6d4", group: "vitals" },
	{ key: "ecg", label: "ECG", value: "Bình thường", icon: Waveform, color: "#f59e0b", group: "vitals" },
	{ key: "uric", label: "Uric Acid", value: "5.6", unit: "mg/dL", icon: TestTube, color: "#fb7185", group: "labs" },
];
