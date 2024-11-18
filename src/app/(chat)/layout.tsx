import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PlaygroundLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen">
			<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
				<div className="container mx-auto px-4 py-3 flex items-center justify-between">
					<nav className="flex gap-4">
						<Button variant="ghost" size="sm" asChild>
							<Link href="/">Home</Link>
						</Button>
						<Button variant="ghost" size="sm" asChild>
							<Link href="/docs">Docs</Link>
						</Button>
					</nav>
					<ThemeToggle />
				</div>
			</header>
			<main className="container mx-auto py-6">{children}</main>
		</div>
	);
}
