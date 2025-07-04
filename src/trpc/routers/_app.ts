import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
	// Add your routers here
});

// export type definition of API
export type AppRouter = typeof appRouter;
