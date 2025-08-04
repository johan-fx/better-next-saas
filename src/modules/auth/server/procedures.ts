import { env } from "@/lib/env";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const authRouter = createTRPCRouter({
	socialProviders: baseProcedure.query(async () => {
		const providers = [];

		if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
			providers.push("github");
		}

		if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
			providers.push("google");
		}

		return providers;
	}),
});
