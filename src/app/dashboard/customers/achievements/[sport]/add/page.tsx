"use client";

import { useParams, useSearchParams } from "next/navigation";

import AchievementForm, { SportKey } from "@/components/achievements/AchievementForm";

const ALLOWED: SportKey[] = ["archery", "boxing", "shooting", "taekwondo"];

export default function Page() {
	const params = useParams<{ sport: string }>();
	const search = useSearchParams();

	const sport = (params?.sport ?? "").toString().toLowerCase() as SportKey;
	if (!ALLOWED.includes(sport)) {
		throw new Error("Sport không hợp lệ");
	}

	const athleteId = Number(search.get("athlete") ?? "");

	const titles: Record<SportKey, string> = {
		archery: "Thêm thành tích — Bắn cung",
		boxing: "Thêm thành tích — Boxing",
		shooting: "Thêm thành tích — Bắn súng",
		taekwondo: "Thêm thành tích — Taekwondo",
	};

	return <AchievementForm sport={sport} mode="add" athleteId={athleteId} title={titles[sport]} />;
}
