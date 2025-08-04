import { AuthCard } from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignInView } from "@/modules/auth/ui/views/signin-view";
import { SignUpView } from "@/modules/auth/ui/views/signup-view";

export function generateStaticParams() {
	return Object.values(authViewPaths).map((pathname) => ({ pathname }));
}

export default async function AuthPage({
	params,
}: {
	params: Promise<{ pathname: string }>;
}) {
	const { pathname } = await params;

	// **EXAMPLE** SSR route protection for /auth/settings
	// NOTE: This opts /auth/settings out of static rendering
	// It already handles client side protection via useAuthenticate
	if (pathname === "settings") {
		const sessionData = await auth.api.getSession({
			headers: await headers(),
		});

		if (!sessionData) redirect("/auth/sign-in?redirectTo=/auth/settings");
	}

	if (pathname === "sign-in") {
		return <SignInView />;
	}

	if (pathname === "sign-up") {
		return <SignUpView />;
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
