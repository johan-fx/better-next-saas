"use client";

import type { Organization } from "better-auth/plugins";
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";
import { IsoLogo } from "@/components/isologo";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Link } from "@/modules/i18n/navigation";
import { NewOrganizationForm } from "../components/new-organization-form";

type Props = {
	organizations: Organization[];
};

export const WelcomeView = ({ organizations = [] }: Props) => {
	const t = useTranslations("authUI");
	const tCommon = useTranslations("common");
	const tWelcome = useTranslations("welcome");

	// Redirect if user already has organizations
	if (organizations.length > 0) {
		redirect("/account");
	}

	return (
		<div className="flex flex-col gap-6">
			<Card className="overflow-hidden p-0 rounded-lg border-none">
				<CardContent className="grid p-2 md:grid-cols-2">
					{/* Organization Creation Form */}
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
