import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Web3Button } from "@/components/web3-button";

export function NavHeader() {
  const { user, logoutMutation } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
            NFTickets
          </a>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              {user.isArtist && (
                <Link href="/create-event">
                  <Button variant="outline">Create Event</Button>
                </Link>
              )}

              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>

              <Web3Button />

              <Button
                variant="ghost"
                onClick={() => logoutMutation.mutate()}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Web3Button />

              <Link href="/auth">
                <Button variant="outline">Login / Register</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}