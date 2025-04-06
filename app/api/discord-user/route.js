import { NextResponse } from 'next/server';

const DISCORD_API_ENDPOINT = 'https://discord.com/api/v10';

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

        return NextResponse.json(userData);
    } catch (error) {
        console.error('Error fetching Discord user:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch Discord user',
            details: error.message
        }, { status: 500 });
    }
} 