"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
	{ href: "/", label: "Home" },
	{ href: "/docs", label: "Documentation" },
	{ href: "/chat", label: "Playground" },
];

export function Navbar() {
	const pathname = usePathname();

	return (
		<header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
			<div className="max-w-[1200px] mx-auto flex h-16 items-center justify-between px-4">
				<Link href="/" className="flex items-center space-x-2">
					<span className="font-mono font-bold text-lg">NextRAG</span>
				</Link>
				<div className="flex items-center gap-6">
					<nav className="flex items-center gap-4">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className={`text-sm transition-colors hover:text-foreground/80 ${
									pathname === item.href
										? "text-foreground font-medium"
										: "text-muted-foreground"
								}`}
							>
								{item.label}
							</Link>
						))}
					</nav>
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
