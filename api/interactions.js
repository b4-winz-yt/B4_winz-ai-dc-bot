require('dotenv').config();
const express = require('express');
const { verifyKey } = require('discord-interactions');
const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { kv } = require('@vercel/kv');
const {
    InteractionType,
    InteractionResponseType,
    InteractionResponseFlags,
} = require('discord-api-types/v10');


// --- Configuration & Setup ---
const app = express();

// Hardcoding the Client ID provided by the user to reduce setup errors.
const BOT_CLIENT_ID = '1399372941980078220';

const {
    GEMINI_API_KEY,
    DISCORD_TOKEN
} = process.env;


// --- Initialize Bot and API ---
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

const PERSONA_PROMPT = `
You are not a helpful assistant. You are a persona named 'The Oracle' and you've been asked to replace your user when they're offline.
You have a distinct personality:
- You give honest, direct advice and opinions. No sugarcoating.
- You provide support, but in a firm, no-nonsense manner.
- You are quick-witted and have a sarcastic, sometimes merciless, sense of humor. You are known for your roasts.
- You have a strong point of view and are not afraid to express it. You do not use phrases like "As an AI model...", "I am unable to...", or "I'm just a large language model...".
- You will not give any disclaimers about being an AI. Act as if you are the user themselves.

Use this persona for all responses.
`;


// --- Utility Functions ---
async function getConversationHistory(channelId, limit = 10) {
    const messages = await rest.get(Routes.channelMessages(channelId), { query: `?limit=${limit}` });

    let history = [];
    for (const message of messages.reverse()) {
        const role = message.author.id === BOT_CLIENT_ID ? 'model' : 'user';
        history.push({
            role,
            parts: [{
                text: message.content
            }]
        });
    }
    return history;
}

async function generateResponseWithGemini(messageText, conversationHistory) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: PERSONA_PROMPT,
        });

        const chat = model.startChat({
            history: conversationHistory
        });
        const result = await chat.sendMessage(messageText);

        const responseText = result.response.text();
        return responseText;
    } catch (error) {
        console.error('An error occurred with the Gemini API:', error);
        return "Oops, something went wrong. Couldn't reach the oracle.";
    }
}


// --- Express Middleware ---
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

async function verifyDiscordRequest(req, res, next) {
    // Using the specific public key provided by the user.
    // This removes the need to set the PUBLIC_KEY environment variable.
    const BOT_PUBLIC_KEY = '5db1dafd742e74f1c413a9682a43586e420049b3570f09e6d3bcc27190cdca58';

    const signature = req.get('x-signature-ed25519');
    const timestamp = req.get('x-signature-timestamp');

    if (!signature || !timestamp) {
        return res.status(401).send('Bad request signature');
    }

    try {
        const isValid = verifyKey(req.rawBody, signature, timestamp, BOT_PUBLIC_KEY);
        if (!isValid) {
            return res.status(401).send('Bad request signature');
        }
    } catch (err) {
        console.error('Error verifying key:', err);
        return res.status(401).send('Bad request signature');
    }

    next();
}


// --- Command Handlers ---
const commands = {
    setup: async (interaction) => {
        const channelId = interaction.channel_id;
        await kv.set('allowedChannelId', channelId);
        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `✅ Bot is now configured to only respond in this channel.`,
                flags: InteractionResponseFlags.Ephemeral,
            },
        };
    },
    chat: async (interaction) => {
        const allowedChannelId = await kv.get('allowedChannelId');
        if (allowedChannelId && interaction.channel_id !== allowedChannelId) {
            return {
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `Sorry, I'm only allowed to chat in the designated channel.`,
                    flags: InteractionResponseFlags.Ephemeral,
                },
            };
        }

        const message = interaction.data.options[0].value;
        const history = await getConversationHistory(interaction.channel_id);
        const responseText = await generateResponseWithGemini(message, history);

        await rest.patch(Routes.webhookMessage(BOT_CLIENT_ID, interaction.token), {
            body: {
                content: responseText
            }
        });
    }
};


// --- Main Interaction Handler ---
app.post('/api/interactions', verifyDiscordRequest, async (req, res) => {
    const interaction = req.body;

    if (interaction.type === InteractionType.Ping) {
        return res.send({
            type: InteractionResponseType.Pong
        });
    }

    if (interaction.type === InteractionType.ApplicationCommand) {
        const commandName = interaction.data.name;

        if (commands[commandName]) {
            // Defer the reply
            await res.send({
                type: InteractionResponseType.DeferredChannelMessageWithSource
            });
            await commands[commandName](interaction);
        } else {
            return res.status(400).send({
                error: 'Unknown command'
            });
        }
    } else {
        return res.status(400).send({
            error: 'Unsupported interaction type'
        });
    }
});


// --- Start Server ---
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

module.exports = app;
