"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IngestTab } from "@/components/tabs/ingest-tab";
import { SearchTab } from "@/components/tabs/search-tab";
import { ChatTab } from "@/components/tabs/chat-tab";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";

export default function PlaygroundPage() {
	return (
		<div className="max-w-6xl mx-auto space-y-8 py-8 px-4">
			<div className="space-y-4">
				<h1 className="text-4xl font-bold tracking-tight">RAG Playground</h1>
				<p className="text-muted-foreground text-lg">
					Experiment with vector search and RAG capabilities in this interactive
					playground. Upload documents, test similarity search, and chat with
					your data.
				</p>
			</div>

			<Alert variant="default" className="bg-muted">
				<Lightbulb className="h-4 w-4" />
				<AlertTitle>Getting Started</AlertTitle>
				<AlertDescription>
					Start by ingesting some documents in the &quot;Ingest Data&quot; tab.
					Then try searching through your content or start a chat session based
					on your documents.
				</AlertDescription>
			</Alert>

			<Card className="p-1">
				<Tabs defaultValue="ingest" className="space-y-6">
					<TabsList className="grid w-full grid-cols-3 p-1">
						<TabsTrigger value="ingest" className="font-medium">
							Ingest Data
						</TabsTrigger>
						<TabsTrigger value="search" className="font-medium">
							Search
						</TabsTrigger>
						<TabsTrigger value="chat" className="font-medium">
							Chat
						</TabsTrigger>
					</TabsList>

					<div className="p-4 min-h-[600px]">
						<TabsContent value="ingest" className="m-0">
							<IngestTab />
						</TabsContent>

						<TabsContent value="search" className="m-0">
							<SearchTab />
						</TabsContent>

						<TabsContent value="chat" className="m-0">
							<ChatTab />
						</TabsContent>
					</div>
				</Tabs>
			</Card>

			<div className="text-sm text-muted-foreground">
				<p>
					Note: This is a demo environment. Data may be periodically cleared.
					For production use, please deploy your own instance.
				</p>
			</div>
		</div>
	);
}
