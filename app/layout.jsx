import "./globals.css";

import "./components/modal.css";
import "./components/twemoji.css";

import { FontPreloader } from "./components/fontpreload.jsx";
import { Utils } from "./components/utils";

export const metadata = {
	title: "Discord Custom Avatars",
	description: "Create customized profile pictures with avatar decorations for Discord, available at no cost.",
	openGraph: {
		title: "Discord Custom Avatars",
		description: "Create customized profile pictures with avatar decorations for Discord, available at no cost.",
		url: "https://discord-fake-avatar-decorations.vercel.app/",
		siteName: "Discord Custom Avatars",
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Discord Custom Avatars",
		description: "Create customized profile pictures with avatar decorations for Discord, available at no cost.",
	},
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<head>
				{/* Meta tags */}
				<title>Discord Custom Avatars</title>
				<meta
					name="description"
					content="Get Discord avatar decorations for free!"
				/>

				{/* Open Graph embeds */}
				<meta property="og:type" content="website" />
				<meta property="og:title" content="Discord Custom Avatars" />
				<meta
					property="og:description"
					content="Get Discord avatar decorations for free!"
				/>
				<meta
					property="og:image"
					content="https://discord-decorations.vercel.app/android-chrome-192x192.png"
				/>

				{/* Twitter embeds */}
				<meta name="twitter:card" content="summary" />
				<meta name="twitter:title" content="Discord Custom Avatars" />
				<meta
					name="twitter:description"
					content="Get Discord avatar decorations for free!"
				/>
				<meta
					property="twitter:image"
					content="https://discord-decorations.vercel.app/android-chrome-192x192.png"
				/>

				{/* Favicon */}
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon-16x16.png"
				/>
				<link rel="manifest" href="/site.webmanifest" />

				{/* Fonts */}
				<link
					rel="stylesheet"
					href="https://itspi3141.github.io/discord-fonts/font.css"
				/>
			</head>
			<body className="bg-base-lower overflow-x-hidden">
				<FontPreloader />
				{children}
				<Utils />
			</body>
		</html>
	);
}
