import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Create a new Connect-4 game
export const createGame = mutation({
  args: {
    playerColor: v.union(v.literal("Y"), v.literal("R")),
    mode: v.union(v.literal("human-vs-ai"), v.literal("ai-vs-ai")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const gameId = crypto.randomUUID();
    
    // Initialize empty 5x4 board
    const board = Array(4).fill(null).map(() => Array(5).fill(""));
    
    // Determine who goes first (Y always goes first in Connect-4)
    const firstPlayer = "Y";
    
    const gameDoc = await ctx.db.insert("games", {
      gameId,
      playerColor: args.playerColor,
      mode: args.mode,
      state: "playing",
      board,
      currentTurn: firstPlayer,
      moves: [],
      userId: user?._id,
    });

    return {
      gameId,
      firstPlayer,
      _id: gameDoc,
    };
  },
});

// Get game by ID
export const getGame = query({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    const game = await ctx.db
      .query("games")
      .withIndex("by_game_id", (q) => q.eq("gameId", args.gameId))
      .unique();
    
    return game;
  },
});

// Make a move in the game
export const makeMove = mutation({
  args: {
    gameId: v.string(),
    color: v.union(v.literal("Y"), v.literal("R")),
    column: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db
      .query("games")
      .withIndex("by_game_id", (q) => q.eq("gameId", args.gameId))
      .unique();

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.state !== "playing") {
      throw new Error("Game is not in playing state");
    }

    if (game.currentTurn !== args.color) {
      throw new Error("Not your turn");
    }

    // Validate column
    if (args.column < 0 || args.column >= 5) {
      throw new Error("Invalid column");
    }

    // Find the lowest empty row in the column
    let row = -1;
    for (let r = 3; r >= 0; r--) {
      if (game.board[r][args.column] === "") {
        row = r;
        break;
      }
    }

    if (row === -1) {
      throw new Error("Column is full");
    }

    // Make the move
    const newBoard = game.board.map(row => [...row]);
    newBoard[row][args.column] = args.color;

    // Check for win or draw
    const { winner, winningCells } = checkWin(newBoard, row, args.column, args.color);
    const isDraw = !winner && isBoardFull(newBoard);

    const newMove = {
      color: args.color,
      column: args.column,
      timestamp: Date.now(),
    };

    const updates: any = {
      board: newBoard,
      moves: [...game.moves, newMove],
      lastMove: {
        color: args.color,
        column: args.column,
        row,
      },
      currentTurn: args.color === "Y" ? "R" : "Y",
    };

    if (winner) {
      updates.state = "finished";
      updates.result = `${winner} won`;
      updates.winningCells = winningCells;
    } else if (isDraw) {
      updates.state = "finished";
      updates.result = "draw";
    }

    await ctx.db.patch(game._id, updates);

    return {
      ...game,
      ...updates,
    };
  },
});

// Get user's game history
export const getUserGames = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("games")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
  },
});

// Helper function to check for win
function checkWin(board: string[][], row: number, col: number, color: string) {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal /
    [1, -1],  // diagonal \
  ];

  for (const [dr, dc] of directions) {
    const cells = [];
    
    // Check in both directions
    for (let i = -3; i <= 3; i++) {
      const r = row + i * dr;
      const c = col + i * dc;
      
      if (r >= 0 && r < 4 && c >= 0 && c < 5 && board[r][c] === color) {
        cells.push({ row: r, col: c });
      } else {
        if (cells.length >= 4) break;
        cells.length = 0;
      }
    }
    
    if (cells.length >= 4) {
      return { winner: color, winningCells: cells.slice(0, 4) };
    }
  }
  
  return { winner: null, winningCells: [] };
}

// Helper function to check if board is full
function isBoardFull(board: string[][]) {
  return board[0].every(cell => cell !== "");
}
