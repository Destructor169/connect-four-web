import { mutation } from "./_generated/server";

// Add some test games for development
export const addTestData = mutation({
  args: {},
  handler: async (ctx) => {
    // Create a sample finished game
    const gameId1 = crypto.randomUUID();
    await ctx.db.insert("games", {
      gameId: gameId1,
      playerColor: "Y",
      mode: "human-vs-ai",
      state: "finished",
      board: [
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "R", "", "", ""],
        ["Y", "Y", "Y", "Y", "R"]
      ],
      currentTurn: "Y",
      moves: [
        { color: "Y", column: 0, timestamp: Date.now() - 10000 },
        { color: "R", column: 1, timestamp: Date.now() - 9000 },
        { color: "Y", column: 1, timestamp: Date.now() - 8000 },
        { color: "R", column: 4, timestamp: Date.now() - 7000 },
        { color: "Y", column: 2, timestamp: Date.now() - 6000 },
        { color: "R", column: 1, timestamp: Date.now() - 5000 },
        { color: "Y", column: 3, timestamp: Date.now() - 4000 },
      ],
      result: "Y won",
      lastMove: { color: "Y", column: 3, row: 3 },
      winningCells: [
        { row: 3, col: 0 },
        { row: 3, col: 1 },
        { row: 3, col: 2 },
        { row: 3, col: 3 }
      ]
    });

    // Create a sample ongoing game
    const gameId2 = crypto.randomUUID();
    await ctx.db.insert("games", {
      gameId: gameId2,
      playerColor: "R",
      mode: "human-vs-ai",
      state: "playing",
      board: [
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "Y", "", ""],
        ["R", "Y", "R", "", ""]
      ],
      currentTurn: "R",
      moves: [
        { color: "Y", column: 1, timestamp: Date.now() - 6000 },
        { color: "R", column: 0, timestamp: Date.now() - 5000 },
        { color: "Y", column: 2, timestamp: Date.now() - 4000 },
        { color: "R", column: 2, timestamp: Date.now() - 3000 },
        { color: "Y", column: 2, timestamp: Date.now() - 2000 },
      ],
      lastMove: { color: "Y", column: 2, row: 2 }
    });

    return { message: "Test data added successfully", games: [gameId1, gameId2] };
  },
});
