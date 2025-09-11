import * as React from "react";
import { Suspense } from "react";
import type { Metadata } from "next";

import { config } from "@/config";
import { GuestGuard } from "@/components/auth/guest-guard";
import { Layout } from "@/components/auth/layout";
import SignUpForm from "@/components/auth/sign-up-form";

export const metadata = { title: `Sign up | Auth | ${config.site.name}` } satisfies Metadata;
export const dynamic = "force-dynamic";

export default function Page(): React.JSX.Element {
	return (
		<Layout>
			<GuestGuard>
				<Suspense fallback={null}>
					<SignUpForm />
				</Suspense>
			</GuestGuard>
		</Layout>
	);
}
