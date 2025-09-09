// TODO: REPLACE THIS LANDING PAGE WITH AN ELEGANT, THEMATIC, AND WELL-DESIGNED LANDING PAGE RELEVANT TO THE PROJECT
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Trophy, Users, Bot, Gamepad2, Zap, Target, Crown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import ProfileMenu from "@/components/ProfileMenu";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const userGames = useQuery(api.games.getUserGames);

  // Add: dark mode state + initialization
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const enableDark = stored ? stored === "dark" : prefersDark;
    if (enableDark) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  };

  const stats = userGames ? {
    totalGames: userGames.length,
    wins: userGames.filter(g => g.result?.includes(g.playerColor)).length,
    losses: userGames.filter(g => g.result && !g.result.includes(g.playerColor) && g.result !== "draw").length,
    draws: userGames.filter(g => g.result === "draw").length,
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        {/* Add: top-right dark mode toggle for quick access */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Toggle dark mode"
              onClick={toggleDarkMode}
              className="rounded-full"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <ProfileMenu compact />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Gamepad2 className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Crown className="h-4 w-4 text-yellow-800" />
              </div>
            </motion.div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6"
          >
            Connect 4
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Challenge our advanced AI in the classic strategy game. 
            Connect four pieces in a row to win!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              onClick={() => navigate("/setup")}
              size="lg"
              className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Play className="mr-2 h-6 w-6" />
              Start Playing
            </Button>

            {!isAuthenticated && (
              <Button
                onClick={() => navigate("/auth")}
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg"
              >
                <Users className="mr-2 h-6 w-6" />
                Sign In
              </Button>
            )}
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        {isAuthenticated && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mb-16"
          >
            <Card className="max-w-4xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Your Stats</CardTitle>
                <p className="text-muted-foreground">Welcome back, {user?.name || "Player"}!</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalGames}</div>
                    <div className="text-sm text-muted-foreground">Total Games</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
                    <div className="text-sm text-muted-foreground">Wins</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{stats.losses}</div>
                    <div className="text-sm text-muted-foreground">Losses</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{stats.draws}</div>
                    <div className="text-sm text-muted-foreground">Draws</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart AI</h3>
              <p className="text-muted-foreground">
                Play against our advanced Connect-4 engine with multiple difficulty levels
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Play</h3>
              <p className="text-muted-foreground">
                Smooth animations and instant feedback for the best gaming experience
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Strategy Focus</h3>
              <p className="text-muted-foreground">
                Improve your strategic thinking with move hints and game analysis
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Game Modes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Game Modes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle>Human vs AI</CardTitle>
                    <p className="text-muted-foreground text-sm">Challenge the computer</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Choose your color (Yellow or Red)</li>
                  <li>• Multiple AI difficulty levels</li>
                  <li>• Move hints and analysis</li>
                  <li>• Track your win/loss record</li>
                </ul>
                <Button 
                  onClick={() => navigate("/setup")}
                  className="w-full mt-4"
                >
                  Play vs AI
                </Button>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bot className="h-8 w-8 text-purple-600" />
                  <div>
                    <CardTitle>AI vs AI</CardTitle>
                    <p className="text-muted-foreground text-sm">Watch AIs compete</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Watch optimal gameplay</li>
                  <li>• Learn advanced strategies</li>
                  <li>• Adjustable game speed</li>
                  <li>• Perfect for learning</li>
                </ul>
                <Button 
                  onClick={() => navigate("/setup")}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Watch AI Battle
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* How to Play */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <Card className="p-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-4">How to Play</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">1</Badge>
                    <div>
                      <h4 className="font-semibold">Choose Your Color</h4>
                      <p className="text-sm text-muted-foreground">
                        Select Yellow (goes first) or Red (goes second)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">2</Badge>
                    <div>
                      <h4 className="font-semibold">Drop Your Pieces</h4>
                      <p className="text-sm text-muted-foreground">
                        Click on a column to drop your piece. Gravity pulls it down!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">3</Badge>
                    <div>
                      <h4 className="font-semibold">Connect Four</h4>
                      <p className="text-sm text-muted-foreground">
                        Get 4 pieces in a row (horizontal, vertical, or diagonal) to win!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-600 rounded-lg p-4 shadow-lg">
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 20 }, (_, i) => {
                      const row = Math.floor(i / 5);
                      const col = i % 5;
                      let cellColor = "bg-white";
                      
                      // Demo winning pattern
                      if ((row === 3 && col >= 1 && col <= 4)) {
                        cellColor = "bg-yellow-400";
                      } else if (row === 2 && col === 2) {
                        cellColor = "bg-red-500";
                      } else if (row === 1 && col === 1) {
                        cellColor = "bg-red-500";
                      }
                      
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded-full border border-blue-800 ${cellColor}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}