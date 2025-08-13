"use client";

import { useConsentManager } from "@c15t/nextjs";
import { Button } from "@/components/ui/button";

type Props = {
	label: string;
	className?: string;
	variant?: React.ComponentProps<typeof Button>["variant"];
};

export function OpenPrivacySettingsButton({
	label,
	className,
	variant = "outline",
}: Props) {
	const consentManager = useConsentManager();

	return (
		<Button
			variant={variant}
			className={className}
			onClick={() => consentManager.setIsPrivacyDialogOpen(true)}
		>
			{label}
		</Button>
	);
}
