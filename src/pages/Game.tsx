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
      // Simple AI: find first available column (you can replace with actual engine call)
      const availableColumns = [];
      for (let col = 0; col < 5; col++) {
        if (game.board[0][col] === "") {
          availableColumns.push(col);
        }
      }
      
      if (availableColumns.length > 0) {
        const randomCol = availableColumns[Math.floor(Math.random() * availableColumns.length)];
        const aiColor = game.currentTurn;
        
        await makeMove({
          gameId: game.gameId,
          color: aiColor,
          column: randomCol,
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