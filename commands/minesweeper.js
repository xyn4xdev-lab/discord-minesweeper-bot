const { 
  SlashCommandBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require('discord.js');

const GRID_SIZE = 5;
const MINES_COUNT = 5;

const games = new Map(); // gameId -> game state

// Deep clone grid helper
function cloneGrid(grid) {
  return grid.map(row => row.map(cell => ({ ...cell })));
}

function placeMines(grid) {
  let placed = 0;
  while (placed < MINES_COUNT) {
    const r = Math.floor(Math.random() * GRID_SIZE);
    const c = Math.floor(Math.random() * GRID_SIZE);
    if (!grid[r][c].mine) {
      grid[r][c].mine = true;
      placed++;
    }
  }
}

function calculateAdjacents(grid) {
  const directions = [
    [-1,-1], [-1,0], [-1,1],
    [0,-1],          [0,1],
    [1,-1],  [1,0],  [1,1]
  ];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c].mine) continue;
      let count = 0;
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && grid[nr][nc].mine) {
          count++;
        }
      }
      grid[r][c].adjacent = count;
    }
  }
}

function revealCells(grid, r, c) {
  if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return;
  if (grid[r][c].revealed) return;
  grid[r][c].revealed = true;
  if (grid[r][c].adjacent === 0 && !grid[r][c].mine) {
    const directions = [
      [-1,-1], [-1,0], [-1,1],
      [0,-1],          [0,1],
      [1,-1],  [1,0],  [1,1]
    ];
    for (const [dr, dc] of directions) {
      revealCells(grid, r+dr, c+dc);
    }
  }
}

function checkWin(grid) {
  for (const row of grid) {
    for (const cell of row) {
      if (!cell.mine && !cell.revealed) return false;
    }
  }
  return true;
}

// Minesweeper classic number colors
const numberColors = {
  1: ButtonStyle.Primary,   // Blue
  2: ButtonStyle.Success,   // Green
  3: ButtonStyle.Danger,    // Red
  4: ButtonStyle.Secondary, // Gray
  5: ButtonStyle.Secondary,
  6: ButtonStyle.Secondary,
  7: ButtonStyle.Secondary,
  8: ButtonStyle.Secondary,
};

function createBoardButtons(gameId, grid, disabled = false) {
  const rows = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = grid[r][c];
      let label = '\u200B'; // zero-width space so label is never empty
      let style = ButtonStyle.Secondary; // default unrevealed = gray

      if (cell.revealed) {
        if (cell.mine) {
          label = '💣';
          style = ButtonStyle.Danger;
        } else if (cell.adjacent > 0) {
          label = cell.adjacent.toString();
          style = numberColors[cell.adjacent] || ButtonStyle.Secondary;
        } else {
          label = '·'; // middle dot for empty revealed
          style = ButtonStyle.Success; // green
        }
      }

      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`ms_${gameId}_${r}_${c}`)
          .setLabel(label)
          .setStyle(style)
          .setDisabled(disabled || cell.revealed)
      );
    }
    rows.push(row);
  }
  return rows;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('minesweeper')
    .setDescription('Play Minesweeper on Discord!')
    .setContexts(0,1,2)
    .setIntegrationTypes(0,1),

  async execute(interaction) {
    const gameId = interaction.id;

    // Initialize grid with fresh cells
    let grid = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() => ({
        revealed: false,
        mine: false,
        adjacent: 0,
      }))
    );

    placeMines(grid);
    calculateAdjacents(grid);

    games.set(gameId, {
      playerId: interaction.user.id,
      grid,
      gameOver: false,
    });

    await interaction.reply({
      content: `🕹️ ${interaction.user}, your Minesweeper game has started!\nClick a cell to reveal it.`,
      components: createBoardButtons(gameId, grid),
      ephemeral: false,
    });
  },

  async handleButton(interaction) {
    const [prefix, gameId, rowStr, colStr] = interaction.customId.split('_');
    if (prefix !== 'ms') return;

    const game = games.get(gameId);
    if (!game) return interaction.reply({ content: '⚠️ This game no longer exists or expired.', ephemeral: true });

    if (interaction.user.id !== game.playerId) {
      return interaction.reply({ content: '🚫 This is not your game.', ephemeral: true });
    }

    if (game.gameOver) {
      return interaction.reply({ content: '✅ The game has already ended. Start a new one with /minesweeper!', ephemeral: true });
    }

    const r = parseInt(rowStr);
    const c = parseInt(colStr);

    const cell = game.grid[r][c];

    if (cell.revealed) {
      return interaction.reply({ content: 'ℹ️ This cell is already revealed.', ephemeral: true });
    }

    if (cell.mine) {
      // Reveal all mines & end game
      for (let row of game.grid) {
        for (let cell of row) {
          if (cell.mine) cell.revealed = true;
        }
      }
      game.gameOver = true;
      await interaction.update({
        content: `💥 Boom! You hit a mine. Game over, ${interaction.user}!`,
        components: createBoardButtons(gameId, game.grid, true),
      });
      games.delete(gameId);
      return;
    }

    revealCells(game.grid, r, c);

    if (checkWin(game.grid)) {
      game.gameOver = true;
      await interaction.update({
        content: `🎉 Congratulations, ${interaction.user}! You cleared the board and won Minesweeper!`,
        components: createBoardButtons(gameId, game.grid, true),
      });
      games.delete(gameId);
      return;
    }

    await interaction.update({
      content: `🕹️ ${interaction.user}, keep playing Minesweeper!`,
      components: createBoardButtons(gameId, game.grid),
    });
  },
};
