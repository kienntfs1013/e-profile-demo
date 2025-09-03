import ClientPage from "./client-page";

export default function Page({ params }: { params: { id: string } }) {
	return <ClientPage id={params.id} />;
}
