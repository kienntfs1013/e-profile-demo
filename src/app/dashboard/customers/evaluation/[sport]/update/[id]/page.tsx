"use client";

import { useParams, useSearchParams } from "next/navigation";

import EvaluationForm, { SportKey } from "@/components/evaluation/EvaluationForm";

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
		archery: "Cập nhật đánh giá — Bắn cung",
		boxing: "Cập nhật đánh giá — Boxing",
		shooting: "Cập nhật đánh giá — Bắn súng",
		taekwondo: "Cập nhật đánh giá — Taekwondo",
	};

	return <EvaluationForm sport={sport} mode="update" athleteId={athleteId} id={id} title={titles[sport]} />;
}
