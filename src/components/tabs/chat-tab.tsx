import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "ai/react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";

export function ChatTab() {
	const isProduction = process.env.NODE_ENV === "production";
	const { messages, input, handleInputChange, handleSubmit, data } = useChat({
		api: "/api/chat",
	});

	const handleChatSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isProduction) {
			toast.error("Chat is disabled in production. Please run locally.");
			return;
		}
		if (!input.trim()) {
			toast.error("Please enter a question");
			return;
		}

		handleSubmit(e);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Chat</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-full pr-4 mb-4">
					<div className="space-y-4">
						{messages.map((m) => (
							<div
								key={m.id}
								className={`flex flex-col ${
									m.role === "user" ? "items-end" : "items-start"
								}`}
							>
								<div
									className={`max-w-[80%] rounded-lg px-4 py-2 ${
										m.role === "user"
											? "bg-primary text-primary-foreground"
											: "bg-muted"
									}`}
								>
									{m.role === "user" ? (
										m.content
									) : (
										<>
											{/* Show context details if available */}
											{data?.length > 0 &&
												data[data.length - 1].contextDetails?.length > 0 && (
													<div className="mb-4 p-2 border border-dashed rounded-md border-gray-500 text-sm opacity-75">
														<div className="font-semibold mb-1">
															Context Used:
														</div>
														{data[data.length - 1].contextDetails.map(
															(context, i) => (
																<div key={i} className="mb-2">
																	<div className="font-medium">
																		{context.chunk}
																	</div>
																	<div className="text-xs text-gray-400">
																		Distance: {context.metadata.distance} |
																		Created: {context.metadata.createdAt} |
																		Method: {context.metadata.chunkingMethod} |
																		Chunk: {context.metadata.chunkIndex + 1}/
																		{context.metadata.totalChunks}
																	</div>
																</div>
															),
														)}
													</div>
												)}
											<ReactMarkdown
												components={{
													code({ className, children, ...props }) {
														const match = /language-(\w+)/.exec(
															className || "",
														);
														return match ? (
															<SyntaxHighlighter
																style={vscDarkPlus}
																language={match[1]}
																PreTag="div"
																{...(props as SyntaxHighlighterProps)}
															>
																{String(children).replace(/\n$/, "")}
															</SyntaxHighlighter>
														) : (
															<code className={className} {...props}>
																{children}
															</code>
														);
													},
												}}
												className="prose prose-invert max-w-none"
											>
												{m.content}
											</ReactMarkdown>
										</>
									)}
								</div>
							</div>
						))}
					</div>
				</ScrollArea>

				<form onSubmit={handleChatSubmit} className="flex gap-2">
					<input
						value={input}
						onChange={handleInputChange}
						placeholder={
							isProduction
								? "Chat disabled in production"
								: "Ask a question about the knowledge base..."
						}
						className="flex-1 p-2 border rounded-md"
						disabled={isProduction}
					/>
					<Button type="submit" disabled={isProduction}>
						Send
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
