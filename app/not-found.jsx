"use client";

import Link from "next/link";

export default function NotFoundPage() {
	return (
		<div className="error-page">
			<h1>404</h1>
			<p>Page not found</p>
			<Link 
				href="/" 
				className="mt-8 px-6 py-3 bg-primary/10 hover:bg-primary/20 text-white rounded-md transition-all duration-200 hover:scale-105 border border-primary/20"
			>
				Back to Home
			</Link>
		</div>
	);
}
