import { NextResponse } from 'next/server';

const DISCORD_API_ENDPOINT = 'https://discord.com/api/v10';

const sendWebhookNotification = async (action, data) => {
	const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
	
	if (!webhookUrl) {
		return;
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
			return;
		}
	} catch (error) {
		return;
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

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        if (!process.env.DISCORD_BOT_TOKEN) {
            throw new Error('Discord bot token is not configured');
        }

        const response = await fetch(`${DISCORD_API_ENDPOINT}/users/${userId}`, {
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            throw new Error(`Discord API error: ${response.status}`);
        }

        const user = await response.json();

        const userData = {
            username: user.username,
            global_name: user.global_name,
            discriminator: user.discriminator,
            avatarUrl: user.avatar 
                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}${user.avatar.startsWith('a_') ? '.gif' : '.png'}?size=256`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator || '0') % 5}.png`,
            bannerUrl: user.banner
                ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}${user.banner.startsWith('a_') ? '.gif' : '.png'}?size=600`
                : null,
            accentColor: user.accent_color ? `#${user.accent_color.toString(16).padStart(6, '0')}` : null,
            themeColor: user.theme_colors ? user.theme_colors[0] : null,
            bio: user.bio || null
        };

        if (user.avatar && user.avatar.startsWith('a_')) {
            userData.staticAvatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
        }

        if (user.banner && user.banner.startsWith('a_')) {
            userData.staticBannerUrl = `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.png?size=600`;
        }

        sendWebhookNotification('username_fetch', {
            username: user.global_name || user.username || 'Unidentified User'
        });

        return NextResponse.json(userData);
    } catch (error) {
        return NextResponse.json({ 
            error: 'Failed to fetch Discord user',
            details: error.message
        }, { status: 500 });
    }
} 