"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
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
	const { user, error, isLoading } = useUser();

	const [isChecking, setIsChecking] = React.useState<boolean>(true);
	const didRedirectRef = React.useRef(false);

	React.useEffect(() => {
		if (isLoading) return;

		if (error) {
			setIsChecking(false);
			return;
		}

		if (user) {
			if (didRedirectRef.current) return;
			const dest = paths.dashboard.customers;
			if (pathname !== dest) {
				didRedirectRef.current = true;
				logger.debug("[GuestGuard]: User is logged in, redirecting to dashboard");
				router.replace(dest);
				return;
			}
		}

		setIsChecking(false);
	}, [user, error, isLoading, pathname, router]);

	if (isChecking) return null;
	if (error) return <Alert color="error">{error}</Alert>;
	return <>{children}</>;
}
