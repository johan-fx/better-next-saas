import { authRouter } from "@/modules/auth/server/procedures";
import { baseProcedure, createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
	healthcheck: baseProcedure.query(() => "yay!"),
	auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
