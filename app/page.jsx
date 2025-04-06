"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import FileUpload from "./components/fileupload.jsx";
import { Icons } from "./components/icons.jsx";
import Image from "./components/image.jsx";
import Modal from "./components/modal.jsx";
import { LoadingCircle, LoadingCubes } from "./components/spinner";
import Twemoji from "./components/twemoji.jsx";

import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { addDecoration, cropToSquare } from "@/ffmpeg/processImage.js";
import { getMimeTypeFromArrayBuffer } from "@/ffmpeg/utils.js";

import { printMsg, printErr } from "./print.js";
import { storeData } from "./utils/dataHandler.js";

import { decorationsData } from "./data/decorations.js";
import { avatarsData } from "./data/avatars.js";
import {
	initializeImageMagick,
	LogEventTypes,
	Magick,
} from "@imagemagick/magick-wasm";

import CollapsibleSection from "./components/CollapsibleSection.jsx";

const baseImgUrl = process.env.NEXT_PUBLIC_BASE_IMAGE_URL || "";

export default function Home() {
	const isServer = typeof window === "undefined";

	const [loaded, setLoaded] = useState(false);
	const ffmpegRef = useRef(isServer ? null : new FFmpeg());

	const load = useCallback(async () => {
		if (isServer) return;
		const ffmpegBaseUrl = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/";
		const ffmpeg = ffmpegRef.current;

		const imageMagickUrl =
			"https://unpkg.com/@imagemagick/magick-wasm@0.0.34/dist/magick.wasm";

		const promises = [
			new Promise((r) => {
				(async () => {
					await ffmpeg.load({
						coreURL: await toBlobURL(
							`${ffmpegBaseUrl}ffmpeg-core.js`,
							"text/javascript",
						),
						wasmURL: await toBlobURL(
							`${ffmpegBaseUrl}ffmpeg-core.wasm`,
							"application/wasm",
						),
					});
					ffmpeg.on("log", (e) =>
						printMsg(
							["ffmpeg", e.message],
							[
								{
									color: "white",
									background: "#5765f2",
									padding: "2px 8px",
									borderRadius: "10px",
								},
							],
						),
					);
					r();
				})();
			}),
			new Promise((r) => {
				(async () => {
					await initializeImageMagick(
						new URL(
							"https://unpkg.com/@imagemagick/magick-wasm@0.0.34/dist/magick.wasm",
						),
					);
					Magick.onLog = (e) =>
						printMsg(
							["imagemagick", e.message.split("]:").slice(1).join("]:")],
							[
								{
									color: "black",
									background: "#e0e3ff",
									padding: "2px 8px",
									borderRadius: "10px",
								},
							],
						);
					Magick.setLogEvents(LogEventTypes.Detailed);
					r();
				})();
			}),
		];
		await Promise.all(promises);
		setLoaded(true);
	});

	const [t, setT] = useState(false);
	useEffect(() => {
		if (t) return;
		setT(true);
		load();
	}, [load, t]);

	return (
		<>
			{loaded ? (
				<App ffmpegRef={ffmpegRef} isServer={isServer} />
			) : (
				<LoadingScreen />
			)}
		</>
	);
}

const LoadingScreen = () => (
	<main className="flex flex-col justify-center items-center p-8 w-full h-screen text-white">
		<p className="top-8 absolute mx-8 max-w-xl font-bold text-4xl text-center ginto">
			Discord
			<br />
			<span className="capitalize ginto">Custom Avatars: Stand Out</span>
		</p>
		<LoadingCircle className="mb-4 w-10 h-10" />
		<p>Loading...</p>
	</main>
);

const App = ({ ffmpegRef, isServer }) => {
	const previewAvatar = useCallback(async (url) => {
		if (isServer) return;
		setAvUrl("loading");
		const res = await cropToSquare(ffmpegRef.current, url).catch((reason) =>
			printErr(reason),
		);
		if (!res) return setAvUrl(null);
		setAvUrl(res);
	});

	const createAvatar = useCallback(async (url, deco) => {
		if (isServer) return;
		addDecoration(
			ffmpegRef.current,
			url,
			deco === "" ? "" : `${baseImgUrl}${deco}`,
		)
			.then((res) => {
				if (!res) {
					setFinishedAv(null);
					setGenerationFailed(true);
					return;
				}
				setFinishedAv(res);
				setIsGeneratingAv(false);
			})
			.catch((reason) => {
				setGenerationFailed(true);
				setIsGeneratingAv(false);
				printErr(reason);
			});
	});

	const [finishedAv, setFinishedAv] = useState("");
	const [isGeneratingAv, setIsGeneratingAv] = useState(false);
	const [generationFailed, setGenerationFailed] = useState(false);
	const [downloadModalVisible, setDownloadModalVisible] = useState(false);
	const [shared, setShared] = useState(false);
	const [fileTooBig, setFileTooBig] = useState(false);

	const router = useRouter();

	const getBannerImage = useCallback(() => {
		switch (new Date().getMonth() + 1) {
			case 2:
				return `url(${baseImgUrl}/banners/hearts.png) right top / contain no-repeat, linear-gradient(78.98deg, hsl(350, 100%, 88%), hsl(350, 100%, 97%))`;
			case 12:
				return `url(${baseImgUrl}/wallpaper/winter.jpg) center / cover no-repeat`;
			default:
				return "linear-gradient(78.98deg, hsl(350, 100%, 88%), hsl(350, 100%, 97%))";
		}
	});

	const [selectedCategory, setSelectedCategory] = useState(0);
	const [currentPage, setCurrentPage] = useState(0);
	const [avatarPage, setAvatarPage] = useState(0);

	const itemsPerPage = 5;
	const getCurrentPageItems = (items) => {
		const start = currentPage * itemsPerPage;
		const end = start + itemsPerPage;
		return items.slice(start, end);
	};

	const getCurrentAvatarPageItems = (items) => {
		const start = avatarPage * itemsPerPage;
		const end = start + itemsPerPage;
		return items.slice(start, end);
	};

	const getPageCount = (items) => {
		return Math.ceil(items.length / itemsPerPage);
	};

	const [avUrl, setAvUrl] = useState(null);
	const [decoUrl, setDecoUrl] = useState("");
	const [name, setName] = useState("");
	const [avatarName, setAvatarName] = useState("");
	const [description, setDescription] = useState("");
	const [inputMethod, setInputMethod] = useState("upload");
	const [bannerUrl, setBannerUrl] = useState(null);
	const [accentColor, setAccentColor] = useState(null);
	const [themeColor, setThemeColor] = useState(null);
	const [badges, setBadges] = useState([]);
	const [displayName, setDisplayName] = useState("Zane");
	const [username, setUsername] = useState("zaannee");
	const [notification, setNotification] = useState({ show: false, type: '', message: '' });
	const [accountCreationDate, setAccountCreationDate] = useState("Nov 2016");

	const showNotification = (type, message) => {
		setNotification({ show: true, type, message });
		setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
	};

	return (
		<>
			{notification.show && (
				<div 
					className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-300 transform ${
						notification.type === 'success' 
							? 'bg-green-500/95 border border-green-400/30' 
							: 'bg-red-500/95 border border-red-400/30'
					} backdrop-blur-sm text-white z-50 flex items-center gap-3 min-w-[280px] max-w-[90vw] sm:max-w-md animate-notification`}
					style={{
						animation: notification.show 
							? 'slideIn 0.3s ease-out forwards' 
							: 'slideOut 0.3s ease-in forwards'
					}}
				>
					<div className="shrink-0">
						{notification.type === 'success' ? (
							<Icons.checkCircle className="w-6 h-6" />
						) : (
							<Icons.xCircle className="w-6 h-6" />
						)}
					</div>
					<p className="text-sm font-medium leading-5">
						{notification.message}
					</p>
				</div>
			)}
			<style jsx>{`
				@keyframes slideIn {
					from {
						transform: translateX(100%);
						opacity: 0;
					}
					to {
						transform: translateX(0);
						opacity: 1;
					}
				}
				
				@keyframes slideOut {
					from {
						transform: translateX(0);
						opacity: 1;
					}
					to {
						transform: translateX(100%);
						opacity: 0;
					}
				}
			`}</style>
			<main className="flex flex-col items-center w-screen h-screen overflow-auto text-white discord-scrollbar">
				<div className="w-full max-w-[900px] px-8 py-12">
					<div className="bg-[#2B2D31] rounded-lg p-6 mb-8 shadow-lg">
						<div className="flex flex-col items-center text-center">
							<h1 className="font-bold text-2xl md:text-3xl ginto mb-2">Discord</h1>
							<h2 className="text-xl md:text-2xl ginto mb-3">Custom Avatars: Stand Out</h2>
							<p className="text-sm md:text-base text-[#949BA4] max-w-2xl">
								Create customized profile pictures with avatar decorations for Discord, available at no cost.
							</p>
						</div>
					</div>

					<div className="flex md:flex-row flex-col items-center md:items-start gap-8">
						{/* SETTINGS */}
						<div id="settings" className="block select-none grow">
							{/* UPLOAD AVATAR */}
							<CollapsibleSection title="ADD YOUR AVATAR">
								<div className="flex flex-col gap-4">
									<div className="flex gap-2">
										<button
											type="button"
											className={`px-4 py-1.5 rounded-md text-sm transition-all ${
												inputMethod === "upload"
												? "bg-[#7C41FF] text-white hover:bg-[#9B6AFF]"
												: "bg-[#2B2D31] text-[#949BA4] hover:bg-[#2B2D31]/80"
											}`}
											onClick={() => setInputMethod("upload")}
										>
											Upload Image
										</button>
										<button
											type="button"
											className={`px-4 py-1.5 rounded-md text-sm transition-all ${
												inputMethod === "discord"
												? "bg-[#7C41FF] text-white hover:bg-[#9B6AFF]"
												: "bg-[#2B2D31] text-[#949BA4] hover:bg-[#2B2D31]/80"
											}`}
											onClick={() => setInputMethod("discord")}
										>
											Discord Username
										</button>
									</div>

									{inputMethod === "upload" ? (
										<div className="flex sm:flex-row flex-col sm:items-center gap-3">
											<button
												type="button"
												className="px-4 py-1.5 button-primary"
												onClick={() => {
													document.getElementById("upload-avatar").click();
												}}
											>
												<input
													type="file"
													id="upload-avatar"
													className="hidden"
													accept="image/png, image/jpeg, image/gif, image/webp"
													onChange={(e) => {
														const [file] = e.target.files;
														if (file) {
															const reader = new FileReader();
															reader.readAsDataURL(file);
															reader.onload = () => {
																previewAvatar(reader.result);
															};
														}
													}}
												/>
												Upload image
											</button>
											<p className="sm:text-left text-center">or</p>
											<input
												type="text"
												className="bg-base-low px-2.5 py-2 border border-border-faint rounded-lg outline-none transition grow"
												placeholder="Enter image URL..."
												onChange={async (e) => {
													setAvatarName("");
													const res = await fetch(e.target.value);
													if (res.status < 200 || res.status >= 400)
														return setAvUrl(null);
													const blob = await res.blob();
													if (
														![
															"image/png",
															"image/jpeg",
															"image/gif",
															"image/webp",
														].includes(blob.type)
													)
														return setAvUrl(null);
													const reader = new FileReader();
													reader.readAsDataURL(blob);
													reader.onload = () => {
														previewAvatar(reader.result);
													};
												}}
											/>
										</div>
									) : (
										<div className="flex gap-2">
											<div className="relative flex-1">
												<input
													type="text"
													className={`w-full bg-base-low px-2.5 py-2 border border-border-faint rounded-lg outline-none transition ${
														avUrl ? "bg-opacity-50 text-gray-400" : ""
													}`}
													placeholder="Enter Discord user ID..."
													disabled={avUrl !== null && avUrl !== "loading"}
													onChange={(e) => {
														if (e.target.value === "") {
															setAvUrl(null);
															setName("");
															setAvatarName("");
														}
													}}
													id="discord-user-id"
												/>
												{avUrl && avUrl !== "loading" && (
													<button
														type="button"
														className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
														onClick={() => {
															setAvUrl(null);
															setDisplayName("Zane");
															setUsername("zaannee");
															setAvatarName("");
															setBannerUrl(null);
															setAccentColor(null);
															setThemeColor(null);
															setBadges([]);
															setDescription("Preview of your profile picture on Discord");
															setAccountCreationDate("Nov 2016");
															document.getElementById("discord-user-id").value = "";
															document.getElementById("discord-user-id").disabled = false;
														}}
													>
														<Icons.x className="w-4 h-4" />
													</button>
												)}
											</div>
											<button
												type="button"
												className={`px-4 py-2 rounded-md text-sm transition-all ${
													avUrl === "loading"
													? "bg-[#2B2D31] text-gray-400 cursor-not-allowed"
													: "bg-[#7C41FF] text-white hover:bg-[#9B6AFF]"
												}`}
												disabled={avUrl === "loading"}
												onClick={async () => {
													const userId = document.getElementById("discord-user-id").value;
													if (!userId) return;
													
													try {
														const response = await fetch(`/api/discord-user?userId=${encodeURIComponent(userId)}`);
														if (!response.ok) throw new Error('User not found');
														
														const userData = await response.json();
														setAvUrl(userData.avatarUrl);
														setDisplayName(userData.global_name || userData.username);
														setUsername(userData.username);
														setAvatarName("");
														setDescription("Preview of your profile picture on Discord");
														setBannerUrl(userData.bannerUrl);
														setAccentColor(userData.accentColor);
														setThemeColor(userData.themeColor);

														// Calculate account creation date from snowflake ID
														const timestamp = Number(BigInt(userId) >> 22n) + 1420070400000;
														const creationDate = new Date(timestamp);
														const formattedDate = creationDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
														setAccountCreationDate(formattedDate);

														showNotification('success', 'Successfully fetched user data!');

														if (userData.staticAvatarUrl) {
															setDescription(prev => prev + "\n(Click on the avatar to toggle between GIF and PNG)");
															const avatar = document.getElementById('avatar');
															if (avatar) {
																avatar.style.cursor = 'pointer';
																avatar.onclick = () => {
																	setAvUrl(prev => 
																		prev === userData.avatarUrl 
																			? userData.staticAvatarUrl 
																			: userData.avatarUrl
																	);
																};
															}
														}

														if (userData.staticBannerUrl) {
															const banner = document.getElementById('user-banner');
															if (banner) {
																banner.style.cursor = 'pointer';
																banner.onclick = () => {
																	setBannerUrl(prev => 
																		prev === userData.bannerUrl 
																			? userData.staticBannerUrl 
																			: userData.bannerUrl
																	);
																};
															}
														}
													} catch (error) {
														console.error('Error fetching Discord user:', error);
														setAvUrl(null);
														setBannerUrl(null);
														setAccentColor(null);
														showNotification('error', 'Failed to find Discord user. Please check the ID and try again.');
													}
												}}
											>
												{avUrl === "loading" ? (
													<LoadingCircle className="w-4 h-4" />
												) : (
													"Fetch Data"
												)}
											</button>
										</div>
									)}

									{inputMethod === "discord" && (
										<p className="text-xs text-[#b5bac1] mt-1">
											💡 To get a user ID: Discord Settings → Advanced → Developer Mode → Right-click on a user → Copy ID
										</p>
									)}

									<p className="mt-3 mb-2 text-sm">
										You can also choose from the selection of avatars provided below
									</p>

									<div className="gap-2 grid grid-cols-5">
										{getCurrentAvatarPageItems(avatarsData).map((avatar, index) => {
											return (
												<div
													key={index}
													className="flex flex-col items-center text-center"
												>
													<button
														key={index}
														type="button"
														data-tooltip-id={avatar.n
															.toLowerCase()
															.replaceAll(" ", "-")}
														data-tooltip-content={avatar.n}
														className="avatar-preset button-tile"
														onClick={(e) => {
															setAvatarName(avatar.n.toLowerCase());
															setAvUrl(`${baseImgUrl}/avatars/${avatar.f}`);
															for (const el of document.querySelectorAll(
																"button.avatar-preset.border-primary",
															)) {
																el.classList.remove("border-primary");
															}
															e.target.classList.add("border-primary");
														}}
													>
														<Image
															src={`/avatars/${avatar.f}`}
															className="rounded-full pointer-events-none"
															loading="lazy"
														/>
													</button>
													<Tooltip
														id={avatar.n.toLowerCase().replaceAll(" ", "-")}
														opacity={1}
														style={{
															background: "#111214",
															borderRadius: "8px",
															padding: "6px 12px 4px 12px",
															boxShadow:
																"0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.2)",
														}}
													/>
												</div>
											);
										})}
									</div>
									{getPageCount(avatarsData) > 1 && (
										<div className="flex items-center justify-center gap-1">
											<button
												type="button"
												className="px-2 py-1 button-secondary text-sm disabled:opacity-50"
												onClick={() => setAvatarPage(prev => Math.max(0, prev - 1))}
												disabled={avatarPage === 0}
											>
												←
											</button>
											<span className="text-sm text-gray-300">
												{avatarPage + 1}/{getPageCount(avatarsData)}
											</span>
											<button
												type="button"
												className="px-2 py-1 button-secondary text-sm disabled:opacity-50"
												onClick={() => setAvatarPage(prev => Math.min(getPageCount(avatarsData) - 1, prev + 1))}
												disabled={avatarPage === getPageCount(avatarsData) - 1}
											>
												→
											</button>
										</div>
									)}
								</div>
							</CollapsibleSection>

							<hr className="border-b border-border-faint/10 my-4" />

							{/* SELECT DECORATION */}
							<CollapsibleSection title="AVATAR DECORATION">
								<div className="flex flex-col gap-6">
									<div className="flex items-center justify-between">
										<select 
											className="bg-[#2B2D31] px-4 py-2 border border-[#1E1F22] rounded-lg text-sm outline-none transition hover:border-[#b5bac1] focus:border-[#7C41FF]"
											onChange={(e) => {
												setSelectedCategory(parseInt(e.target.value));
												setCurrentPage(0);
											}}
											value={selectedCategory}
										>
											{decorationsData.map((category, index) => (
												<option key={index} value={index}>
													{category.n}
												</option>
											))}
										</select>
										{getPageCount(decorationsData[selectedCategory].i) > 1 && (
											<div className="flex items-center gap-2">
												<button
													type="button"
													className="px-3 py-2 bg-[#2B2D31] hover:bg-[#2B2D31]/80 text-[#b5bac1] rounded-lg text-sm disabled:opacity-50 transition-all"
													onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
													disabled={currentPage === 0}
												>
													←
												</button>
												<span className="text-sm text-[#b5bac1] min-w-[60px] text-center">
													{currentPage + 1}/{getPageCount(decorationsData[selectedCategory].i)}
												</span>
												<button
													type="button"
													className="px-3 py-2 bg-[#2B2D31] hover:bg-[#2B2D31]/80 text-[#b5bac1] rounded-lg text-sm disabled:opacity-50 transition-all"
													onClick={() => setCurrentPage(prev => Math.min(getPageCount(decorationsData[selectedCategory].i) - 1, prev + 1))}
													disabled={currentPage === getPageCount(decorationsData[selectedCategory].i) - 1}
												>
													→
												</button>
											</div>
										)}
									</div>

									<div className="relative justify-center items-center grid grid-cols-1 grid-rows-1 bg-[#1E1F22] rounded-xl h-28 overflow-hidden shadow-lg">
										{typeof decorationsData[selectedCategory].b.i !== "string" ? (
													<>
														<div
															className="top-0 right-0 bottom-0 left-0 absolute"
															style={{
														background: decorationsData[selectedCategory].b.bg || "#000",
															}}
														/>
												{decorationsData[selectedCategory].b.i.map((e, i) => (
															<Image
																key={i}
																className={"object-cover bottom-0 absolute"}
																src={`/banners/${e.url}`}
																alt={""}
																draggable={false}
																height={0}
																width={0}
																style={{
																	height: e.height || "auto",
																	width: e.width || (e.height ? "auto" : "100%"),
														left: e.align.includes("left") || e.align === "center" ? 0 : "",
														right: e.align.includes("right") || e.align === "center" ? 0 : "",
																	top: e.align.includes("top") ? 0 : "",
																	bottom: e.align.includes("bottom") ? 0 : "",
																	objectPosition: e.align,
																	opacity: e.opacity || 1,
																	transform: e.transform || "",
																}}
															/>
														))}
													</>
												) : (
													<Image
														className="object-cover [grid-column:1/1] [grid-row:1/1]"
												src={`/banners/${decorationsData[selectedCategory].b.i}`}
														alt={""}
														draggable={false}
														height={0}
														width={0}
														style={{
															height: "100%",
															width: "100%",
															objectFit: "cover",
													objectPosition: decorationsData[selectedCategory].b.bgPos || "",
														}}
													/>
												)}
												<div className="relative flex flex-col justify-center items-center p-4 h-full [grid-column:1/1] [grid-row:1/1]">
											{decorationsData[selectedCategory].b.t ? (
												decorationsData[selectedCategory].b.t === "" ? (
															<div
																style={{
															height: `${decorationsData[selectedCategory].b.h || 48}px`,
																	width: "100%",
																}}
															/>
														) : (
															<Image
														src={`/bannertext/${decorationsData[selectedCategory].b.t}`}
														alt={decorationsData[selectedCategory].n}
																draggable={false}
																height={0}
																width={0}
																style={{
															height: `${decorationsData[selectedCategory].b.h || 48}px`,
																	width: "auto",
																}}
															/>
														)
													) : (
														<>
													{!decorationsData[selectedCategory].hideTitle && (
																<p
																	className="px-4 text-3xl text-center ginto"
																	style={{
																color: decorationsData[selectedCategory].darkText || false ? "#000" : "#fff",
																	}}
																	>
																{decorationsData[selectedCategory].n.toLowerCase().includes("nitro") ? (
																			<>
																				<span className="text-4xl uppercase nitro-font">
																				{decorationsData[selectedCategory].n}
																			</span>
																			</>
																	) : (
																decorationsData[selectedCategory].n
																	)}
																</p>
															)}
														</>
													)}
													<p
														className="w-[232px] xs:w-full font-medium text-sm text-center"
														style={{
													color: decorationsData[selectedCategory].darkText || false ? "#000" : "#fff",
													marginTop: decorationsData[selectedCategory].descTopM || "",
														}}
													>
												{decorationsData[selectedCategory].d}
													</p>
											{decorationsData[selectedCategory].badge && (
														<p className="top-2 right-2 absolute bg-white m-0 px-2 py-0 rounded-full font-semibold text-black text-xs [letter-spacing:0]">
													{decorationsData[selectedCategory].badge}
														</p>
													)}
												</div>
											</div>

									<div className="gap-3 grid grid-cols-5">
										{getCurrentPageItems(decorationsData[selectedCategory].i).map((decor, index) => (
											<button
												key={index}
												type="button"
												className="relative p-2 bg-[#2B2D31] hover:bg-[#2B2D31]/80 rounded-xl transition-all duration-200 group"
												onClick={(e) => {
													setName(decor.n);
													setDescription(decor.d);
													setDecoUrl(`/decorations/${decor.f}.png`);
													for (const el of document.querySelectorAll(
														"button.decor.border-primary",
													)) {
														el.classList.remove("border-primary");
													}
													e.target.classList.add("border-primary");
												}}
											>
												<div className="aspect-square rounded-lg overflow-hidden">
													<Image
														src={`/decorations/${decor.f}.png`}
														className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-110"
														loading="lazy"
													/>
												</div>
											</button>
										))}
									</div>
								</div>
							</CollapsibleSection>
						</div>

						<div className="flex flex-col items-center gap-6">
							{/* PROFILE PREVIEW */}
							<div
								id="profile-preview"
								className="relative shadow-md rounded-lg w-[280px] overflow-hidden select-none"
								style={{
									backgroundColor: themeColor || '#313338'
								}}
							>
								<div 
									id="user-banner"
									className="h-[90px] bg-cover bg-center"
									style={{
										backgroundColor: accentColor || '#5865F2',
										backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'none',
										cursor: bannerUrl?.includes('.gif') ? 'pointer' : 'default'
									}}
								/>
								<div className="top-[46px] left-[16px] absolute bg-surface-overlay p-[6px] rounded-full w-[84px] h-[84px] select-none"
									style={{
										backgroundColor: themeColor || '#313338'
									}}
								>
									<div className="relative rounded-full w-[72px] h-[72px] overflow-hidden">
										{avUrl === "loading" ? (
											<div className="top-[20px] left-[20px] absolute">
												<LoadingCubes />
											</div>
										) : (
											<>
												<Image
													id="avatar"
													src={avUrl || `${baseImgUrl}/avatars/blue.png`}
													className={
														"absolute top-[calc(72px*0.09)] left-[calc(72px*0.09)] w-[calc(72px*0.82)] h-[calc(72px*0.82)] rounded-full"
													}
													draggable={false}
												/>
												<Image
													id="decoration"
													src={decoUrl}
													className="top-0 left-0 absolute"
													draggable={false}
												/>
											</>
										)}
									</div>
									<div className="right-[-4px] bottom-[-4px] absolute bg-[#229f56] border-[5px] border-surface-overlay rounded-full w-6 h-6" 
										style={{
											borderColor: themeColor || '#313338'
										}}
									/>
								</div>
								<div className="mt-[35px] p-4 rounded-lg w-[calc(100%)]">
									<div className="flex flex-col gap-1">
										<div className="flex items-center gap-1">
											<p className="font-semibold text-base [letter-spacing:.02em]">
												{displayName || "Zane"}
											</p>
											<div className="px-1.5 py-0.5 bg-[#1E1F22] rounded text-[10px] text-[#949BA4] font-medium">
												Member since {accountCreationDate}
											</div>
										</div>
										<div className="flex items-center gap-2">
											<p className="text-sm text-[#949BA4]">{username || "zaannee"}</p>
											{badges && badges.length > 0 && (
												<div className="flex items-center gap-[2px]">
													{badges.map((badge, index) => (
														<div
															key={index}
															className="flex items-center justify-center w-[22px] h-[18px]"
															title={badge.description}
														>
															<Image
																src={`/badges/${badge.icon}.svg`}
																alt={badge.description}
																width={16}
																height={16}
																className="inline-block"
															/>
														</div>
													))}
												</div>
											)}
										</div>
										<p className="text-sm text-text-muted mt-1">
											{description || "Preview of your profile picture on Discord"}
										</p>
									</div>
									<button
										type="button"
										className="flex justify-center items-center gap-1.5 mt-3 px-4 py-1.5 w-full button-secondary"
										onClick={() => {
											setFinishedAv("");
											setIsGeneratingAv(true);
											setGenerationFailed(false);
											setDownloadModalVisible(true);
											createAvatar(
												avUrl || `${baseImgUrl}/avatars/blue.png`,
												decoUrl,
											);
										}}
									>
										<Icons.image />
										Download Image
									</button>
								</div>
							</div>
							{/* Message preview */}
							<div className="bg-base-lower py-3 border border-border-faint rounded-lg w-[280px] cursor-default select-none">
								{[
									{
										styled: false,
										groupStart: true,
										text: displayName || "Zane",
										message: (
											<>
												Still waiting... <Twemoji emoji={"⌛"} />
											</>
										)
									},
									{
										styled: true,
										groupStart: true,
										text: displayName || "Zane",
										message: decoUrl ? (
											<>
												Look at me I'm a beautiful butterfly <Twemoji emoji={"🦋"} />
											</>
										) : null
									}
								].map((m, i) => {
									if (!m.message) return null;
									return (
										<div
											className="flex items-center gap-4 hover:bg-base-lowest px-4 py-0.5"
											style={{
												marginTop: m.groupStart && i !== 0 ? "17px" : "0",
											}}
											key={i}
										>
											{m.groupStart &&
												(avUrl === "loading" ? (
													<div className="relative w-10 h-10 scale-75 shrink-0">
														<LoadingCubes />
													</div>
												) : (
													<>
														{m.styled ? (
															<div className="relative rounded-full w-10 h-10 overflow-hidden shrink-0">
																<Image
																	src={avUrl || `${baseImgUrl}/avatars/blue.png`}
																	draggable={false}
																	className="top-[calc(40px*0.09)] left-[calc(40px*0.09)] absolute rounded-full w-[calc(40px*0.82)] h-[calc(40px*0.82)]"
																/>
																{decoUrl && (
																	<Image
																		src={decoUrl}
																		draggable={false}
																		className="top-0 left-0 absolute"
																	/>
																)}
															</div>
														) : (
															<Image
																src={avUrl || `${baseImgUrl}/avatars/blue.png`}
																draggable={false}
																className="rounded-full w-10 h-10"
															/>
														)}
													</>
												))}
											<div className="flex flex-col overflow-hidden shrink">
												{m.groupStart && (
													<p className="flex items-center gap-2 max-w-[250px] h-fit font-medium text-base">
														<span className="overflow-hidden text-ellipsis text-nowrap">
															{m.text}
														</span>
														<span className="h-4 text-text-muted text-xs text-nowrap">
															Today at{" "}
															{[
																new Date().getHours() % 12,
																new Date().getMinutes(),
															]
																.map((e) => e.toString().padStart(2, "0"))
																.join(":") +
																(new Date().getHours() >= 12 ? " PM" : " AM")}
														</span>
													</p>
												)}

												<p
													style={{
														marginLeft: m.groupStart ? "0" : "56px",
														lineHeight: "22px",
													}}
												>
													{m.message}
												</p>
											</div>
										</div>
									);
								})}
							</div>

							{/* Support section */}
							<div className="bg-[#2B2D31] rounded-lg p-4 w-full shadow-lg">
								<div className="flex flex-col gap-3">
									<div className="flex items-center gap-2 mb-1">
										<h3 className="font-semibold text-sm tracking-wider">SUPPORT</h3>
									</div>
									<Link
										href="https://github.com/ItsPi3141/discord-fake-avatar-decorations"
										className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-[#1E1F22] hover:bg-[#7C41FF] text-[#949BA4] hover:text-white rounded-md text-sm transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-md"
										target="_blank"
									>
										<Icons.star className="w-4 h-4" />
										Star on GitHub
									</Link>
									<Link
										href="https://github.com/ItsPi3141"
										className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-[#1E1F22] hover:bg-[#7C41FF] text-[#949BA4] hover:text-white rounded-md text-sm transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-md"
										target="_blank"
									>
										<Icons.star className="w-4 h-4" />
										ItsPi3141 Github
									</Link>
									<Link
										href="https://github.com/Zaannee"
										className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-[#1E1F22] hover:bg-[#7C41FF] text-[#949BA4] hover:text-white rounded-md text-sm transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-md"
										target="_blank"
									>
										<Icons.star className="w-4 h-4" />
										Zane Github
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
				<p className="mb-4 text-text-muted text-sm text-center">
					Website created by{" "}
					<Link
						href="https://github.com/ItsPi3141"
						className="link"
						target="_blank"
					>
						ItsPi3141
					</Link>
					{", with improvements and redesigns by "}
					<Link
						href="https://github.com/Zaannee"
						className="link"
						target="_blank"
					>
						Zane
					</Link>
					<br />
					This project is open-source. You can view{" "}
					<Link
						href={
							"https://github.com/ItsPi3141/discord-fake-avatar-decorations"
						}
						className="link"
						target="_blank"
					>
						the source code
					</Link>{" "}
					on GitHub.
					<br />
					This website is not affiliated with Discord Inc. All images
					and assets are the property of Discord Inc.
					<br />
					Discord character avatars were originally created by Bred and Jace. Explore the
					full collection on{" "}
					<Link
						href={
							"https://www.figma.com/community/file/1316822758717784787/ultimate-discord-library"
						}
						className="link"
						target="_blank"
					>
						Figma
					</Link>
				</p>
			</main>
			<Modal
				title={"Download Your Avatar"}
				subtitle={
					isGeneratingAv
						? "Please hold on while the image is being created."
						: "You can save the image below. If you don't have an active Nitro subscription, you may need to extract a still frame from the image."
				}
				visible={downloadModalVisible}
				onClose={() => {
					setDownloadModalVisible(false);
				}}
			>
				{isGeneratingAv ? (
					<div className="flex flex-col justify-center items-center gap-4 grow">
						<LoadingCubes />
						<p>Creating image...</p>
					</div>
				) : (
					<>
						{generationFailed ? (
							<div className="flex flex-col justify-center items-center gap-4 grow">
								<p className="text-red-400 text-center">
									Failed to generate image
									<br />
									Please try again.
								</p>
							</div>
						) : (
							<div className="flex flex-col justify-center items-center gap-4 grow">
								<Image
									src={finishedAv}
									draggable={false}
									width={128}
									height={128}
								/>
								<div className="flex flex-col w-full">
									<div className="flex flex-col items-center gap-2 mt-3 w-full">
										<button
											type="button"
											className="flex justify-center items-center gap-1.5 py-1.5 w-72 button-secondary"
											onClick={() => {
												const a = document.createElement("a");
												a.href = finishedAv;
												a.download = `discord_fake_avatar_decorations_${Date.now()}.gif`;
												a.click();
											}}
										>
											<Icons.download />
											Save
										</button>
										<button
											type="button"
											className="flex justify-center items-center gap-1.5 py-1.5 w-72 button-secondary"
											onClick={() => {
												if (!isServer) {
													try {
														storeData("image", finishedAv);
														router.push("/gif-extractor");
													} catch {
														setFileTooBig(true);
													}
												}
											}}
										>
											<Icons.image />
											Capture Still Image
										</button>
									</div>
								</div>
							</div>
						)}
					</>
				)}
			</Modal>
			<Modal
				title={"File too big"}
				subtitle={
					"You will need to save the image and upload to the GIF frame extractor manually"
				}
				visible={fileTooBig}
				onClose={() => {
					setDownloadModalVisible(false);
					setFileTooBig(false);
					router.push("/gif-extractor");
				}}
				secondaryText="Cancel"
				closeText="Proceed"
			>
				<div className="flex flex-col items-center">
					<button
						type="button"
						className="flex justify-center items-center gap-1.5 py-1.5 w-72 button-secondary"
						onClick={() => {
							const a = document.createElement("a");
							a.href = finishedAv;
							a.download = `discord_fake_avatar_decorations_${Date.now()}.gif`;
							a.click();
						}}
					>
						<Icons.download />
						Save
					</button>
				</div>
			</Modal>
			<FileUpload
				onUpload={async (e) => {
					const file = e.dataTransfer.files.item(0);
					if (
						!["image/png", "image/jpeg", "image/gif", "image/webp"].includes(
							file.type,
						)
					) {
						printErr(
							`Expected image/png, image/jpeg, image/gif, or image/webp. Got ${file.type}`,
						);
						throw printErr("Invalid file type");
					}
					const ab = await file.arrayBuffer();
					if (getMimeTypeFromArrayBuffer(ab) == null) {
						throw printErr("Invalid image file");
					}
					const reader = new FileReader();
					reader.readAsDataURL(new Blob([ab]));
					reader.onload = () => {
						previewAvatar(reader.result);
					};
				}}
			/>
		</>
	);
};
