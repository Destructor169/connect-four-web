import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Gamepad2, LogOut, BarChart3, User2 } from "lucide-react";

type Props = {
  compact?: boolean; // allows tighter layout where needed
};

export default function ProfileMenu({ compact }: Props) {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <Button variant="outline" onClick={() => navigate("/auth")} className="rounded-full">
        Sign in
      </Button>
    );
  }

  const name = user?.name ?? "Player";
  const email = user?.email ?? "unknown@example.com";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-3 rounded-full border px-3 py-1.5 hover:bg-muted transition-colors ${compact ? "text-sm" : ""}`}
          aria-label="Open profile menu"
        >
          {/* Avatar with gradient ring + badge */}
          <span className="relative inline-flex">
            <span className="p-[2px] rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500">
              <Avatar className="h-8 w-8 rounded-full ring-2 ring-background bg-background transition-shadow hover:shadow-[0_0_0_3px_rgba(99,102,241,0.35)]">
                <AvatarImage src={user?.image ?? ""} alt={name} />
                <AvatarFallback className="bg-muted">
                  <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            </span>
            {/* Small connect-4/game badge */}
            <span className="absolute -bottom-0 -right-0 h-3.5 w-3.5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 border border-background grid place-items-center shadow-sm">
              <span className="h-2 w-2 rounded-full bg-white/80" />
            </span>
          </span>
          <div className="hidden sm:block text-left">
            <div className="font-semibold leading-tight flex items-center gap-1">
              <User2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate max-w-[140px]">{name}</span>
            </div>
            <div className="text-xs text-muted-foreground truncate max-w-[160px]">{email}</div>
          </div>
          <span className="sm:hidden font-semibold">{initials}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.image ?? ""} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-semibold truncate">{name}</div>
              <div className="text-xs text-muted-foreground truncate">{email}</div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate("/stats")} className="cursor-pointer">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>View Stats</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive cursor-pointer"
          onClick={() => {
            // Sign out then take to auth
            Promise.resolve(signOut?.()).finally(() => navigate("/auth"));
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}