import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// Game state validator
export const gameStateValidator = v.union(
  v.literal("waiting"),
  v.literal("playing"),
  v.literal("finished")
);

// Player color validator
export const playerColorValidator = v.union(
  v.literal("Y"),
  v.literal("R")
);

// Game mode validator
export const gameModeValidator = v.union(
  v.literal("human-vs-ai"),
  v.literal("ai-vs-ai")
);

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      
      // Game stats
      gamesWon: v.optional(v.number()),
      gamesLost: v.optional(v.number()),
      gamesDrawn: v.optional(v.number()),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Connect-4 games table
    games: defineTable({
      gameId: v.string(),
      playerColor: playerColorValidator, // Y or R - what color the human player chose
      mode: gameModeValidator, // human-vs-ai or ai-vs-ai
      state: gameStateValidator, // waiting, playing, finished
      board: v.array(v.array(v.union(v.literal("Y"), v.literal("R"), v.literal("")))), // 5x4 board
      currentTurn: playerColorValidator, // whose turn it is
      moves: v.array(v.object({
        color: playerColorValidator,
        column: v.number(),
        timestamp: v.number()
      })),
      result: v.optional(v.union(v.literal("Y won"), v.literal("R won"), v.literal("draw"))),
      userId: v.optional(v.id("users")), // optional user who created the game
      lastMove: v.optional(v.object({
        color: playerColorValidator,
        column: v.number(),
        row: v.number()
      })),
      winningCells: v.optional(v.array(v.object({
        row: v.number(),
        col: v.number()
      }))),
    }).index("by_game_id", ["gameId"])
      .index("by_user", ["userId"])
      .index("by_state", ["state"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;