import { Icons } from "./icons.jsx";

const ChangelogModal = ({ visible, onClose }) => {
	if (!visible) return null;

	const changelogData = [
		{
			version: "v1.2.0",
			date: "August 27, 2025",
			changes: [
				{
					type: "🔧 Bug Fixes & Improvements",
					items: [
						"Fixed TypeError issues with undefined items in pagination",
						"Improved data structure handling for nested decoration categories",
						"Enhanced search functionality with better filtering",
						"Fixed banner display issues for decoration collections",
						"Optimized mobile responsiveness and UI layout",
						"Added proper error handling for data access",
						"Fixed collection filtering and category display issues"
					]
				},
				{
					type: "🎨 UI/UX Enhancements",
					items: [
						"Reorganized decoration selection layout with improved tabs",
						"Added Shop/Other category filtering system",
						"Implemented design-consistent search bar",
						"Enhanced changelog modal with modern scrollbar styling",
						"Improved notification system and user feedback",
						"Added changelog notification banner with modal access"
					]
				},
				{
					type: "📊 Activity Monitoring",
					items: [
						"Implemented webhook notifications for user activity tracking",
						"Added activity monitoring for Discord profile fetches",
						"Integrated activity monitoring for image generation events",
						"Enhanced application usage tracking and monitoring",
						"Activity logs include username and collection usage for operational purposes",
						"Webhook notifications help monitor application usage and performance"
					]
				}
			]
		},
		{
			version: "v1.1.0",
			date: "April 6, 2025",
			changes: [
				{
					type: "🔗 Discord Integration",
					items: [
						"Added Discord user profile fetching via Discord ID",
						"Implemented account creation date display",
						"Added preview messages with decorations",
						"Enabled automatic username synchronization",
						"Created API route for Discord user data retrieval"
					]
				},
				{
					type: "⚡ Performance",
					items: [
						"Optimized API response times",
						"Improved data caching mechanisms",
						"Enhanced error handling for Discord API calls"
					]
				}
			]
		},
		{
			version: "v1.0.0",
			date: "April 5, 2025",
			changes: [
				{
					type: "🚀 Major Release",
					items: [
						"Complete project redesign and enhancement",
						"Modernized UI with Discord-inspired design",
						"Improved avatar customization workflow",
						"Enhanced decoration selection system"
					]
				},
				{
					type: "🎨 Design Overhaul",
					items: [
						"Implemented dark theme optimized for comfort",
						"Added smooth animations and transitions",
						"Created fully responsive interface",
						"Enhanced interactive preview messages"
					]
				},
				{
					type: "✨ New Features",
					items: [
						"Real-time decoration preview system",
						"Multiple format export support (GIF/PNG)",
						"High-quality image download with transparency",
						"Curated selection of pre-designed avatars"
					]
				}
			]
		}
	];

	return (
		<>
			<style jsx>{`
				.changelog-scrollbar::-webkit-scrollbar { width: 8px; }
				.changelog-scrollbar::-webkit-scrollbar-track { background: #1E1F22; border-radius: 4px; }
				.changelog-scrollbar::-webkit-scrollbar-thumb { background: #4F545C; border-radius: 4px; transition: background 0.2s ease; }
				.changelog-scrollbar::-webkit-scrollbar-thumb:hover { background: #5D6269; }
				.changelog-scrollbar::-webkit-scrollbar-thumb:active { background: #6D7178; }
				.changelog-scrollbar { scrollbar-width: thin; scrollbar-color: #4F545C #1E1F22; }
			`}</style>
			<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
				<div className="bg-[#2B2D31] rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
					{/* Header */}
					<div className="flex items-center justify-between p-6 border-b border-[#1E1F22]">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									<path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									<path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</div>
							<div>
								<h2 className="text-xl font-bold text-white">Changelog</h2>
								<p className="text-sm text-[#949BA4]">Latest updates and improvements</p>
							</div>
						</div>
						<button onClick={onClose} className="text-[#949BA4] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#1E1F22]">
							<Icons.x className="w-5 h-5" />
						</button>
					</div>

					{/* Content */}
					<div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)] changelog-scrollbar">
						<div className="space-y-8">
							{changelogData.map((version, index) => (
								<div key={index} className="border-l-4 border-red-500 pl-6">
									<div className="flex items-center gap-3 mb-4">
										<span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">{version.version}</span>
										<span className="text-[#949BA4] text-sm">{version.date}</span>
									</div>
									<div className="space-y-4">
										{version.changes.map((change, changeIndex) => (
											<div key={changeIndex}>
												<h4 className="text-white font-semibold mb-2 flex items-center gap-2">
													{change.type === "🚀 Major Release" && "🚀"}
													{change.type === "✨ New Features" && "✨"}
													{change.type === "🔧 Bug Fixes & Improvements" && "🔧"}
													{change.type === "🎨 UI/UX Enhancements" && "🎨"}
													{change.type === "🔗 Discord Integration" && "🔗"}
													{change.type === "⚡ Performance" && "⚡"}
													{change.type}
												</h4>
												<ul className="space-y-1 ml-6">
													{change.items.map((item, itemIndex) => (
														<li key={itemIndex} className="text-[#b5bac1] text-sm flex items-start gap-2">
															<span className="text-[#949BA4] mt-1">•</span>
															<span>{item}</span>
														</li>
													))}
												</ul>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Footer */}
					<div className="p-6 border-t border-[#1E1F22] bg-[#1E1F22]">
						<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
							<p className="text-[#b5bac1] text-sm text-center sm:text-left">
								Stay updated with the latest features and improvements!
							</p>
							<button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95">
								Close
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default ChangelogModal;
