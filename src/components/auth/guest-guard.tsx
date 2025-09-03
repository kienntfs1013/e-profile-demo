"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Alert from "@mui/material/Alert";

import { paths } from "@/paths";
import { logger } from "@/lib/default-logger";
import { useUser } from "@/hooks/use-user";

export interface GuestGuardProps {
	children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps): React.JSX.Element | null {
	const router = useRouter();
	const pathname = usePathname();
	const search = useSearchParams();
	const { user, error, isLoading } = useUser();

	const [isChecking, setIsChecking] = React.useState(true);
	const didRedirectRef = React.useRef(false);

	React.useEffect(() => {
		if (isLoading) return;
		if (error) {
			setIsChecking(false);
			return;
		}
		if (user) {
			if (didRedirectRef.current) return;
			didRedirectRef.current = true;
			const next = search.get("next");
			const dest = next && next.startsWith("/") ? next : paths.dashboard.account;
			logger.debug("[GuestGuard]: Logged in, redirecting to", dest);
			router.replace(dest);
			return;
		}
		setIsChecking(false);
	}, [user, error, isLoading, pathname, search, router]);

	if (isChecking) return null;
	if (error) return <Alert color="error">{error}</Alert>;
	return <>{children}</>;
}
