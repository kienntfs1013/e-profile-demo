import * as React from "react";

import ClientPage from "./client-page";

export const dynamic = "force-dynamic";
export const dynamicParams = false;

export async function generateStaticParams() {
	return [{ id: "demo" }];
}

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
	const p = await params;
	const sp = searchParams ? await searchParams : undefined;

	const initial = {
		id: p.id,
		name: typeof sp?.name === "string" ? sp.name : "",
		image: typeof sp?.image === "string" ? sp.image : "",
		updatedAt: typeof sp?.updatedAt === "string" ? sp.updatedAt : "",
	};

	return <ClientPage initial={initial} />;
}
