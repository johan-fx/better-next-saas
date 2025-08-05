import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { member, organization } from "@/lib/db/schema";

export async function getDefaultOrganization(userId: string) {
	const memberships = await db
		.select()
		.from(member)
		.where(eq(member.userId, userId));

	if (memberships.length) {
		const organizationIds = memberships.map((m) => m.organizationId);
		const organizations = await db
			.select()
			.from(organization)
			.where(inArray(organization.id, organizationIds));

		const defaultOrganization =
			organizations.find((org) => {
				const metadata = JSON.parse(org.metadata ?? "{}");
				return metadata.isDefault;
			}) ?? organizations[0];

		return defaultOrganization;
	}

	return null;
}
