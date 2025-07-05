import type { GenericEndpointContext, User } from "better-auth";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import slugify from "slugify";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { env } from "@/lib/env";
import { sendWelcomeEmail } from "@/modules/emails";
import { getPreferredLanguage } from "@/modules/i18n/utils";
import { createDefaultPreferences } from "@/modules/users/server/utils/user-preferences";

export async function userCreationHook(
	user: User,
	ctx?: GenericEndpointContext,
) {
	console.log("🔴 AFTER USER CREATION:", user);
	try {
		// Extract preferred language from request context or use default
		const preferredLanguage = getPreferredLanguage(ctx?.request);
		await sendWelcomeEmail({
			to: user.email,
			userName: user.name || "there",
			dashboardUrl: `${env.NEXT_PUBLIC_APP_URL}/${preferredLanguage}/dashboard`,
			locale: preferredLanguage,
		});

		// Check if user already has any organization memberships
		// If they do, it means they came from an invitation, so skip creating default org
		const existingMemberships = await db.query.member.findMany({
			where: (member, { eq }) => eq(member.userId, user.id),
		});

		if (existingMemberships.length > 0) {
			console.log(
				`User ${user.email} already has organization memberships, skipping default organization creation`,
			);
			return;
		}

		// Create default organization for the user
		const defaultOrgName = `org-${nanoid(8)}`;
		const defaultOrgSlug = slugify(defaultOrgName.toLowerCase());

		// Create organization using direct database operations to avoid authentication issues
		// This bypasses the API layer and works directly with the database
		const organizationId = nanoid();
		const currentTime = new Date();

		// Create the organization record directly using the database instance
		await db
			.insert(schema.organization)
			.values({
				id: organizationId,
				name: defaultOrgName,
				slug: defaultOrgSlug,
				metadata: JSON.stringify({
					isDefault: true,
					createdBy: "system",
				}),
				createdAt: currentTime,
			})
			.returning();

		// Create the organization member record (user as owner)
		const memberId = nanoid();
		await db
			.insert(schema.member)
			.values({
				id: memberId,
				organizationId: organizationId,
				userId: user.id,
				role: "owner",
				createdAt: currentTime,
			})
			.returning();

		console.log(
			`Created default organization "${defaultOrgName}" for user ${user.email}`,
		);

		// Manually trigger the organization creation hook logic
		// Create default user preferences
		try {
			const preferredLanguage = getPreferredLanguage(ctx?.request);
			await createDefaultPreferences(user.id, {
				organizationId: organizationId,
				language: preferredLanguage,
			});
			console.log(
				`Created user preferences for ${user.email} in organization "${defaultOrgName}"`,
			);
		} catch (error) {
			console.error("Failed to create user preferences:", error);
		}

		// Create default team for the organization
		try {
			const defaultTeamName = "Personal";
			const teamId = nanoid();

			await db
				.insert(schema.team)
				.values({
					id: teamId,
					name: defaultTeamName,
					organizationId: organizationId,
					createdAt: currentTime,
					updatedAt: currentTime,
				})
				.returning();

			// Update the member to be part of the default team
			// (team membership is handled via teamId in the member table)
			await db
				.update(schema.member)
				.set({ teamId: teamId })
				.where(eq(schema.member.id, memberId));

			console.log(
				`Created default team "${defaultTeamName}" in organization "${defaultOrgName}"`,
			);
		} catch (error) {
			console.error("Failed to create default team:", error);
		}
	} catch (error) {
		console.error("Failed to create default organization for user:", error);
		// Don't throw error to prevent breaking user registration
		// The user can manually create an organization later
	}
}
