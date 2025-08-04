"use client";

import { AuthCard } from "@daveyplate/better-auth-ui";
import { useTranslations } from "next-intl";
import { IsoLogo } from "@/components/isologo";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/modules/i18n/navigation";

export const SignInView = () => {
	const t = useTranslations("auth");

	return (
		<div className="flex flex-col gap-6">
			<Card className="overflow-hidden p-0 rounded-lg border-none">
				<CardContent className="grid p-2 md:grid-cols-2">
					<AuthCard
						pathname="sign-in"
						classNames={{
							base: "border-none shadow-none max-w-md md:px-3 md:py-10 md:pr-5",
						}}
					/>

					<div className="bg-primary relative hidden md:flex flex-col gap-y-4 justify-center items-center rounded-sm">
						<IsoLogo width={150} height="auto" color="white" />
					</div>
				</CardContent>
			</Card>

			<div className="text-center text-sm text-muted-foreground text-balance space-x-1 *:[a]:hover:text-primary *:[a]:underline *:[a]:underline-offset-4">
				<span>{t("termsText")}</span>
				<Link href={"/terms"}>{t("termsOfService")}</Link>
				<span>{t("and")}</span>
				<Link href={"/privacy"}>{t("privacyPolicy")}</Link>
			</div>
		</div>
	);
};
