import { NextResponse } from 'next/server';

const sendWebhookNotification = async (action, data) => {
	const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
	
	if (!webhookUrl) {
		return false;
	}

	try {
		const embed = {
			color: getEmbedColor(action),
			title: 'Discord Custom Avatars Activity',
			description: generateDescription(action, data),
			timestamp: new Date().toISOString(),
			footer: {
				text: 'Discord Custom Avatars'
			}
		};

		const payload = {
			embeds: [embed]
		};

		const response = await fetch(webhookUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			return false;
		}
		
		return true;
	} catch (error) {
		return false;
	}
};

const generateDescription = (action, data) => {
	const date = new Date().toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});

	switch (action) {
		case 'username_fetch':
			return `**${data.username}** fetched their profile using **Discord Custom Avatars** on **${date}**`;
		
		case 'username_fetch_failed':
			return `**Failed Discord user fetch** - Invalid or non-existent user ID attempted on **${date}**`;
		
		case 'image_generation':
			const collection = data.collection || 'Unknown Collection';
			return `**${data.username}** generated an image with **Discord Custom Avatars** using the **${collection}** collection on **${date}**`;
		
		default:
			return `User activity detected on **Discord Custom Avatars** on **${date}**`;
	}
};

const getEmbedColor = (action) => {
	switch (action) {
		case 'username_fetch_failed':
			return 0xff0000;
		case 'username_fetch':
			return 0xff8c00;
		case 'image_generation':
			return 0x00bfff;
		default:
			return 0x000000;
	}
};

export async function POST(request) {
	try {
		const { action, data } = await request.json();
		
		if (!action || !data) {
			return NextResponse.json({ error: 'Missing action or data' }, { status: 400 });
		}

		const success = await sendWebhookNotification(action, data);
		
		if (success) {
			return NextResponse.json({ success: true });
		} else {
			return NextResponse.json({ error: 'Failed to send webhook' }, { status: 500 });
		}
	} catch (error) {
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
