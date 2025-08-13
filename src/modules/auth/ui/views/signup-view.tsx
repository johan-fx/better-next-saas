"use client";

import { AuthCard } from "@daveyplate/better-auth-ui";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { IsoLogo } from "@/components/isologo";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/modules/i18n/navigation";

export const SignUpView = () => {
	const t = useTranslations("authUI");
	const tCommon = useTranslations("common");
	const searchParams = useSearchParams();

	// Persist selected plan/period from pricing CTAs to complete upgrade post-signup
	useEffect(() => {
		const plan = searchParams.get("plan");
		const period = searchParams.get("period");
		if (plan && period) {
			try {
				localStorage.setItem(
					"postSignupUpgrade",
					JSON.stringify({ plan, period }),
				);
			} catch {
				// noop
			}
		}
	}, [searchParams]);

	return (
		<div className="flex flex-col gap-6">
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<AuthCard
						pathname="sign-up"
						classNames={{
							base: "border-none shadow-none max-w-md md:px-3 md:py-10 md:pr-5",
						}}
					/>
					<div className="bg-primary relative hidden md:flex flex-col gap-y-4 justify-center items-center">
						<IsoLogo width={150} height="100%" color="white" />
					</div>
				</CardContent>
			</Card>

			<div className="text-center text-sm text-muted-foreground text-balance space-x-1 *:[a]:hover:text-primary *:[a]:underline *:[a]:underline-offset-4">
				<span>{t("BY_CONTINUING_YOU_AGREE")}</span>
				<Link href={"/terms"}>{t("TERMS_OF_SERVICE")}</Link>
				<span> {tCommon("and")} </span>
				<Link href={"/privacy"}>{t("PRIVACY_POLICY")}</Link>
			</div>
		</div>
	);
};
