import { test, expect } from "../../fixtures/test-extend";
import {
	createTestInbox,
	clearAllEmails,
	deleteTestInbox,
	validateMailDevConfig,
	waitForMailDevReady,
	type EmailTestInbox,
} from "../utils/maildev";
import { logoutFlow, signupFlow } from "../../flows/auth-flows";
import { OrgPage } from "../../page-objects/OrgPage";
import { acceptInvitationFlow } from "../../flows/org-flows";

/**
 * Organization Member Invitation Flow (E2E)
 *
 * Steps:
 * 1) Sign up a new root/owner user and complete organization creation
 * 2) Navigate to /account/organization/members and open "Invite Member"
 * 3) Fill invited member email and click "Send Invitation"; expect Sonner toast "Invitation sent"
 * 4) Use reusable flow to accept invitation: follow accept link, complete invited signup if needed, assert toast
 */

test.setTimeout(180_000);

test.describe("Organization Member Invitation", () => {
	let ownerInbox: EmailTestInbox;
	let invitedInbox: EmailTestInbox;

	test.beforeAll(async () => {
		validateMailDevConfig();
		await waitForMailDevReady();
	});

	test.beforeEach(async () => {
		await clearAllEmails();
		ownerInbox = await createTestInbox();
		invitedInbox = await createTestInbox();
	});

	test.afterEach(async () => {
		if (ownerInbox) await deleteTestInbox(ownerInbox.id);
		if (invitedInbox) await deleteTestInbox(invitedInbox.id);
	});

	test("should invite a member and accept the invitation", async ({ page }) => {
		// First step: sign up the owner user and create org
		await signupFlow(page, ownerInbox);

		const org = new OrgPage(page);
		await org.gotoMembers();
		await org.inviteMember(invitedInbox.emailAddress);

		// Sign out
		await logoutFlow(page);

		// Second step: follow acceptance link, complete invited signup if needed, accept invitation and assert
		await acceptInvitationFlow(page, invitedInbox);
	});
});


