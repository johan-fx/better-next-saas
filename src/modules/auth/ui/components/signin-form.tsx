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
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

/**
 * Zod validation schema for signin form
 * Uses next-intl translations for error messages
 */
const createSigninSchema = (t: (key: string) => string) => {
	return z.object({
		email: z
			.string()
			.min(1, { message: t("emailRequired") })
			.email({ message: t("emailInvalid") })
			.trim(),
		password: z.string().min(1, { message: t("passwordRequired") }),
	});
};

type SigninFormData = z.infer<ReturnType<typeof createSigninSchema>>;

interface SigninFormProps {
	onSubmit: (data: { email: string; password: string }) => Promise<void>;
	isLoading: boolean;
}

/**
 * SigninForm Component
 *
 * Form component for user authentication with email and password.
 * Uses Zod for validation schema and React Hook Form for form handling.
 * Includes validation for:
 * - Required email field with proper email format
 * - Required password field
 * - Simple and clean UI following existing patterns
 */
export function SigninForm({ onSubmit, isLoading }: SigninFormProps) {
	const [showPassword, setShowPassword] = useState(false);

	const t = useTranslations("auth");

	// Create Zod schema with translations
	const signinSchema = createSigninSchema(t);

	// Initialize React Hook Form with Zod resolver
	const form = useForm<SigninFormData>({
		resolver: zodResolver(signinSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	/**
	 * Handle form submission
	 * Called only after successful validation
	 */
	const onFormSubmit = async (data: SigninFormData) => {
		await onSubmit({
			email: data.email,
			password: data.password,
		});
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onFormSubmit)}
				className="space-y-6"
				noValidate // Disable HTML5 validation to let React Hook Form handle all validation
			>
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

				{/* Submit Button */}
				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							{t("signingIn")}
						</>
					) : (
						t("signIn")
					)}
				</Button>
			</form>
		</Form>
	);
}
