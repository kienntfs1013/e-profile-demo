export const paths = {
	home: "/",
	auth: {
		signIn: "/auth/sign-in",
		signUp: "/auth/sign-up",
		resetPassword: "/auth/reset-password",
	},
	dashboard: {
		overview: "/dashboard",
		general: "/dashboard/general",
		executive: "/dashboard/executive",
		profile: "/dashboard/profile",
		training: "/dashboard/training",
		health: "/dashboard/health",
		achievement: "/dashboard/achievement",
		account: "/dashboard/account",
		customers: "/dashboard/customers",
		integrations: "/dashboard/integrations",
		settings: "/dashboard/settings",
	},
	errors: {
		notFound: "/errors/not-found",
	},
} as const;
