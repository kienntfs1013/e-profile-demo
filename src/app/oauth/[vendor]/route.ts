import { NextRequest, NextResponse } from "next/server";

const config = {
	oura: {
		authUrl: "https://cloud.ouraring.com/oauth/authorize",
		clientId: process.env.OURA_CLIENT_ID!,
		redirectUri: process.env.OURA_REDIRECT_URI!,
		scope: "email personal daily heartrate",
	},
	fitbit: {
		authUrl: "https://www.fitbit.com/oauth2/authorize",
		clientId: process.env.FITBIT_CLIENT_ID!,
		redirectUri: process.env.FITBIT_REDIRECT_URI!,
		scope: "activity heartrate sleep",
	},
	garmin: {
		authUrl: "https://connect.garmin.com/oauthConfirm", // placeholder
		clientId: process.env.GARMIN_CLIENT_ID!,
		redirectUri: process.env.GARMIN_REDIRECT_URI!,
		scope: "read",
	},
	strava: {
		authUrl: "https://www.strava.com/oauth/authorize",
		clientId: process.env.STRAVA_CLIENT_ID!,
		redirectUri: process.env.STRAVA_REDIRECT_URI!,
		scope: "read,activity:read_all",
	},
};

export async function GET(req: NextRequest, { params }: { params: { vendor: string } }) {
	const vendor = params.vendor as keyof typeof config;
	const vendorConf = config[vendor];
	if (!vendorConf) return NextResponse.json({ error: "Unsupported vendor" }, { status: 400 });

	const returnUrl = req.nextUrl.searchParams.get("return") || "/";
	const authUrl = `${vendorConf.authUrl}?client_id=${vendorConf.clientId}&response_type=code&redirect_uri=${encodeURIComponent(
		vendorConf.redirectUri
	)}&scope=${encodeURIComponent(vendorConf.scope)}&state=${encodeURIComponent(returnUrl)}`;

	return NextResponse.redirect(authUrl);
}
