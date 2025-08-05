import { AuthCard } from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";
import type { Organization } from "better-auth/plugins";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignInView } from "@/modules/auth/ui/views/signin-view";
import { SignUpView } from "@/modules/auth/ui/views/signup-view";
import { WelcomeView } from "@/modules/auth/ui/views/welcome-view";

export function generateStaticParams() {
	return Object.values(authViewPaths).map((pathname) => ({ pathname }));
}

export default async function AuthPage({
	params,
}: {
	params: Promise<{ pathname: string }>;
}) {
	const { pathname } = await params;
	let organizations = null;

	// NOTE: This opts certain routes out of static rendering
	// It already handles client side protection via useAuthenticate
	if (["settings", "welcome"].includes(pathname)) {
		const sessionData = await auth.api.getSession({
			headers: await headers(),
		});

		if (!sessionData) {
			redirect(`/auth/sign-in?redirectTo=/auth/${pathname}`);
		}

		organizations = await auth.api.listOrganizations({
			headers: await headers(),
		});
	}

	if (pathname === "sign-in") {
		return <SignInView />;
	}

	if (pathname === "sign-up") {
		return <SignUpView />;
	}

	if (pathname === "welcome") {
		return <WelcomeView organizations={organizations as Organization[]} />;
	}

	return (
		<div className="container flex grow flex-col items-center justify-center gap-4 self-center p-4 md:p-6">
			<AuthCard
				classNames={{
					settings: {
						sidebar: {
							base: "sticky top-20",
						},
					},
				}}
				pathname={pathname}
			/>
		</div>
	);
}
