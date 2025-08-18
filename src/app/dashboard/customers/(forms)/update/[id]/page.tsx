import { users } from "@/models/user";

import ClientPage from "./client-page";

export async function generateStaticParams() {
	return users.map((u) => ({ id: u.id }));
}

export default function Page({ params }: { params: { id: string } }) {
	const { id } = params;
	return <ClientPage id={id} />;
}
