import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, roles } from "@/modules/rbac/permissions";

export const authClient = createAuthClient({
	plugins: [
		organizationClient({
			// Configure with custom access control system
			ac,
			roles,
			teams: {
				enabled: true,
			},
		}),
	],
});
