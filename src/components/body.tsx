import { isServer } from "@tanstack/react-query";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

type Props = {
	children: React.ReactNode;
};

export const Body = async ({ children }: Props) => {
	let session = null;

	if (isServer) {
		session = await auth.api.getSession({
			headers: await headers(),
		});
	} else {
		session = await authClient.getSession();
	}

	return (
		<body
			className={cn(
				geistSans.variable,
				geistMono.variable,
				"flex min-h-svh flex-col antialiased",
				{
					"bg-sidebar": session,
				},
			)}
		>
			{children}
		</body>
	);
};
