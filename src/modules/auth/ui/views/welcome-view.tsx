"use client";

import { AcceptInvitationCard } from "@daveyplate/better-auth-ui";
import type { Invitation, Organization } from "better-auth/plugins";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import { IsoLogo } from "@/components/isologo";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Link } from "@/modules/i18n/navigation";
import { NewOrganizationForm } from "../components/new-organization-form";

type Props = {
	organizations: Organization[];
};

export const WelcomeView = ({ organizations = [] }: Props) => {
	const t = useTranslations("authUI");
	const tCommon = useTranslations("common");
	const tWelcome = useTranslations("welcome");
	const [invitations, setInvitations] = useState<Invitation[] | null>(null);
	const [, setInvitationId] = useQueryState(
		"invitationId",
		parseAsString.withDefault(""),
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: we don't want to re-run this on every render
	const loadInvitations = useCallback(async () => {
		const result = await authClient.organization.listUserInvitations();
		if (result.data) {
			setInvitations(result.data);
			const [invitation] = result.data;
			// If invitation is found, append it to the current URL using NUQS library
			if (invitation) {
				setInvitationId(invitation.id);
			}
		}
	}, []);

	useEffect(() => {
		loadInvitations();
	}, [loadInvitations]);

	// Redirect if user already has organizations
	if (organizations.length > 0) {
		redirect("/account");
	}

	const isLoading = invitations === null;
	const hasInvitations = invitations && invitations.length > 0;

	return (
		<div className="flex flex-col gap-6">
			<Card className="overflow-hidden p-0 rounded-lg border-none">
				<CardContent className="grid p-2 md:grid-cols-2">
					{isLoading && (
						<div className="flex flex-col justify-center items-center h-70">
							<Loader2 className="w-4 h-4 animate-spin" />
						</div>
					)}
					{!isLoading && hasInvitations && (
						<div className="flex flex-col gap-4 md:px-4 md:py-6 md:pr-6">
							<AcceptInvitationCard
								classNames={{
									base: "border-none shadow-none max-w-md md:px-3 md:py-10 md:pr-5",
									header: "text-left justify-items-start",
									title: "!text-2xl font-semibold tracking-tight",
								}}
							/>
						</div>
					)}

					{!isLoading && !hasInvitations && (
						<div className="md:px-8 md:py-10 md:pr-10">
							<CardHeader className="px-0 pb-6">
								<CardTitle className="text-2xl font-semibold tracking-tight">
									{t("CREATE_ORGANIZATION")}
								</CardTitle>
								<CardDescription className="text-sm text-muted-foreground">
									{tWelcome("organization.description")}
								</CardDescription>
							</CardHeader>

							<NewOrganizationForm />
						</div>
					)}

					{/* Logo Section - matches SignInView styling */}
					<div className="bg-primary relative hidden md:flex flex-col gap-y-4 justify-center items-center rounded-sm">
						<IsoLogo width={150} height="100%" color="white" />
					</div>
				</CardContent>
			</Card>

			{/* Terms and Privacy Footer */}
			<div className="text-center text-sm text-muted-foreground text-balance space-x-1 *:[a]:hover:text-primary *:[a]:underline *:[a]:underline-offset-4">
				<span>{t("BY_CONTINUING_YOU_AGREE")}</span>
				<Link href={"/terms"}>{t("TERMS_OF_SERVICE")}</Link>
				<span> {tCommon("and")} </span>
				<Link href={"/privacy"}>{t("PRIVACY_POLICY")}</Link>
			</div>
		</div>
	);
};
