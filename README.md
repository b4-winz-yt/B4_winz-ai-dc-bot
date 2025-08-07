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

---

## Troubleshooting

### Facing "The specified interactions endpoint url could not be verified"?

This is the most common setup issue. It almost always means one of two things:

1.  **Your Vercel application is crashing.** This is usually caused by a missing or incorrect environment variable.
2.  **Your URL or Public Key in the Discord Developer Portal is wrong.**

**Your first step should always be to check the Vercel logs**, as described in step #1 below. If you see an error like `TypeError: Cannot read properties of undefined` or any other crash, it confirms your environment variables are the problem. Please double-check every single variable in your Vercel project settings.

---

If the bot is not responding to commands, follow these steps to diagnose the issue:

1.  **Check the Vercel Function Logs**:
    - Go to your project on the Vercel dashboard.
    - Click on the "Logs" tab.
    - Select the most recent deployment.
    - Use the `/chat` command in Discord and watch the logs in real-time. Any errors in the code (like an invalid API key or a bug) will appear here. This is the most important step for debugging.

2.  **Verify the Interactions Endpoint URL**:
    - In your [Discord Developer Portal](https://discord.com/developers/applications), double-check that the `INTERACTIONS ENDPOINT URL` is correct.
    - It must point to your Vercel deployment URL and end with `/api/interactions`.
    - **Example**: `https://your-project-name.vercel.app/api/interactions`
    - If you update this URL, make sure to click "Save Changes". Discord may take a minute to update.

3.  **Confirm Environment Variables**:
    - In your Vercel project settings, go to "Environment Variables".
    - Ensure that `DISCORD_TOKEN`, `CLIENT_ID`, `PUBLIC_KEY`, and `GEMINI_API_KEY` are all present and have the correct values. A small typo can cause failures.
    - Also, check the "Storage" tab to ensure your KV store is properly connected to the project.

4.  **Check Bot Scopes and Permissions**:
    - Make sure you invited the bot to your server using a URL generated with the correct scopes.
    - In the Discord Developer Portal, go to "OAuth2" -> "URL Generator".
    - Select the `bot` and `applications.commands` scopes.
    - Re-invite the bot to your server using the newly generated URL if you are unsure.

5.  **Re-register Commands**:
    - If the commands don't appear in Discord at all, it might be a registration issue. Try running `npm run register` again locally to be sure.
