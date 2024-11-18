"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const technologies = [
	{
		name: "Next.js",
		icon: "/tech/next.webp",
		url: "https://nextjs.org/",
	},
	{
		name: "PostgreSQL",
		icon: "/tech/postgres.png",
		url: "https://www.postgresql.org/",
	},
	{
		name: "Prisma",
		icon: "/tech/prisma.svg",
		url: "https://www.prisma.io/",
	},
];

export function TechIcons() {
	return (
		<div className="flex gap-6 items-center justify-center flex-wrap mt-8">
			{technologies.map((tech, i) => (
				<motion.a
					key={tech.name}
					href={tech.url}
					target="_blank"
					rel="noopener noreferrer"
					className="group relative"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: i * 0.1 }}
					whileHover={{ scale: 1.05 }}
				>
					<div className="absolute -inset-2 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
					<Image
						src={tech.icon}
						alt={tech.name}
						width={40}
						height={40}
						className="relative"
					/>
					<span className="sr-only">{tech.name}</span>
				</motion.a>
			))}
		</div>
	);
}
