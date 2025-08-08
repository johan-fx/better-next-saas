import { authRouter } from "@/modules/auth/server/procedures";
import { billingRouter } from "@/modules/billing/server/procedures";
import { baseProcedure, createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
	healthcheck: baseProcedure.query(() => "yay!"),
	auth: authRouter,
	billing: billingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
