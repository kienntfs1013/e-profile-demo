// src/app/dashboard/customers/training/[sport]/add/page.tsx
"use client";

import { useParams, useSearchParams } from "next/navigation";

import PracticeForm, { type SportKey } from "@/components/training/PracticeForm";

const ALLOWED: SportKey[] = ["archery", "boxing", "shooting", "taekwondo"];

export default function Page() {
	const params = useParams<{ sport: string }>();
	const search = useSearchParams();

	const sport = (params?.sport ?? "").toString().toLowerCase() as SportKey;
	if (!ALLOWED.includes(sport)) throw new Error("Sport không hợp lệ");

	const athleteId = Number(search.get("athlete") ?? "");

	const titles: Record<SportKey, string> = {
		archery: "Thêm buổi tập — Bắn cung",
		boxing: "Thêm buổi tập — Boxing",
		shooting: "Thêm buổi tập — Bắn súng",
		taekwondo: "Thêm buổi tập — Taekwondo",
	};

	return <PracticeForm sport={sport} mode="add" athleteId={athleteId} title={titles[sport]} />;
}
