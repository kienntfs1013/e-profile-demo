import * as React from "react";

import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default function Page({
	params,
	searchParams,
}: {
	params: { label: string };
	searchParams?: Record<string, string | string[] | undefined>;
}) {
	const sp = searchParams ?? {};
	const initial = {
		label: typeof sp.label === "string" ? sp.label : params.label,
		value: typeof sp.value === "string" ? sp.value : "",
		athlete: typeof sp.athlete === "string" ? sp.athlete : "",
	};
	return <ClientPage initial={initial} />;
}
