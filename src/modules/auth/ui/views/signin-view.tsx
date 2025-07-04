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
import { SigninForm } from "../components/signin-form";

/**
 * SigninView Component
 *
 * Main view component for user authentication with email and password.
 * Handles the signin workflow including:
 * - Email/password validation
 * - Authentication with Better Auth
 * - Success/error handling and user feedback
 * - Navigation after successful signin
 * - Email verification requirement handling
 */
export function SigninView() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const t = useTranslations("Auth");

	/**
	 * Handle signin form submission
	 * Uses Better Auth client to authenticate user
	 */
	const handleSignin = async (data: { email: string; password: string }) => {
		setIsLoading(true);

		try {
			// Attempt to sign in the user with Better Auth
			const result = await authClient.signIn.email({
				email: data.email,
				password: data.password,
				// Remember the user session by default
				rememberMe: true,
				// Redirect to dashboard after successful signin
				callbackURL: "/dashboard",
			});

			if (result.error) {
				// Handle specific error cases
				if (result.error.status === 403) {
					// Email verification required
					toast.error(t("emailNotVerified"));
					// Redirect to email verification page
					router.push("/auth/verify-email");
					return;
				}

				// Handle invalid credentials or other auth errors
				if (result.error.message?.includes("Invalid")) {
					toast.error(t("invalidCredentials"));
				} else {
					toast.error(result.error.message || t("signinFailed"));
				}
				return;
			}

			// Success: show welcome message and redirect
			toast.success(t("welcomeBack"));

			// Navigate to dashboard if successful
			// Better Auth will handle the session automatically
			router.push("/dashboard");
		} catch (error) {
			console.error("Signin error:", error);
			toast.error(t("signinFailed"));
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
							{t("signInToAccount")}
						</CardTitle>
						<CardDescription className="text-center">
							{t("signInDescription")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<SigninForm onSubmit={handleSignin} isLoading={isLoading} />

						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								{t("dontHaveAccount")}{" "}
								<Link
									href="/auth/sign-up"
									className="font-medium text-blue-600 hover:text-blue-500"
								>
									{t("signUp")}
								</Link>
							</p>
						</div>

						{/* TODO: Add "Forgot Password?" link when implemented */}
						{/* <div className="mt-4 text-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {t("forgotPassword")}
              </Link>
            </div> */}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
