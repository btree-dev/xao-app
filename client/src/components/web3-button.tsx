import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/hooks/use-web3";
import { Loader2, Wallet } from "lucide-react";

export function Web3Button() {
  const { connect, disconnect, isConnected, address } = useWeb3();

  if (isConnected && address) {
    return (
      <Button
        variant="outline"
        onClick={() => disconnect()}
        className="flex gap-2 items-center"
      >
        <Wallet className="h-4 w-4" />
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    );
  }

  return (
    <Button
      onClick={() => connect()}
      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
    >
      <Wallet className="h-4 w-4 mr-2" />
      Connect Wallet
    </Button>
  );
}
