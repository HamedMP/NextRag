import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { inngest } from "@/inngest/client";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function IngestTab() {
	const [text, setText] = useState("");
	const [loading, setLoading] = useState(false);

	const handleEmbed = async () => {
		if (!text) {
			toast.error("Please enter some text to embed");
			return;
		}

		setLoading(true);
		const toastId = toast.loading("Processing your text...");

		try {
			await inngest.send({
				name: "embed/text",
				data: {
					text,
					chunkingMethod: "paragraph",
				},
			});

			toast.success("Text successfully processed and stored!", { id: toastId });
			setText("");
		} catch (error) {
			console.error("Failed to process:", error);
			toast.error("Failed to process text. Please try again.", { id: toastId });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Add Knowledge</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<Textarea
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="Paste your text here to add to the knowledge base..."
					className="min-h-[200px]"
				/>
				<Button onClick={handleEmbed} disabled={loading} className="w-full">
					{loading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Processing...
						</>
					) : (
						"Add to Knowledge Base"
					)}
				</Button>
			</CardContent>
		</Card>
	);
}
