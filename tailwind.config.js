/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				primary: "hsl(350, 100%, 88%)",
				success: "#44a25b",
				warning: "#b98037",
				critical: "#d83a42",
				base: {
					low: "hsl(0, 0%, 15%)",
					lower: "hsl(0, 0%, 10%)",
					lowest: "hsl(0, 0%, 5%)",
				},
				surface: {
					overlay: "hsl(0, 0%, 0%)",
					high: "hsl(350, 100%, 97%)",
					higher: "hsl(0, 0%, 100%)",
					highest: "hsl(350, 100%, 98%)",
				},
				border: {
					normal: "hsla(350, 100%, 88%, 0.2)",
					faint: "hsla(350, 100%, 88%, 0.1)",
					strong: "hsla(350, 100%, 88%, 0.4)",
				},
				icon: {
					default: "hsl(0, 0%, 100%)",
					tertiary: "hsl(350, 100%, 88%)",
				},
				text: {
					default: "hsl(0, 0%, 100%)",
					muted: "hsl(0, 0%, 80%)",
					link: "hsl(350, 100%, 88%)",
					primary: "hsl(0, 0%, 100%)",
					secondary: "hsl(0, 0%, 90%)",
					positive: "hsl(130.769, 37.143%, 58.824%)",
					warning: "hsl(33.143, 54.404%, 62.157%)",
					critical: "hsl(0, 100%, 93.725%)",
				},
				button: {
					primary: {
						background: "hsl(350, 100%, 88%)",
						hover: "hsl(350, 100%, 83%)",
						active: "hsl(350, 100%, 78%)",
						border: "hsla(0, 0%, 100%, 0.1)",
					},
					secondary: {
						background: "hsla(0, 0%, 100%, 0.1)",
						hover: "hsla(0, 0%, 100%, 0.2)",
						active: "hsla(0, 0%, 100%, 0.3)",
						border: "hsla(0, 0%, 100%, 0.05)",
					},
				},
			},
		},
		screens: {
			xs: "440px",
			sm: "540px",
			md: "900px",
		},
	},
	plugins: [],
};
