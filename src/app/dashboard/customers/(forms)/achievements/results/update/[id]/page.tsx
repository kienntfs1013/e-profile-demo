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
	const sp = searchParams ?? {};
	const initial = {
		id: params.id,
		athlete: typeof sp.athlete === "string" ? sp.athlete : "",
		group: typeof sp.group === "string" ? sp.group : "",
		rank: typeof sp.rank === "string" ? sp.rank : "",
		city: typeof sp.city === "string" ? sp.city : "",
		event: typeof sp.event === "string" ? sp.event : "",
		detail: typeof sp.detail === "string" ? sp.detail : "",
		year: typeof sp.year === "string" ? sp.year : "",
	};
	return <ClientPage initial={initial} />;
}
