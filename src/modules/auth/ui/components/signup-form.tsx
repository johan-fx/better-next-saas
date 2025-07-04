"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

/**
 * Zod validation schema for signup form
 * Uses next-intl translations for error messages
 */
const createSignupSchema = (t: (key: string) => string) => {
	return z
		.object({
			name: z
				.string()
				.min(1, { message: t("nameRequired") })
				.trim(),
			email: z
				.string()
				.min(1, { message: t("emailRequired") })
				.email({ message: t("emailInvalid") })
				.trim(),
			password: z.string().min(8, { message: t("passwordTooShort") }),
			confirmPassword: z
				.string()
				.min(1, { message: t("confirmPasswordRequired") }),
			organizationName: z
				.string()
				.optional()
				.transform((val) => val?.trim() || undefined),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: t("passwordsDoNotMatch"),
			path: ["confirmPassword"], // Error appears on confirmPassword field
		});
};

type SignupFormData = z.infer<ReturnType<typeof createSignupSchema>>;

interface SignupFormProps {
	onSubmit: (data: {
		name: string;
		email: string;
		password: string;
		organizationName?: string;
	}) => Promise<void>;
	isLoading: boolean;
}

/**
 * SignupForm Component
 *
 * Form component for user registration with email and password.
 * Uses Zod for validation schema and React Hook Form for form handling.
 * Includes validation for:
 * - Required fields (name, email, password)
 * - Email format validation
 * - Password confirmation matching
 * - Optional organization name for Better Auth organizations
 */
export function SignupForm({ onSubmit, isLoading }: SignupFormProps) {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const t = useTranslations("Auth");

	// Create Zod schema with translations
	const signupSchema = createSignupSchema(t);

	// Initialize React Hook Form with Zod resolver
	const form = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
			organizationName: "",
		},
	});

	/**
	 * Handle form submission
	 * Called only after successful validation
	 */
	const onFormSubmit = async (data: SignupFormData) => {
		await onSubmit({
			name: data.name,
			email: data.email,
			password: data.password,
			organizationName: data.organizationName,
		});
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onFormSubmit)}
				className="space-y-6"
				noValidate // Disable HTML5 validation to let React Hook Form handle all validation
			>
				{/* Name Field */}
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("fullName")}</FormLabel>
							<FormControl>
								<Input
									type="text"
									placeholder={t("enterFullName")}
									disabled={isLoading}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Email Field */}
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("email")}</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder={t("enterEmail")}
									disabled={isLoading}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Password Field */}
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("password")}</FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										type={showPassword ? "text" : "password"}
										placeholder={t("enterPassword")}
										disabled={isLoading}
										className="pr-10"
										{...field}
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
										onClick={() => setShowPassword(!showPassword)}
										disabled={isLoading}
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Confirm Password Field */}
				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("confirmPassword")}</FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										type={showConfirmPassword ? "text" : "password"}
										placeholder={t("confirmYourPassword")}
										disabled={isLoading}
										className="pr-10"
										{...field}
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										disabled={isLoading}
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Organization Name Field (Optional) */}
				<FormField
					control={form.control}
					name="organizationName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								{t("organizationName")}{" "}
								<span className="text-muted-foreground">({t("optional")})</span>
							</FormLabel>
							<FormControl>
								<Input
									type="text"
									placeholder={t("enterOrganizationName")}
									disabled={isLoading}
									{...field}
								/>
							</FormControl>
							<FormDescription>{t("organizationNameHint")}</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Submit Button */}
				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							{t("creatingAccount")}
						</>
					) : (
						t("createAccount")
					)}
				</Button>
			</form>
		</Form>
	);
}
