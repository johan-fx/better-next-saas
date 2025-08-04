import { cn } from "@/lib/utils";

interface LogoProps {
	width?: number | string;
	height?: number | string;
	className?: string;
	variant?: "solid" | "outline";
	color?: "primary" | "secondary" | "white" | "black";
	strokeWidth?: number;
}

const colorsMap = {
	primary: "primary",
	secondary: "secondary",
	white: "white",
	black: "black",
};

export const IsoLogo = ({
	width = 181,
	height = 178,
	className,
	variant = "solid",
	color = "primary",
	strokeWidth = 1,
}: LogoProps) => {
	// Determine color classes based on variant and color props
	const getColorClasses = () => {
		if (variant === "solid") {
			return {
				fill: `fill-current`,
				stroke: "stroke-none",
			};
		} else {
			return {
				fill: "fill-none",
				stroke: `stroke-current`,
			};
		}
	};

	const colorClasses = getColorClasses();
	const strokeClasses = variant === "outline" ? `stroke-${strokeWidth}` : "";

	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 181 178"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn(className, `text-${colorsMap[color]}`)}
		>
			<title>Logo</title>
			{/* Outer border/frame */}
			<path
				d="M159.5 39C159.5 29.335 151.665 21.5 142 21.5H39C29.335 21.5 21.5 29.335 21.5 39V139C21.5 148.665 29.335 156.5 39 156.5H142C151.665 156.5 159.5 148.665 159.5 139V39ZM180.5 139C180.5 160.263 163.263 177.5 142 177.5H39C17.737 177.5 0.5 160.263 0.5 139V39C0.5 17.737 17.737 0.5 39 0.5H142C163.263 0.5 180.5 17.737 180.5 39V139Z"
				className={cn(colorClasses.fill, colorClasses.stroke, strokeClasses)}
			/>
			{/* Main character/shape */}
			<path
				d="M65 108C65 114.904 70.5964 120.5 77.5 120.5H80V80H101V120.5H104.5C111.404 120.5 117 114.904 117 108V61H138V108C138 126.502 123.002 141.5 104.5 141.5H77.5C58.9985 141.5 44 126.502 44 108V61H65V108Z"
				className={cn(colorClasses.fill, colorClasses.stroke, strokeClasses)}
			/>
			{/* Circle element */}
			<circle
				cx="90"
				cy="51"
				r="12"
				className={cn(colorClasses.fill, colorClasses.stroke, strokeClasses)}
			/>
		</svg>
	);
};
