"use client";

import * as React from "react";

import type { User } from "@/types/user";
import { authClient, type ApiUser } from "@/lib/auth/client";
import { logger } from "@/lib/default-logger";

export interface UserContextValue {
	user: User | null;
	apiUser: ApiUser | null;
	apiUserId: number | null;
	error: string | null;
	isLoading: boolean;
	checkSession?: () => Promise<void>;
	signOut: () => Promise<void>;
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
	children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
	const [state, setState] = React.useState<{
		user: User | null;
		apiUser: ApiUser | null;
		apiUserId: number | null;
		error: string | null;
		isLoading: boolean;
	}>({
		user: null,
		apiUser: null,
		apiUserId: null,
		error: null,
		isLoading: true,
	});

	const pullApiUserFromStorage = React.useCallback(() => {
		const apiUser = authClient.getApiUser();
		return { apiUser, apiUserId: apiUser?.user_id ?? apiUser?.id ?? null };
	}, []);

	const checkSession = React.useCallback(async (): Promise<void> => {
		try {
			const { data, error } = await authClient.getUser();
			if (error) {
				logger.error(error);
				setState((prev) => ({
					...prev,
					user: null,
					apiUser: null,
					apiUserId: null,
					error: "Something went wrong",
					isLoading: false,
				}));
				return;
			}
			const { apiUser, apiUserId } = pullApiUserFromStorage();
			setState((prev) => ({
				...prev,
				user: data ?? null,
				apiUser,
				apiUserId,
				error: null,
				isLoading: false,
			}));
		} catch (error) {
			logger.error(error);
			setState((prev) => ({
				...prev,
				user: null,
				apiUser: null,
				apiUserId: null,
				error: "Something went wrong",
				isLoading: false,
			}));
		}
	}, [pullApiUserFromStorage]);

	const signOut = React.useCallback(async (): Promise<void> => {
		try {
			await authClient.signOut();
		} catch (error) {
			logger.error(error);
		} finally {
			setState({ user: null, apiUser: null, apiUserId: null, error: null, isLoading: false });
		}
	}, []);

	React.useEffect(() => {
		checkSession().catch((error) => {
			logger.error(error);
		});
	}, []);

	return (
		<UserContext.Provider
			value={{
				user: state.user,
				apiUser: state.apiUser,
				apiUserId: state.apiUserId,
				error: state.error,
				isLoading: state.isLoading,
				checkSession,
				signOut,
			}}
		>
			{children}
		</UserContext.Provider>
	);
}

export const UserConsumer = UserContext.Consumer;
