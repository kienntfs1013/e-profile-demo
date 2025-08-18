import * as React from "react";

import ClientPage from "./client-page";

export const dynamic = "force-dynamic";
export const dynamicParams = false;

export async function generateStaticParams() {
	return [{ label: "sample" }];
}

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ label: string }>;
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
	const p = await params;
	const sp = searchParams ? await searchParams : undefined;

	const initial = {
		label: typeof sp?.label === "string" ? sp.label : decodeURIComponent(p.label),
		value: typeof sp?.value === "string" ? sp.value : "",
		athlete: typeof sp?.athlete === "string" ? sp.athlete : "",
	};

	return <ClientPage initial={initial} />;
}
