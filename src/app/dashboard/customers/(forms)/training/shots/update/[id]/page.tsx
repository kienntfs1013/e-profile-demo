import * as React from "react";

import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default function Page({
	params,
	searchParams,
}: {
	params: { id: string };
	searchParams?: Record<string, string | string[] | undefined>;
}) {
	const p = params;
	const sp = searchParams ?? {};

	const initial = {
		id: p.id,
		score: typeof sp.score === "string" ? sp.score : "",
		time: typeof sp.time === "string" ? sp.time : "",
		x: typeof sp.x === "string" ? sp.x : "",
		y: typeof sp.y === "string" ? sp.y : "",
		date: typeof sp.date === "string" ? sp.date : "",
		status: typeof sp.status === "string" ? sp.status : "pending",
	};

	return <ClientPage initial={initial} />;
}
