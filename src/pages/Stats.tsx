import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Minus, X } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function StatsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const games = useQuery(api.games.getUserGames);

  const summary = useMemo(() => {
    const s = { total: 0, wins: 0, losses: 0, draws: 0 };
    if (!games) return s;
    s.total = games.length;
    for (const g of games) {
      if (g.result === "draw") s.draws++;
      else if (g.result?.startsWith("Y") || g.result?.startsWith("R")) {
        // winner stored as "Y won" or "R won"
        const humanWon = g.result?.includes(g.playerColor);
        if (humanWon) s.wins++; else s.losses++;
      }
    }
    return s;
  }, [games]);

  const timeline = useMemo(() => {
    if (!games) return [];
    // oldest -> newest for chart
    const sorted = [...games].sort((a, b) => a._creationTime - b._creationTime);
    return sorted.map((g, i) => {
      let outcome = "Draw";
      if (g.result === "draw") outcome = "Draw";
      else if (g.result?.includes(g.playerColor)) outcome = "Win";
      else outcome = "Loss";
      return { index: i + 1, outcome };
    });
  }, [games]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate("/") } className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </Button>
          <Badge variant="outline" className="text-sm">
            {user?.email ?? "Guest"}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total Games</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{summary.total}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4 text-green-600" /> Wins</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-green-600">{summary.wins}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><X className="h-4 w-4 text-red-600" /> Losses</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-red-600">{summary.losses}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Minus className="h-4 w-4 text-yellow-600" /> Draws</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-yellow-600">{summary.draws}</CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Simple categorical bar chart in pure SVG */}
                  {timeline.map((d, i) => {
                    const barW = 100 / Math.max(1, timeline.length);
                    const x = i * barW + 2;
                    const height = d.outcome === "Win" ? 70 : d.outcome === "Loss" ? 35 : 50;
                    const color =
                      d.outcome === "Win"
                        ? "hsl(var(--chart-1))"
                        : d.outcome === "Loss"
                        ? "hsl(var(--chart-2))"
                        : "hsl(var(--chart-3))";
                    return (
                      <g key={i}>
                        <rect x={x} y={100 - height - 10} width={barW - 4} height={height} rx="2" fill={color} />
                      </g>
                    );
                  })}
                  <line x1="0" y1="90" x2="100" y2="90" stroke="oklch(0.7 0.02 200)" strokeWidth="0.5" />
                </svg>
              </div>
              {timeline.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">No games yet. Play a few to see your stats!</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Win Rate</span>
                <span className="font-semibold">
                  {summary.total ? Math.round((summary.wins / summary.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Loss Rate</span>
                <span className="font-semibold">
                  {summary.total ? Math.round((summary.losses / summary.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Draw Rate</span>
                <span className="font-semibold">
                  {summary.total ? Math.round((summary.draws / summary.total) * 100) : 0}%
                </span>
              </div>
              <Button className="w-full mt-4" onClick={() => navigate("/setup")}>Start a New Game</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}