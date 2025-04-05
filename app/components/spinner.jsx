"use client";

import { useEffect, useState } from "react";

export const LoadingCubes = (props) => (
	<span
		{...props}
		className={`loading-cube-container ${props.className || ""}`}
	>
		<span className="loading-cube" />
		<span className="loading-cube" />
	</span>
);

export const LoadingCircle = (props) => (
	<div
		{...props}
		className={`loading-circle-container ${props.className || ""}`}
	>
		<div className="loading-circle-inner">
			<svg className="loading-circle" viewBox="25 25 50 50" aria-hidden="true">
				<circle className="path path3" cx="50" cy="50" r="20" />
				<circle className="path path2" cx="50" cy="50" r="20" />
				<circle className="path" cx="50" cy="50" r="20" />
			</svg>
		</div>
	</div>
);

export const LoadingScreen = () => {
	const [percentage, setPercentage] = useState(0);

	useEffect(() => {
		const duration = 5000; // 5 secondes
		const interval = 50; // mise à jour tous les 50ms
		const steps = duration / interval;
		let currentStep = 0;

		const timer = setInterval(() => {
			currentStep++;
			const progress = Math.min(100, Math.round((currentStep / steps) * 100));
			setPercentage(progress);

			if (currentStep >= steps) {
				clearInterval(timer);
			}
		}, interval);

		return () => clearInterval(timer);
	}, []);

	return (
		<div className="loading-screen">
			<h1>Discord Custom Avatars</h1>
			<div className="loading-logo">
				<div className="inner-circle" />
			</div>
			<div className="loading-progress">
				<div className="loading-progress-bar" />
			</div>
			<div className="loading-percentage">{percentage}%</div>
		</div>
	);
};

export const LoadingSpinner = (props) => (
	<div {...props} className={`loading-logo ${props.className || ""}`}>
		<div className="inner-circle" />
	</div>
);
