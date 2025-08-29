"use client";

import { useParams } from "next/navigation";

import CompetitionForm from "@/components/competitions/CompetitionForm";

export default function Page() {
	const { id: idParam } = useParams<{ id: string }>();
	const id = Number(idParam ?? "");
	if (Number.isNaN(id)) throw new Error("ID không hợp lệ");

	return <CompetitionForm mode="update" id={id} title="Cập nhật giải đấu" />;
}
