import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Users, Bot } from "lucide-react";
import { toast } from "sonner";

export default function GameSetup() {
  const navigate = useNavigate();
  const [playerColor, setPlayerColor] = useState<"Y" | "R">("Y");
  const [gameMode, setGameMode] = useState<"human-vs-ai" | "ai-vs-ai">("human-vs-ai");
  const [isCreating, setIsCreating] = useState(false);

  const createGame = useMutation(api.games.createGame);

  const handleStartGame = async () => {
    setIsCreating(true);
    try {
      const result = await createGame({
        playerColor,
        mode: gameMode,
      });
      
      toast.success("Game created!");
      navigate(`/game/${result.gameId}`);
    } catch (error) {
      console.error("Failed to create game:", error);
      toast.error("Failed to create game");
    } finally {
      setIsCreating(false);
    }
  };

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
        </div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold mb-2">New Game Setup</CardTitle>
                <p className="text-muted-foreground">
                  Configure your Connect-4 game settings
                </p>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Game Mode Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Game Mode</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all ${
                          gameMode === "human-vs-ai" 
                            ? "ring-2 ring-primary bg-primary/5" 
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => setGameMode("human-vs-ai")}
                      >
                        <CardContent className="p-6 text-center">
                          <Users className="h-12 w-12 mx-auto mb-3 text-primary" />
                          <h4 className="font-semibold mb-2">Human vs AI</h4>
                          <p className="text-sm text-muted-foreground">
                            Play against the computer
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all ${
                          gameMode === "ai-vs-ai" 
                            ? "ring-2 ring-primary bg-primary/5" 
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => setGameMode("ai-vs-ai")}
                      >
                        <CardContent className="p-6 text-center">
                          <Bot className="h-12 w-12 mx-auto mb-3 text-primary" />
                          <h4 className="font-semibold mb-2">AI vs AI</h4>
                          <p className="text-sm text-muted-foreground">
                            Watch two AIs compete
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </div>

                {/* Color Selection */}
                {gameMode === "human-vs-ai" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Choose Your Color</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all ${
                            playerColor === "Y" 
                              ? "ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/20" 
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => setPlayerColor("Y")}
                        >
                          <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full mx-auto mb-3 shadow-lg" />
                            <h4 className="font-semibold mb-2">Yellow</h4>
                            <Badge variant="outline">Goes First</Badge>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all ${
                            playerColor === "R" 
                              ? "ring-2 ring-red-400 bg-red-50 dark:bg-red-900/20" 
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => setPlayerColor("R")}
                        >
                          <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-3 shadow-lg" />
                            <h4 className="font-semibold mb-2">Red</h4>
                            <Badge variant="outline">Goes Second</Badge>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* Game Rules */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Game Rules</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Connect 4 pieces in a row to win (horizontal, vertical, or diagonal)</li>
                    <li>• Board size: 5 columns × 4 rows</li>
                    <li>• Yellow always goes first</li>
                    <li>• Click on a column to drop your piece</li>
                  </ul>
                </div>

                {/* Start Game Button */}
                <Button 
                  onClick={handleStartGame}
                  disabled={isCreating}
                  className="w-full py-6 text-lg"
                  size="lg"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Creating Game...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Start Game
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
