"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";

import { paths } from "@/paths";
import { logger } from "@/lib/default-logger";
import { useUser } from "@/hooks/use-user";

export interface AuthGuardProps {
	children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): React.JSX.Element | null {
	const router = useRouter();
	const pathname = usePathname();
	const { user, error, isLoading } = useUser();
	const [isChecking, setIsChecking] = React.useState(true);
	const didRedirectRef = React.useRef(false);

	React.useEffect(() => {
		if (isLoading) return;
		if (error) {
			setIsChecking(false);
			return;
		}
		if (!user) {
			if (didRedirectRef.current) return;
			didRedirectRef.current = true;
			const next = encodeURIComponent(pathname || "/");
			logger.debug("[AuthGuard]: Not logged in. Redirect to sign-in with next=", next);
			router.replace(`${paths.auth.signIn}?next=${next}`);
			return;
		}
		setIsChecking(false);
	}, [user, error, isLoading, pathname, router]);

	if (isChecking) return null;
	if (error) return <Alert color="error">{error}</Alert>;
	return <>{children}</>;
}
