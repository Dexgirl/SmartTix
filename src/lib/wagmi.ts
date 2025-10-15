import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Chain } from 'wagmi/chains';

export const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: [process.env.NEXT_PUBLIC_RPC_URL!] } },
} as const satisfies Chain;

export const config = createConfig({
  chains: [monadTestnet],
  connectors: [injected()],
  transports: { [monadTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL!) },
});