require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Events, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Create the bot client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
  partials: [Partials.Channel] // Required for DM support
});

// Load command(s)
client.commands = new Collection();
const commandPath = path.join(__dirname, 'minesweeper.js');
const command = require(commandPath);
client.commands.set(command.data.name, command);

// When bot is ready
client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Slash command + Button interaction handler
client.on(Events.InteractionCreate, async interaction => {
  try {
    // Handle slash command
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (cmd) await cmd.execute(interaction);
    }

    // Handle button press
    if (interaction.isButton()) {
      const prefix = interaction.customId.split('_')[0];
      if (prefix === 'ms' && command.handleButton) {
        await command.handleButton(interaction);
      }
    }
  } catch (err) {
    console.error('❌ Error handling interaction:', err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '⚠️ Something went wrong.', ephemeral: true });
    } else {
      await interaction.reply({ content: '⚠️ Something went wrong.', ephemeral: true });
    }
  }
});

// Start the bot
client.login(process.env.DISCORD_TOKEN);
