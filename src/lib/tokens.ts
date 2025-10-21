type Vendor = "oura" | "fitbit" | "strava" | "garmin";

const inMemory: Record<string, any> = {};

export async function saveTokenForUser(userId: string, vendor: Vendor, token: any) {
	inMemory[`${userId}:${vendor}`] = { ...token, savedAt: Date.now() };
	// TODO: replace bằng DB thực của bạn
	console.log("[TOKENS] saved", userId, vendor);
}

export async function getTokenForUser(userId: string, vendor: Vendor) {
	return inMemory[`${userId}:${vendor}`] || null;
}
