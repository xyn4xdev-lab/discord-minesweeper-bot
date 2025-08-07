require('dotenv').config();
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const minesweeperCommand = require('./commands/minesweeper');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel] // Needed for DM interactions
});

client.commands = new Collection();
client.commands.set(minesweeperCommand.data.name, minesweeperCommand);

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) await command.execute(interaction);
    } else if (interaction.isButton()) {
      await minesweeperCommand.handleButton(interaction);
    }
  } catch (err) {
    console.error('❌ Interaction error:', err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ There was an error executing this action.', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ There was an error executing this action.', ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
