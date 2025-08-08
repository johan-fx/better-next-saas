import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
	baseProcedure,
	createTRPCRouter,
	protectedProcedure,
} from "@/trpc/init";
import { plans } from "../plans";

export const billingRouter = createTRPCRouter({
	getPlans: baseProcedure.query(() => {
		return plans;
	}),
	getActiveSubscription: protectedProcedure.query(async ({ ctx }) => {
		try {
			const activeSubscriptions = await auth.api.listActiveSubscriptions({
				query: {
					referenceId: ctx.auth.session.activeOrganizationId ?? undefined,
				},
				headers: await headers(),
			});
			const activeSubscription =
				activeSubscriptions.find(
					(subscription) => subscription.status === "active",
				) ?? activeSubscriptions[0];

			return activeSubscription ?? null;
		} catch (err) {
			console.log(err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to get active subscription",
			});
		}
	}),
});
