import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const COLS = 5;
const ROWS = 4;
type Cell = "" | "Y" | "R";
type Board = Cell[][];
type Color = "Y" | "R";

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function getAvailableRow(board: Board, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === "") return r;
  }
  return -1;
}

function canPlay(board: Board, col: number): boolean {
  if (col < 0 || col >= COLS) return false;
  return board[0][col] === "";
}

function play(board: Board, col: number, color: Color): { board: Board; row: number } | null {
  if (!canPlay(board, col)) return null;
  const newBoard = cloneBoard(board);
  let rowToFill = -1;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (newBoard[r][col] === "") {
      rowToFill = r;
      break;
    }
  }
  if (rowToFill === -1) return null;
  newBoard[rowToFill][col] = color;
  return { board: newBoard, row: rowToFill };
}

function isBoardFull(board: Board): boolean {
  return board[0].every((c) => c !== "");
}

function checkWinAt(board: Board, row: number, col: number, color: Color): boolean {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal \
    [1, -1],  // diagonal /
  ];
  for (const [dr, dc] of directions) {
    let count = 1;
    for (let i = 1; i < 4; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) break;
      if (board[r][c] !== color) break;
      count++;
    }
    for (let i = 1; i < 4; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) break;
      if (board[r][c] !== color) break;
      count++;
    }
    if (count >= 4) return true;
  }
  return false;
}

function getValidMoves(board: Board): number[] {
  const moves: number[] = [];
  for (let c = 0; c < COLS; c++) if (canPlay(board, c)) moves.push(c);
  // Center-first ordering
  const order = [2, 1, 3, 0, 4];
  return order.filter((c) => moves.includes(c));
}

function opponent(color: Color): Color {
  return color === "Y" ? "R" : "Y";
}

// Static evaluation (lightweight): favor center columns and potential connections
function evaluateBoard(board: Board, color: Color): number {
  const center = 2;
  let score = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (cell === "") continue;
      const val = cell === color ? 1 : -1;
      // center preference and slight depth encouragement
      score += val * (3 - Math.abs(center - c));
    }
  }
  return score;
}

function negamax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  toMove: Color
): number {
  // If no depth or terminal, evaluate
  if (depth === 0 || isBoardFull(board)) {
    return evaluateBoard(board, toMove);
  }

  const validMoves = getValidMoves(board);
  if (validMoves.length === 0) return 0;

  let value = -Infinity;

  for (const col of validMoves) {
    const res = play(board, col, toMove);
    if (!res) continue;
    const { board: nb, row } = res;

    // Check immediate win
    if (checkWinAt(nb, row, col, toMove)) {
      // Prefer quicker wins; subtract remaining depth to win sooner
      return 100000 - (ROWS * COLS - depth);
    }

    const score = -negamax(nb, depth - 1, -beta, -alpha, opponent(toMove));
    value = Math.max(value, score);
    alpha = Math.max(alpha, score);
    if (alpha >= beta) break; // alpha-beta cutoff
  }

  return value;
}

function findBestMove(board: Board, toMove: Color): number | null {
  const valid = getValidMoves(board);
  if (valid.length === 0) return null;

  let bestCol = valid[0];
  let bestScore = -Infinity;

  // Iterative deepening up to remaining spaces (tiny board)
  const remaining = board.flat().filter((c) => c === "").length;
  const maxDepth = Math.min(remaining, 10);

  for (let depth = 1; depth <= maxDepth; depth++) {
    let localBestCol = bestCol;
    let localBestScore = -Infinity;

    for (const col of valid) {
      const res = play(board, col, toMove);
      if (!res) continue;
      const { board: nb, row } = res;

      if (checkWinAt(nb, row, col, toMove)) {
        return col; // immediate win found
      }

      const score = -negamax(nb, depth - 1, -Infinity, Infinity, opponent(toMove));
      if (score > localBestScore) {
        localBestScore = score;
        localBestCol = col;
      }
    }

    bestCol = localBestCol;
    bestScore = localBestScore;

    // Early exit if we found a clearly winning line
    if (bestScore > 50000) break;
  }

  return bestCol ?? null;
}

export default function Game() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isThinking, setIsThinking] = useState(false);

  const game = useQuery(api.games.getGame, gameId ? { gameId } : "skip");
  const makeMove = useMutation(api.games.makeMove);

  useEffect(() => {
    if (!gameId) {
      navigate("/");
      return;
    }
  }, [gameId, navigate]);

  useEffect(() => {
    // If it's the AI's turn and game is still playing, make AI move
    if (game && game.state === "playing" && game.mode === "human-vs-ai") {
      const isAITurn = game.currentTurn !== game.playerColor;
      if (isAITurn && !isThinking) {
        setIsThinking(true);
        // Simulate AI thinking time
        setTimeout(() => {
          makeAIMove();
        }, 1000 + Math.random() * 2000); // 1-3 seconds
      }
    }
  }, [game?.currentTurn, game?.state]);

  const makeAIMove = async () => {
    if (!game) return;
    
    try {
      const aiColor = game.currentTurn as Color;

      // Use negamax-based search to find optimal move
      const best = findBestMove(game.board as Board, aiColor);
      let chosenCol: number | null = best;

      // Fallback: any valid move if search fails (shouldn't happen)
      if (chosenCol === null) {
        const fallback = getValidMoves(game.board as Board);
        chosenCol = fallback.length ? fallback[0] : null;
      }

      if (chosenCol !== null) {
        await makeMove({
          gameId: game.gameId,
          color: aiColor,
          column: chosenCol,
        });

        if (soundEnabled) {
          // Play drop sound
        }
      }
    } catch (error) {
      console.error("AI move error:", error);
      toast.error("AI move failed");
    } finally {
      setIsThinking(false);
    }
  };

  const handleColumnClick = async (column: number) => {
    if (!game || game.state !== "playing") return;
    
    const isPlayerTurn = game.currentTurn === game.playerColor;
    if (!isPlayerTurn || isThinking) return;

    try {
      await makeMove({
        gameId: game.gameId,
        color: game.playerColor,
        column,
      });
      
      if (soundEnabled) {
        // Play drop sound
      }
    } catch (error) {
      console.error("Move error:", error);
      toast.error("Invalid move");
    }
  };

  const handleNewGame = () => {
    navigate("/");
  };

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  const isPlayerTurn = game.currentTurn === game.playerColor;
  const gameStatus = game.state === "finished" 
    ? game.result 
    : isThinking 
      ? "AI is thinking..." 
      : isPlayerTurn 
        ? "Your turn" 
        : "AI's turn";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </Button>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleNewGame}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              New Game
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold">Connect 4</CardTitle>
                <div className="flex items-center justify-center gap-4">
                  <Badge variant={game.playerColor === "Y" ? "default" : "secondary"}>
                    You: {game.playerColor === "Y" ? "Yellow" : "Red"}
                  </Badge>
                  <Badge variant="outline">
                    {gameStatus}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="bg-blue-600 rounded-lg p-4 shadow-lg">
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 5 }, (_, col) => (
                      <div key={col} className="flex flex-col gap-2">
                        {Array.from({ length: 4 }, (_, row) => {
                          const cell = game.board[row][col];
                          const isLastMove = game.lastMove?.row === row && game.lastMove?.column === col;
                          const isWinning = game.winningCells?.some(c => c.row === row && c.col === col);
                          
                          return (
                            <motion.div
                              key={`${row}-${col}`}
                              className={`
                                aspect-square rounded-full border-2 border-blue-800 cursor-pointer
                                ${cell === "" ? "bg-white" : ""}
                                ${cell === "Y" ? "bg-yellow-400 shadow-lg" : ""}
                                ${cell === "R" ? "bg-red-500 shadow-lg" : ""}
                                ${isLastMove ? "ring-4 ring-blue-300 ring-opacity-75" : ""}
                                ${isWinning ? "ring-4 ring-green-400 ring-opacity-75 animate-pulse" : ""}
                              `}
                              onClick={() => handleColumnClick(col)}
                              whileHover={{ scale: cell === "" ? 1.05 : 1 }}
                              whileTap={{ scale: 0.95 }}
                              // Enhanced drop animation for the last placed piece
                              initial={isLastMove ? { y: -300, scale: 0.95 } : {}}
                              animate={
                                isLastMove
                                  ? { y: [-300, 12, -6, 0], scale: [0.95, 1.02, 0.995, 1] }
                                  : {}
                              }
                              transition={
                                isLastMove
                                  ? { duration: 0.6, ease: ["easeOut", "easeInOut", "easeOut"], times: [0, 0.75, 0.9, 1] }
                                  : {}
                              }
                            >
                              {cell !== "" && (
                                <div className={`
                                  w-full h-full rounded-full
                                  ${cell === "Y" ? "bg-gradient-to-br from-yellow-300 to-yellow-500" : ""}
                                  ${cell === "R" ? "bg-gradient-to-br from-red-400 to-red-600" : ""}
                                  shadow-inner
                                `} />
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Info */}
          <div className="space-y-6">
            {/* Game Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Game Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Mode:</span>
                    <Badge variant="outline">
                      {game.mode === "human-vs-ai" ? "vs AI" : "AI vs AI"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Your Color:</span>
                    <div className={`w-6 h-6 rounded-full ${
                      game.playerColor === "Y" ? "bg-yellow-400" : "bg-red-500"
                    }`} />
                  </div>
                  <div className="flex justify-between">
                    <span>Current Turn:</span>
                    <div className={`w-6 h-6 rounded-full ${
                      game.currentTurn === "Y" ? "bg-yellow-400" : "bg-red-500"
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Move History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Move History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {game.moves.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No moves yet</p>
                  ) : (
                    game.moves.map((move, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>Move {index + 1}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${
                            move.color === "Y" ? "bg-yellow-400" : "bg-red-500"
                          }`} />
                          <span>Column {move.column + 1}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Game Result */}
            {game.state === "finished" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-700 dark:text-green-300">
                      Game Over!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold text-center">
                      {game.result}
                    </p>
                    <Button 
                      onClick={handleNewGame}
                      className="w-full mt-4"
                    >
                      Play Again
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}