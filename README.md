````markdown
# ⛏️ Discord Minesweeper Bot

A multi-platform Discord bot that lets users play Minesweeper in servers, group chats, or DMs using interactive buttons.

---

## ⚙️ Features

- Slash command `/minesweeper` to start a game
- Interactive button-based Minesweeper grid (5×5 with 5 mines)
- Works in DMs, group chats, and servers
- Automatically handles win/loss conditions
- Clean and responsive game UI using Discord buttons

---

## 🛠️ Installation

```bash
git clone https://github.com/yourusername/discord-minesweeper-bot.git
cd discord-minesweeper-bot
npm install
````

---

## 🔧 Setup

1. Copy the environment file and edit it:

```bash
cp .env.example .env
```

2. Fill in `.env` with your bot's credentials:

```
DISCORD_TOKEN=your-discord-bot-token
CLIENT_ID=your-discord-application-client-id
GUILD_ID=your-test-server-id  # Optional for faster testing
```

---

## 🚀 Deploy Commands

To register the `/minesweeper` slash command:

```bash
node deploy-commands.js
```

* If `GUILD_ID` is set in your `.env`, the command will register instantly in that server.
* If `GUILD_ID` is **not** set, it will register globally (may take up to 1 hour to appear).

---

## ▶️ Run the Bot

```bash
node index.js
```

---

## 🧠 Notes

* Requires Node.js v16 or higher
* Uses Discord.js v14
* Designed for fun, single-player Minesweeper games

---
