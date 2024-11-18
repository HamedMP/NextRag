import { Navbar } from "@/components/navbar";

export default function DocsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<main className="">{children}</main>
		</div>
	);
}
