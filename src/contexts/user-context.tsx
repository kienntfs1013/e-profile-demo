"use client";

import * as React from "react";

import type { User } from "@/types/user";
import { authClient } from "@/lib/auth/client";
import { logger } from "@/lib/default-logger";

export interface UserContextValue {
	user: User | null;
	error: string | null;
	isLoading: boolean;
	checkSession?: () => Promise<void>;
	signOut: () => Promise<void>; // 👈 NEW
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
	children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
	const [state, setState] = React.useState<{ user: User | null; error: string | null; isLoading: boolean }>({
		user: null,
		error: null,
		isLoading: true,
	});

	const checkSession = React.useCallback(async (): Promise<void> => {
		try {
			const { data, error } = await authClient.getUser();

			if (error) {
				logger.error(error);
				setState((prev) => ({ ...prev, user: null, error: "Something went wrong", isLoading: false }));
				return;
			}

			setState((prev) => ({ ...prev, user: data ?? null, error: null, isLoading: false }));
		} catch (error) {
			logger.error(error);
			setState((prev) => ({ ...prev, user: null, error: "Something went wrong", isLoading: false }));
		}
	}, []);

	// 👇 NEW: thực thi đăng xuất chuẩn, xoá phiên và set user=null
	const signOut = React.useCallback(async (): Promise<void> => {
		try {
			if (typeof authClient.signOut === "function") {
				await authClient.signOut(); // đảm bảo xoá cookie/token phía server nếu có
			}
		} catch (error) {
			logger.error(error);
		} finally {
			setState({ user: null, error: null, isLoading: false });
		}
	}, []);

	React.useEffect(() => {
		checkSession().catch((error) => {
			logger.error(error);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <UserContext.Provider value={{ ...state, checkSession, signOut }}>{children}</UserContext.Provider>;
}

export const UserConsumer = UserContext.Consumer;
