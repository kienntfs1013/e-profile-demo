"use client";

import { UserProvider } from "@/contexts/user-context";
import { LocalizationProvider } from "@/components/core/localization-provider";
import { ThemeProvider } from "@/components/core/theme-provider/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<LocalizationProvider>
			<UserProvider>
				<ThemeProvider>{children}</ThemeProvider>
			</UserProvider>
		</LocalizationProvider>
	);
}
