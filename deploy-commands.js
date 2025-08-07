require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Load your command(s)
const commands = [];
const command = require('./minesweeper.js');
commands.push(command.data.toJSON());

// Setup REST client
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// ENV: Replace with your bot's actual IDs
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID; // Optional: for testing in a specific server

(async () => {
  try {
    console.log('⏳ Deploying slash commands...');

    if (GUILD_ID) {
      // For development/testing - only deploy to one server
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
      );
      console.log(`✅ Commands registered to test server ${GUILD_ID}`);
    } else {
      // Global deployment - can take up to 1 hour to appear
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands }
      );
      console.log('✅ Commands registered globally.');
    }
  } catch (error) {
    console.error('❌ Failed to deploy commands:', error);
  }
})();
