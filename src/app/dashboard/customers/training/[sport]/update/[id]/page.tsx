// src/app/dashboard/customers/training/[sport]/update/[id]/page.tsx
"use client";

import { useParams, useSearchParams } from "next/navigation";

import PracticeForm, { type SportKey } from "@/components/training/PracticeForm";

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
		archery: "Cập nhật buổi tập — Bắn cung",
		boxing: "Cập nhật buổi tập — Boxing",
		shooting: "Cập nhật buổi tập — Bắn súng",
		taekwondo: "Cập nhật buổi tập — Taekwondo",
	};

	return <PracticeForm sport={sport} mode="update" athleteId={athleteId} id={id} title={titles[sport]} />;
}
