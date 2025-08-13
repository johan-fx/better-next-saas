"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CheckCircle, Loader, Loader2, X, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import * as z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { authClient } from "@/lib/auth-client";
import { BillingPeriod } from "@/modules/billing/plans";
import { useRouter } from "@/modules/i18n/navigation";

enum SlugStatus {
	AVAILABLE = "available",
	TAKEN = "taken",
}

export const NewOrganizationForm = () => {
	const t = useTranslations("authUI");
	const tForm = useTranslations("welcome.organization.form");

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isCheckingSlug, setIsCheckingSlug] = useState(false);
	const [slugStatus, setSlugStatus] = useState<SlugStatus | null>(null);

	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	// Organization creation schema with slug validation
	const organizationSchema = z.object({
		name: z
			.string()
			.min(1, tForm("validation.nameRequired"))
			.max(32, tForm("validation.nameMaxLength")),
		slug: z
			.string()
			.min(1, tForm("validation.slugRequired"))
			.max(48, tForm("validation.slugMaxLength"))
			.regex(/^[a-z0-9-]+$/, tForm("validation.slugFormat")),
	});

	// Initialize form with react-hook-form and zod validation
	const form = useForm<z.infer<typeof organizationSchema>>({
		resolver: zodResolver(organizationSchema),
		defaultValues: {
			name: "",
			slug: "",
		},
	});

	// Debounced slug availability check
	const checkSlugAvailability = useCallback(async (slug: string) => {
		if (!slug || slug.length < 1) {
			setSlugStatus(null);
			return;
		}

		setIsCheckingSlug(true);
		setSlugStatus(null);

		try {
			const { data, error } = await authClient.organization.checkSlug({
				slug: slug,
			});

			if (error) {
				// If no data is returned, the slug is taken
				setSlugStatus(SlugStatus.TAKEN);
			} else if (data) {
				// If data is returned, the slug is available
				setSlugStatus(SlugStatus.AVAILABLE);
			} else {
				setSlugStatus(null);
			}
		} catch (err) {
			console.error("Slug check failed:", err);
			setSlugStatus(null);
		} finally {
			setIsCheckingSlug(false);
		}
	}, []);

	// Watch slug value for debounced checking
	const watchedSlug = form.watch("slug");

	// Debounce slug checking
	useEffect(() => {
		if (!watchedSlug) {
			setSlugStatus(null);
			return;
		}

		const timeoutId = setTimeout(() => {
			checkSlugAvailability(watchedSlug);
		}, 500); // 500ms debounce

		return () => clearTimeout(timeoutId);
	}, [watchedSlug, checkSlugAvailability]);

	// Auto-generate slug when name changes
	const handleNameChange = (name: string) => {
		form.setValue("name", name);

		// Auto-generate slug from name
		if (name.trim()) {
			const autoSlug = slugify(name, {
				lower: true,
				strict: true,
				remove: /[*+~.()'"!:@]/g,
			});
			form.setValue("slug", autoSlug);
		} else {
			form.setValue("slug", "");
		}
	};

	// Handle form submission
	const onSubmit = async (data: z.infer<typeof organizationSchema>) => {
		setIsLoading(true);
		setError(null);

		try {
			// Final check for slug availability before creating organization
			const slugCheck = await authClient.organization.checkSlug({
				slug: data.slug,
			});

			if (slugCheck.error) {
				setError(tForm("errors.slugVerificationFailed"));
				setIsLoading(false);
				return;
			}

			if (!slugCheck.data) {
				// Slug is taken
				form.setError("slug", {
					type: "manual",
					message: tForm("errors.slugTaken"),
				});
				setSlugStatus(SlugStatus.TAKEN);
				setIsLoading(false);
				return;
			}

			// Create organization using Better Auth
			const organization = await authClient.organization.create({
				name: data.name,
				slug: data.slug,
				keepCurrentActiveOrganization: false,
				metadata: {
					isDefault: true,
				},
			});

			if (organization.data) {
				await authClient.organization.setActive({
					organizationId: organization.data.id,
				});

				// If user started from a paid plan, initiate Stripe upgrade now
				try {
					const raw = localStorage.getItem("postSignupUpgrade");
					if (raw) {
						const parsed = JSON.parse(raw) as {
							plan?: string;
							period?: string;
						};
						const selectedPlan = (parsed.plan || "").toLowerCase();
						const annual = parsed.period === BillingPeriod.YEARLY;
						if (selectedPlan && organization.data?.id) {
							const { data: upgradeData, error: upgradeError } =
								await authClient.subscription.upgrade({
									plan: selectedPlan,
									successUrl: "/account/billing",
									cancelUrl: "/account/billing",
									returnUrl: "/account/billing",
									referenceId: organization.data.id,
									annual,
								});

							// Clear the flag regardless of success to avoid repeated attempts
							localStorage.removeItem("postSignupUpgrade");

							if (upgradeError) {
								// Fallback to account page if upgrade failed
								startTransition(() => {
									router.replace("/account");
								});
								return;
							}
							if (upgradeData?.url) {
								window.location.href = upgradeData.url as string;
								return;
							}
						}
					}
				} catch {
					// Swallow and fallback to account
				}

				startTransition(() => {
					router.replace("/account");
				});
			} else if (organization.error) {
				// Handle specific errors
				const errorMessage = organization.error.message;
				setError(errorMessage ?? tForm("errors.createFailed"));
			}
		} catch (err) {
			console.error("Organization creation error:", err);
			setError(tForm("errors.unexpectedError"));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				{/* Organization Name Field */}
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel htmlFor="name">{t("ORGANIZATION_NAME")}</FormLabel>
							<FormControl>
								<Input
									{...field}
									id="name"
									placeholder={t("ORGANIZATION_NAME_PLACEHOLDER")}
									disabled={isLoading}
									onChange={(e) => handleNameChange(e.target.value)}
								/>
							</FormControl>
							<FormDescription>
								{t("ORGANIZATION_NAME_DESCRIPTION")}
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Organization Slug Field */}
				<FormField
					control={form.control}
					name="slug"
					render={({ field }) => (
						<FormItem>
							<FormLabel htmlFor="slug">{t("ORGANIZATION_SLUG")}</FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										{...field}
										id="slug"
										placeholder={t("ORGANIZATION_SLUG_PLACEHOLDER")}
										disabled={isLoading}
									/>
									{/* Status indicator */}
									{field.value && (
										<div className="absolute inset-y-0 right-0 flex items-center pr-3">
											{isCheckingSlug ? (
												<Loader className="size-4 animate-spin" />
											) : slugStatus === SlugStatus.AVAILABLE ? (
												<Check className="size-4 text-green-600" />
											) : slugStatus === SlugStatus.TAKEN ? (
												<X className="size-4 text-destructive" />
											) : null}
										</div>
									)}
								</div>
							</FormControl>
							<FormDescription>
								{t("ORGANIZATION_SLUG_DESCRIPTION")}
								{/* Slug status message */}
								{field.value && (
									<span className="mt-1 block">
										{isCheckingSlug && (
											<span className="text-sm text-blue-600">
												{tForm("status.checkingAvailability")}
											</span>
										)}
										{slugStatus === SlugStatus.AVAILABLE && (
											<span className="text-sm text-green-600 flex items-center gap-1">
												<CheckCircle className="size-4" />{" "}
												{tForm("status.slugAvailable")}
											</span>
										)}
										{slugStatus === SlugStatus.TAKEN && (
											<span className="text-sm text-red-600 flex items-center gap-1">
												<XCircle className="size-4" />{" "}
												{tForm("status.slugTaken")}
											</span>
										)}
									</span>
								)}
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Error Alert */}
				{error && (
					<Alert variant="destructive" className="mb-4">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Submit Button */}
				<Button
					type="submit"
					className="w-full mt-4"
					disabled={
						isLoading || isCheckingSlug || isPending || slugStatus === "taken"
					}
				>
					{isLoading || isPending ? (
						<Loader2 className="mr-2 size-4 animate-spin" />
					) : (
						t("CREATE_ORGANIZATION")
					)}
				</Button>
			</form>
		</Form>
	);
};
