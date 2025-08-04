import { PublicHeader } from "@/components/public-header";

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="flex flex-col min-h-svh">
			<PublicHeader />
			<div className="bg-muted flex flex-col flex-1 items-center justify-center p-6 md:p-10">
				<div className="w-full max-w-sm md:max-w-4xl">{children}</div>
			</div>
		</div>
	);
};

export default Layout;
