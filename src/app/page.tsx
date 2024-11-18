import { Navbar } from "@/components/navbar";
import { TechIcons } from "@/components/tech-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DotPattern } from "@/components/ui/dot-pattern";
import { env } from "@/lib/env.mjs";
import { cn } from "@/lib/utils";
import { Braces, Database, GitBranch, Terminal } from "lucide-react";
import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
			<Navbar />
			<main className="flex-1 flex flex-col items-center justify-center gap-8 max-w-4xl mx-auto px-4 py-12">
				<div className="space-y-4 text-center">
					<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-mono">
						NextRAG
					</h1>
					<p className="text-muted-foreground max-w-[600px] mx-auto">
						Production-ready implementation of Retrieval Augmented Generation
						with vector search capabilities using PostgreSQL + pgvector in
						Next.js.
					</p>
				</div>

				<DotPattern className="absolute inset-0 opacity-80 -z-10 [mask-image:radial-gradient(500px_circle_at_center,white,transparent)]" />

				<div className="grid sm:grid-cols-2 gap-4 w-full max-w-3xl relative z-10">
					<Card className="p-6 border-2 hover:border-primary/50 transition-colors">
						<div className="flex flex-col gap-4 h-full">
							<Terminal className="h-10 w-10 text-primary" />
							<h2 className="font-semibold text-xl">Core Stack</h2>
							<ul className="space-y-2 text-muted-foreground">
								<li className="flex items-center gap-2">
									<Database className="h-4 w-4" /> PostgreSQL + pgvector
								</li>
								<li className="flex items-center gap-2">
									<GitBranch className="h-4 w-4" /> Inngest pipelines
								</li>
								<li className="flex items-center gap-2">
									<Braces className="h-4 w-4" /> Next.js 15
								</li>
							</ul>
							<div className="flex-1" />
							<Button variant="outline" className="w-full" asChild>
								<a href="/docs">View Documentation →</a>
							</Button>
						</div>
					</Card>

					<Card className="p-6 border-2 hover:border-primary/50 transition-colors">
						<div className="flex flex-col gap-4 h-full">
							<div className="font-mono text-sm">
								<div className="text-muted-foreground">
									&#47;&#47; Try it out
								</div>
								<code className="text-primary">RAG Playground</code>
							</div>
							<div className="flex-1" />
							<Button variant="default" className="w-full" asChild>
								<Link
									href={env.NODE_ENV === "production" ? "" : "/chat"}
									className={cn(
										env.NODE_ENV === "production" && "disabled:opacity-50",
									)}
									title="Only available in local environment"
								>
									Open Playground →
								</Link>
							</Button>
						</div>
					</Card>
				</div>

				<TechIcons />
			</main>

			<footer className="flex justify-center gap-6 py-6 border-t z-20">
				<Button variant="ghost" size="sm" asChild>
					<a
						href="https://github.com/HamedMP/NextRag"
						target="_blank"
						rel="noopener noreferrer"
					>
						GitHub
					</a>
				</Button>
			</footer>
		</div>
	);
}
