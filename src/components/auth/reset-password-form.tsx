"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordForm(): React.JSX.Element {
	const sp = useSearchParams();
	const email = sp.get("email") || "";
	const token = sp.get("token") || "";

	return (
		<div>
			<div>Email: {email}</div>
			<div>Token: {token ? token.slice(0, 6) + "…" : ""}</div>
		</div>
	);
}
