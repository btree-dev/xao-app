import { createContext, useContext, ReactNode, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

type Web3ContextType = {
  connect: () => Promise<void>;
  disconnect: () => void;
  mintTicket: (eventId: number, tokenId: number) => Promise<void>;
  isConnected: boolean;
  address: string | null;
};

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const connectMutation = useMutation({
    mutationFn: async () => {
      try {
        const wallet = new CoinbaseWalletSDK({
          appName: 'NFTickets',
        });

        const baseChainConfig = {
          chainId: 8453, // Base chain
          chainName: 'Base',
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://mainnet.base.org'],
          blockExplorerUrls: ['https://basescan.org'],
        };

        const ethereum = wallet.makeWeb3Provider(baseChainConfig.rpcUrls[0], baseChainConfig.chainId);

        // Request account access
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];

        // Switch to Base chain
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${baseChainConfig.chainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          // Chain hasn't been added yet
          if (switchError.code === 4902) {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [baseChainConfig],
            });
          } else {
            throw switchError;
          }
        }

        await apiRequest('POST', '/api/user/wallet', { walletAddress: address });
        setAddress(address);
        setIsConnected(true);
      } catch (error: any) {
        toast({
          title: 'Connection failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Connection failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
  };

  const mintTicket = async (eventId: number, tokenId: number) => {
    if (!isConnected) throw new Error('Wallet not connected');
    // TODO: Implement NFT minting logic using OnchainKit
    throw new Error('Not implemented');
  };

  return (
    <Web3Context.Provider
      value={{
        connect: connectMutation.mutateAsync,
        disconnect,
        mintTicket,
        isConnected,
        address,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}