# Serverless Gemini Discord Bot for Vercel

This is a Discord bot that uses the Google Gemini API to respond to users with a unique persona. It has been specifically designed to run on a serverless platform like Vercel.

Instead of being always online like a traditional bot, it responds to Discord interactions (slash commands) via webhooks.

## Features

- **Serverless Architecture**: Built to deploy on Vercel's free hobby plan.
- **Gemini-Powered Responses**: Uses the `gemini-1.5-flash` model to generate witty and in-character responses.
- **Slash Commands**: All interactions are through slash commands.
  - `/chat [message]`: Chat with the bot.
  - `/setup`: (Admin-only) Restricts the bot to operate in the channel where the command is used.
- **Persistent Configuration**: The `/setup` command's channel preference is stored in Vercel KV, a serverless Redis database.

---

## Setup and Deployment

Follow these steps to get your own instance of the bot running.

### 1. Get Your Credentials

You will need to gather the following secrets and IDs:

- **Discord Bot Token**: Go to your [Discord Developer Portal](https://discord.com/developers/applications), create a new application, and go to the "Bot" tab. Click "Reset Token" to get your token.
- **Discord Client ID**: On the "General Information" page of your application, you'll find the `APPLICATION ID`. This is your Client ID.
- **Discord Public Key**: Also on the "General Information" page, you'll find the `PUBLIC KEY`.
- **Gemini API Key**: Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and create a new API key.
- **Vercel KV Store**: You'll set this up during the Vercel deployment.

### 2. Local Configuration (for running commands)

First, clone the repository and install the dependencies:

```bash
git clone <your-repo-url>
cd <your-repo-name>
npm install
```

Next, create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and fill in the values you gathered in Step 1.

### 3. Register Slash Commands

Before deploying, you need to tell Discord about your bot's commands. Run the following command in your terminal:

```bash
npm run register
```

You should see a success message confirming the commands were registered. You only need to do this once.

### 4. Deploy to Vercel

1.  **Create a Vercel Project**: Go to your Vercel dashboard and create a new project, linking it to your forked/cloned GitHub repository.
2.  **Configure Environment Variables**: In the project settings on Vercel, navigate to "Environment Variables". Add the `DISCORD_TOKEN`, `CLIENT_ID`, `PUBLIC_KEY`, and `GEMINI_API_KEY` with the same values from your `.env` file.
3.  **Set up Vercel KV**:
    - Go to the "Storage" tab in your Vercel project.
    - Create a new KV (Redis) database.
    - Connect it to your project. Vercel will automatically add the necessary `KV_*` environment variables.
4.  **Deploy**: Trigger a deployment from the Vercel dashboard.
5.  **Set the Interactions Endpoint URL**:
    - Once deployed, Vercel will give you a URL (e.g., `https://your-project-name.vercel.app`).
    - Go back to your [Discord Developer Portal](https://discord.com/developers/applications) and select your application.
    - In the "General Information" page, paste your Vercel deployment URL into the **INTERACTIONS ENDPOINT URL** field. Make sure to append `/api/interactions` to the URL. For example: `https://your-project-name.vercel.app/api/interactions`.
    - Click "Save Changes".

Your bot should now be online and responding to the `/chat` and `/setup` commands in your Discord server! You must invite the bot to your server from the "OAuth2" -> "URL Generator" page in the Discord Developer Portal, selecting the `bot` and `applications.commands` scopes.
