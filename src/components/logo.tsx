import { IsoLogo } from "./isologo";

export const Logo = () => {
	return (
		<div className="flex items-center gap-x-2">
			<IsoLogo width="100%" height={24} color="primary" />
			<p className="text-xl font-medium whitespace-nowrap">MYAPP</p>
		</div>
	);
};
