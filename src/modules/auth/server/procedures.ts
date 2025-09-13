import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import {
	baseProcedure,
	createTRPCRouter,
	protectedProcedure,
} from "@/trpc/init";

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
	verifyApiKey: baseProcedure.query(async () => {
		return auth.api.getSession({
			headers: await headers(),
		});
	}),
	organizations: protectedProcedure.query(async () => {
		const data = await auth.api.listOrganizations({
			headers: await headers(),
		});
		return data;
	}),
});
