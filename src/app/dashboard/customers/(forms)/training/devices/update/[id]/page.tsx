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
		name: typeof sp.name === "string" ? sp.name : "",
		image: typeof sp.image === "string" ? sp.image : "",
		updatedAt: typeof sp.updatedAt === "string" ? sp.updatedAt : "",
	};

	return <ClientPage initial={initial} />;
}
