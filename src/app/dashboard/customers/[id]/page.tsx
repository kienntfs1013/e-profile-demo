import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default function Page({ params }: { params: { id: string } }) {
  return <ClientPage id={params.id} />;
}
