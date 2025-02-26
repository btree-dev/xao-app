import { createContext, useContext, ReactNode, useState, useRef } from 'react';
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
  const providerRef = useRef<any>(null);

  const connectMutation = useMutation({
    mutationFn: async () => {
      try {
        const wallet = new CoinbaseWalletSDK({
          appName: 'NFTickets',
          appLogoUrl: '/icon-192.png',
        });

        // Create provider
        const provider = wallet.makeWeb3Provider('https://mainnet.base.org', 8453);
        providerRef.current = provider;

        // Request account access
        try {
          const accounts = await provider.request({ method: 'eth_requestAccounts' });

          // If user cancelled, accounts will be null or empty
          if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
            return; // Exit silently on user cancellation
          }

          const address = accounts[0];

          // Add Base chain
          try {
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x2105' }], // 8453 in hex
            });
          } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x2105', // 8453 in hex
                  chainName: 'Base',
                  nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://mainnet.base.org'],
                  blockExplorerUrls: ['https://basescan.org']
                }]
              });
            } else {
              throw switchError;
            }
          }

          await apiRequest('POST', '/api/user/wallet', { walletAddress: address });
          setAddress(address);
          setIsConnected(true);
        } catch (error: any) {
          // Check for user rejection
          if (error.code === 4001) {
            return; // User rejected the request, exit silently
          }
          throw error;
        }
      } catch (error: any) {
        // Only show error toast for non-user-rejection errors
        if (error.code !== 4001) {
          toast({
            title: 'Connection failed',
            description: error.message || 'Could not initialize wallet connection',
            variant: 'destructive',
          });
        }
        throw error;
      }
    },
  });

  const disconnect = () => {
    if (providerRef.current) {
      providerRef.current = null;
    }
    setIsConnected(false);
    setAddress(null);
  };

  const mintTicket = async (eventId: number, tokenId: number) => {
    if (!isConnected || !providerRef.current) {
      throw new Error('Wallet not connected');
    }
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