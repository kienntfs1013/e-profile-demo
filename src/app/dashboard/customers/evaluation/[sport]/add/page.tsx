"use client";

import { useParams, useSearchParams } from "next/navigation";

import EvaluationForm, { SportKey } from "@/components/evaluation/EvaluationForm";

const ALLOWED: SportKey[] = ["archery", "boxing", "shooting", "taekwondo"];

export default function Page() {
	const params = useParams<{ sport: string }>();
	const search = useSearchParams();

	const sport = (params?.sport ?? "").toString().toLowerCase() as SportKey;
	if (!ALLOWED.includes(sport)) throw new Error("Sport không hợp lệ");

	const athleteId = Number(search.get("athlete") ?? "");

	const titles: Record<SportKey, string> = {
		archery: "Thêm đánh giá — Bắn cung",
		boxing: "Thêm đánh giá — Boxing",
		shooting: "Thêm đánh giá — Bắn súng",
		taekwondo: "Thêm đánh giá — Taekwondo",
	};

	return <EvaluationForm sport={sport} mode="add" athleteId={athleteId} title={titles[sport]} />;
}
