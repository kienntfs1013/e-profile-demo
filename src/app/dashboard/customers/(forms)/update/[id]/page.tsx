import * as React from "react";

import ClientPage from "./client-page";


export const dynamicParams = false;

export async function generateStaticParams() {
	return [{ id: "demo" }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return <ClientPage id={id} />;
}
