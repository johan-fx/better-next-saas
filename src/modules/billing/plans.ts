export type Plan = {
	id: number;
	name: string;
	priceId: string;
	limits: {
		seats: number;
		monthlyCredits: number;
	};
	price?: {
		unitAmount: number;
		currency: string;
		interval: string;
	};
};

export const plans: Plan[] = [
	{
		id: 1,
		name: "Basic",
		priceId: "price_1RtByU5ZK2K6r0Nz39QwKDXG",
		limits: {
			seats: 1,
			monthlyCredits: 1000,
		},
	},
	{
		id: 2,
		name: "Plus",
		priceId: "price_1RtBzz5ZK2K6r0NzwEf9QG3c",
		limits: {
			seats: 3,
			monthlyCredits: 3000,
		},
	},
	{
		id: 3,
		name: "Pro",
		priceId: "price_1RtC0x5ZK2K6r0NzghmOE1fz",
		limits: {
			seats: 5,
			monthlyCredits: 10000,
		},
	},
];
