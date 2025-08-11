import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/modules/i18n/navigation";
import { LanguageSwitcher } from "@/modules/i18n/ui/components/language-switcher";
import ThemeSwitcher from "./theme-switcher";

const links = [
	{
		group: "Product",
		items: [
			{
				title: "Features",
				href: "#",
			},
			{
				title: "Solution",
				href: "#",
			},
			{
				title: "Pricing",
				href: "/pricing",
			},
		],
	},
	{
		group: "Company",
		items: [
			{
				title: "About",
				href: "#",
			},
			{
				title: "Blog",
				href: "#",
			},
			{
				title: "Contact",
				href: "#",
			},
		],
	},
	{
		group: "Legal",
		items: [
			{
				title: "Privacy",
				href: "/legal/privacy",
			},
			{
				title: "Cookies",
				href: "/legal/cookies",
			},
		],
	},
];

export default function FooterSection() {
	return (
		<footer className="border-b bg-white pt-10 dark:bg-transparent">
			<div className="mb-8 border-b md:mb-12">
				<div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-6 px-6 pb-6">
					<Link href="/" aria-label="go home" className="block size-fit">
						<Logo />
					</Link>
				</div>
			</div>
			<div className="mx-auto max-w-5xl px-6">
				<div className="grid gap-12 md:grid-cols-5 md:gap-0 lg:grid-cols-4">
					<div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:col-span-5 md:row-start-1 lg:col-span-3">
						{links.map((link) => (
							<div key={link.group} className="space-y-4 text-sm">
								<span className="block font-medium">{link.group}</span>
								{link.items.map((item) => (
									<Link
										key={item.title}
										href={item.href}
										className="text-muted-foreground hover:text-primary block duration-150"
									>
										<span>{item.title}</span>
									</Link>
								))}
							</div>
						))}
					</div>
					<form className="row-start-1 border-b pb-8 text-sm md:col-span-2 md:border-none lg:col-span-1">
						<div className="space-y-4">
							<Label htmlFor="mail" className="block font-medium">
								Newsletter
							</Label>
							<div className="flex gap-2">
								<Input
									type="email"
									id="mail"
									name="mail"
									placeholder="Your email"
									className="h-8 text-sm"
								/>
								<Button size="sm">Submit</Button>
							</div>
							<span className="text-muted-foreground block text-sm">
								Don't miss any update!
							</span>
						</div>
					</form>
				</div>
				<div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t py-6">
					<small className="text-muted-foreground order-last block text-center text-sm md:order-first">
						© {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME}, All
						rights reserved
					</small>
					<div className="flex items-center space-x-2">
						<LanguageSwitcher />
						<ThemeSwitcher />
					</div>
				</div>
			</div>
		</footer>
	);
}
