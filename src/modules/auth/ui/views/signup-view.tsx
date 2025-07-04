"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Link } from "@/modules/i18n/navigation";
import { SignupForm } from "../components/signup-form";

/**
 * SignupView Component
 *
 * Main view component for user registration with email.
 * Handles the signup workflow including:
 * - Email/password validation
 * - Organization creation with default values
 * - Success/error handling
 * - Navigation after signup
 */
export function SignupView() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const t = useTranslations("Auth");

	/**
	 * Handle signup form submission
	 * Uses Better Auth client to create account with organization
	 */
	const handleSignup = async (data: {
		name: string;
		email: string;
		password: string;
		organizationName?: string;
	}) => {
		setIsLoading(true);

		try {
			// Sign up the user with Better Auth
			const result = await authClient.signUp.email({
				name: data.name,
				email: data.email,
				password: data.password,
				callbackURL: "/dashboard",
				// Better Auth will handle email verification automatically
			});

			if (result.error) {
				toast.error(result.error.message || t("signupFailed"));
				return;
			}

			// Create organization if name provided, otherwise use default
			if (data.organizationName) {
				try {
					await authClient.organization.create({
						name: data.organizationName,
						slug: data.organizationName.toLowerCase().replace(/\s+/g, "-"),
						// Set user as owner with default permissions
						metadata: {
							plan: "starter",
							createdBy: result.data?.user?.id,
						},
					});
				} catch (orgError) {
					// Don't fail signup if organization creation fails
					console.warn("Organization creation failed:", orgError);
				}
			}

			// Show success message
			toast.success(t("accountCreated"));

			// Redirect to dashboard or verification page
			if (result.data?.user?.emailVerified) {
				router.push("/dashboard");
			} else {
				router.push("/auth/verify-email");
			}
		} catch (error) {
			console.error("Signup error:", error);
			toast.error(t("signupFailed"));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<Card>
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl text-center">
							{t("createAccount")}
						</CardTitle>
						<CardDescription className="text-center">
							{t("createAccountDescription")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<SignupForm onSubmit={handleSignup} isLoading={isLoading} />

						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								{t("alreadyHaveAccount")}{" "}
								<Link
									href="/auth/sign-in"
									className="font-medium text-blue-600 hover:text-blue-500"
								>
									{t("signIn")}
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
