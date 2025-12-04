import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { type Account, type Chain, type Client, type Transport } from 'viem';
import { type Config, getConnectorClient } from '@wagmi/core';

export function clientToSigner(client: Client<Transport, Chain, Account>) {
    const { account, chain, transport } = client;
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    };
    const provider = new BrowserProvider(transport, network);
    const signer = new JsonRpcSigner(provider, account.address);
    return signer;
}

export function clientToProvider(client: Client<Transport, Chain>) {
    const { chain, transport } = client;
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    };
    if (transport.type === 'fallback') {
        return new BrowserProvider(transport, network);
    }
    return new BrowserProvider(transport, network);
}
