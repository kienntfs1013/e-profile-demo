import * as React from "react";
import { Suspense } from "react";

import { Layout } from "@/components/auth/layout";
import ResetPasswordForm from "@/components/auth/reset-password-form";

export const dynamic = "force-dynamic";

export default function Page(): React.JSX.Element {
	return (
		<Layout>
			<Suspense fallback={null}>
				<ResetPasswordForm />
			</Suspense>
		</Layout>
	);
}
