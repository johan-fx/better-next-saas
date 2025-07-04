"use client";

import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Link } from "@/modules/i18n/navigation";

/**
 * VerifyEmailView Component
 *
 * Main view component for email verification page.
 * Displays after successful signup to inform users about
 * email verification requirement and provides link back to sign in.
 */
export function VerifyEmailView() {
	const t = useTranslations("Auth");

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<Card>
					<CardHeader className="space-y-1 text-center">
						<div className="flex justify-center mb-4">
							<Mail className="h-12 w-12 text-blue-600" />
						</div>
						<CardTitle className="text-2xl">{t("emailVerification")}</CardTitle>
						<CardDescription>{t("checkEmail")}</CardDescription>
					</CardHeader>
					<CardContent className="text-center space-y-4">
						<p className="text-sm text-gray-600">
							{t("verificationEmailSent")}
						</p>

						<div className="mt-6">
							<Link
								href="/auth/sign-in"
								className="font-medium text-blue-600 hover:text-blue-500"
							>
								{t("backToSignIn")}
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
