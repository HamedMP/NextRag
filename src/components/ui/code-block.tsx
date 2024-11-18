import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "./button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CodeBlockProps {
	children: string;
	language?: string;
	showLineNumbers?: boolean;
}

export function CodeBlock({
	children,
	language = "typescript",
	showLineNumbers = true,
}: CodeBlockProps) {
	const [copied, setCopied] = useState(false);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(children);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="relative group">
			<Button
				size="icon"
				variant="ghost"
				className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
				onClick={copyToClipboard}
			>
				{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
			</Button>
			<SyntaxHighlighter
				language={language}
				style={vscDarkPlus}
				showLineNumbers={showLineNumbers}
				customStyle={{
					margin: 0,
					borderRadius: "0.5rem",
					padding: "1rem",
				}}
			>
				{children.trim()}
			</SyntaxHighlighter>
		</div>
	);
}
