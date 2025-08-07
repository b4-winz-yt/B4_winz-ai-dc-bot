require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, PermissionsBitField } = require('discord.js');

// Hardcoding the Client ID provided by the user.
const BOT_CLIENT_ID = '1399372941980078220';

const { DISCORD_TOKEN } = process.env;

if (!DISCORD_TOKEN) {
    console.error("Error: DISCORD_TOKEN must be provided in your .env file.");
    process.exit(1);
}

const commands = [
    new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Limits the bot\'s functionality to the current channel.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('chat')
        .setDescription('Sends a message to the Oracle.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send.')
                .setRequired(true))
        .toJSON(),
];

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(BOT_CLIENT_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
