"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import type { Plan } from "../../plans";

interface Props {
	buttonText: string;
	plan: Plan;
	disabled?: boolean;
	loading?: boolean;
}

export const UpgradeSubscriptionButton = ({
	buttonText,
	plan,
	disabled,
	loading,
}: Props) => {
	const { data: organization, isPending } = authClient.useActiveOrganization();

	const handleSubscribe = async () => {
		try {
			const { data, error } = await authClient.subscription.upgrade({
				plan: plan.name,
				successUrl: "/account/billing",
				cancelUrl: "/account/billing",
				referenceId: organization?.id,
			});
			if (error) {
				console.log(error);
			}
			if (data) {
				console.log(data);
			}
		} catch (err) {
			console.log(err);
		}
	};
	return (
		<Button
			onClick={handleSubscribe}
			className="w-full"
			disabled={isPending || disabled || loading || !organization?.id}
		>
			{isPending || loading ? (
				<Loader2 className="mr-2 size-4 animate-spin" />
			) : (
				buttonText
			)}
		</Button>
	);
};
