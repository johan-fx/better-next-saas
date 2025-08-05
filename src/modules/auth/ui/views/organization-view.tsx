"use client";

import { OrganizationSettingsCards } from "@daveyplate/better-auth-ui";
import { useTranslations } from "next-intl";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBetterAuthClassNames } from "@/hooks/use-better-auth-classnames";

export const OrganizationView = () => {
	const tNav = useTranslations("navigation");
	const classNames = useBetterAuthClassNames();

	return (
		<div className="w-full flex flex-col gap-y-8">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink>{tNav("organization")}</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{tNav("settings")}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<div className="w-full max-w-5xl mx-auto">
				<OrganizationSettingsCards classNames={classNames} />
			</div>
		</div>
	);
};
