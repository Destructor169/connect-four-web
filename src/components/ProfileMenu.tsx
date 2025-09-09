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
          {/* Avatar with gradient ring and game icon badge */}
          <span className="relative inline-flex">
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 blur-[6px] opacity-50" aria-hidden />
            <Avatar className="h-9 w-9 rounded-full ring-2 ring-white dark:ring-zinc-900">
              <AvatarImage src={user?.image ?? ""} alt={name} />
              <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-zinc-900 font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Connect-4 badge */}
            <span
              className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full border bg-background shadow"
              aria-hidden
            >
              <Gamepad2 className="h-3.5 w-3.5 text-purple-600" />
            </span>
          </span>

          {/* Text block (name + email) */}
          <div className="hidden sm:block text-left max-w-[200px]">
            <div className="font-semibold leading-tight truncate">{name}</div>
            <div className="text-xs text-muted-foreground truncate">{email}</div>
          </div>

          {/* On small screens, show initials only */}
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