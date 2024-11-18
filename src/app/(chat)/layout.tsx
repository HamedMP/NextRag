import { Navbar } from "@/components/navbar";

export default function PlaygroundLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<main className="flex-1 container py-8 px-4">{children}</main>
		</div>
	);
}
