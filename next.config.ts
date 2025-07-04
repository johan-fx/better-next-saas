import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Specify the custom path to your request.ts file
const withNextIntl = createNextIntlPlugin("./src/modules/i18n/request.ts");

const nextConfig: NextConfig = {
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
	},
	devIndicators: {
		position: "bottom-right",
	},
};

export default withNextIntl(nextConfig);
