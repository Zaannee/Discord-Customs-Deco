# Discord Custom Avatars

An elegant web application for creating and customizing Discord avatars with decorations, providing a seamless and user-friendly experience.

## 🌟 Features

- **Avatar Customization**
  - Upload your own profile picture
  - Choose from a curated selection of pre-designed avatars
  - Real-time preview of modifications
  - Support for both GIF and PNG formats
  - Direct Discord user ID integration

- **Avatar Decorations**
  - Wide selection of Discord decorations
  - Instant decoration preview
  - Easy navigation through different themes
  - Smooth animation transitions
  - High-quality decoration rendering

- **Discord Integration**
  - Fetch user profiles directly using Discord ID
  - Display account creation date
  - Preview messages with decorations
  - Automatic username synchronization

- **User Interface**
  - Modern and clean design
  - Fully responsive interface
  - Smooth animations and transitions
  - Dark theme optimized for comfort
  - Interactive preview messages
  - Real-time decoration updates

- **Export Options**
  - High-quality image download
  - Multiple format support
  - Preserved transparency
  - Original image quality maintenance

## 💻 Technologies Used

- Next.js 15.2.0
- Tailwind CSS
- React 19.0.0
- JavaScript
- Discord API Integration

## 🚀 Quick Start

1. Clone the repository
```bash
git clone https://github.com/Zaannee/discord-custom-avatars.git
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Environment Setup

### Discord Bot Configuration

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Under the bot settings, enable these Privileged Gateway Intents:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent
5. Copy your bot token (Keep it secret!)
6. Create a `.env.local` file in the root directory with:
```env
DISCORD_BOT_TOKEN=your_bot_token
```

### Important Notes
- Never share your bot token publicly
- Keep your `.env.local` file in your `.gitignore`
- The bot token is required for the "Fetch User Data" functionality

## 🌐 Deployment

The application is optimized for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Configure environment variables:
   - Go to your project settings in Vercel
   - Navigate to the "Environment Variables" section
   - Add the following variables:
     ```
     DISCORD_BOT_TOKEN=your_bot_token
     ```
   - Make sure to select all environments (Production, Preview, and Development)
   - Click "Save" to apply the changes
3. Deploy automatically with every push

### Vercel Deployment Tips
- After adding environment variables, redeploy your application
- You can verify the environment variables are set correctly in the Vercel deployment logs
- For security, Vercel encrypts all environment variables
- You can use different values for different environments (Production/Preview/Development)

## 👥 Credits

- Originally created by [ItsPi3141](https://github.com/ItsPi3141)
- Enhanced and redesigned by [Zane](https://github.com/Zaannee)
- Discord avatars originally created by Bred and Jace. Check out the full collection on [Figma](https://www.figma.com/@bred)

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page. 

## ⚠️ Development Notice

**Important:** This repository represents the final public release of Discord Custom Avatars. Future updates, enhancements, and new features will be developed privately to maintain exclusive functionality and competitive advantages.

### What this means:
- **Current features**: All documented features remain fully functional and supported
- **Bug fixes**: Critical security and functionality issues may still receive public updates
- **New features**: Will be developed and deployed privately without public source code
- **Community**: Issues and discussions remain welcome for the current feature set

This approach ensures that while the core functionality remains open-source and accessible, advanced features and improvements maintain their exclusive nature.
