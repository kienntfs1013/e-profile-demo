"use client";

import { useParams, useSearchParams } from "next/navigation";

import AchievementForm, { type SportKey } from "@/components/achievements/AchievementForm";

const ALLOWED: SportKey[] = ["archery", "boxing", "shooting", "taekwondo"];

export default function Page() {
	const { sport: sportParam, id: idParam } = useParams<{ sport: string; id: string }>();
	const search = useSearchParams();

	const sport = (sportParam ?? "").toString().toLowerCase() as SportKey;
	if (!ALLOWED.includes(sport)) throw new Error("Sport không hợp lệ");

	const id = Number(idParam ?? "");
	if (Number.isNaN(id)) throw new Error("ID không hợp lệ");

	const athleteId = Number(search.get("athlete") ?? "");

	const titles: Record<SportKey, string> = {
		archery: "Cập nhật thành tích — Bắn cung",
		boxing: "Cập nhật thành tích — Boxing",
		shooting: "Cập nhật thành tích — Bắn súng",
		taekwondo: "Cập nhật thành tích — Taekwondo",
	};

	return <AchievementForm sport={sport} mode="update" athleteId={athleteId} id={id} title={titles[sport]} />;
}
