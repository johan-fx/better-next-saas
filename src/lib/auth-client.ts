import {
	inferAdditionalFields,
	organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, roles } from "@/modules/rbac/permissions";
import type { auth } from "./auth";

export const authClient = createAuthClient({
	plugins: [
		inferAdditionalFields<typeof auth>(),
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
