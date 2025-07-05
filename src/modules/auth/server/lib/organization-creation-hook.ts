import type { User } from "better-auth";
import type { Member, Organization } from "better-auth/plugins";
import { auth } from "@/lib/auth";
import { getPreferredLanguage } from "@/modules/i18n/utils";
import { createDefaultPreferences } from "@/modules/users/server/utils/user-preferences";

type OrganizationCreationHook = {
	organization: Organization;
	member: Member;
	user: User;
};

export async function organizationCreationHook(
	{ organization, member, user }: OrganizationCreationHook,
	request?: Request,
) {
	// Create default user preferences for the new organization
	try {
		// Extract preferred language from request context or use default
		const preferredLanguage = getPreferredLanguage(request);

		await createDefaultPreferences(user.id, {
			organizationId: organization.id,
			language: preferredLanguage,
		});

		console.log(
			`Created user preferences for ${user.email} in organization "${organization.name}"`,
		);
	} catch (error) {
		console.error("Failed to create user preferences:", error);
	}

	// Create default team for the organization
	try {
		// Check if this is a default organization (system-created)
		const isDefaultOrg = organization.metadata?.isDefault === true;

		if (isDefaultOrg) {
			// Create a default team for the organization
			const defaultTeamName = "Personal";

			// Use Better Auth's API to create the team
			const createTeamResponse = await auth.api.createTeam({
				body: {
					name: defaultTeamName,
					organizationId: organization.id,
				},
				headers: new Headers({
					"x-user-id": user.id,
				}),
			});

			if (createTeamResponse) {
				console.log(
					`Created default team "${defaultTeamName}" in organization "${organization.name}"`,
				);
			}
		}
	} catch (error) {
		console.error("Failed to create default team:", error);
		// Don't throw error to prevent breaking organization creation
	}

	// Add any custom logic after organization creation
	// For example, create default resources or send notifications
	console.log(
		`Organization "${organization.name}" created successfully with member ${member.id} for user ${user.email}`,
	);
}
