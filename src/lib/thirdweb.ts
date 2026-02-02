import { createThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { facilitator } from "thirdweb/x402";
import { setGlobalDispatcher, Agent } from "undici";

// Patch: Fix for Node.js fetch connectivity issues (ConnectTimeoutError)
setGlobalDispatcher(new Agent({
    connect: { timeout: 30_000 },
    headersTimeout: 30_000,
    bodyTimeout: 30_000,
    keepAliveTimeout: 30_000,
}));

// Server-side client (for API routes)
export const serverClient = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY!,
});

// Client-side client (for browser)
export const clientSideClient = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

// x402 Configuration
export const X402_CONFIG = {
    network: baseSepolia,
    payTo: process.env.PAYMENT_RECIPIENT || process.env.SERVER_WALLET_ADDRESS!,
    serverWalletAddress: process.env.SERVER_WALLET_ADDRESS!,
};

// Validation logging
console.log("=== Thirdweb x402 Configuration ===");
console.log("Network:", X402_CONFIG.network.name || "Base Sepolia");
console.log("PayTo Address:", X402_CONFIG.payTo);
console.log("Server Wallet Address:", X402_CONFIG.serverWalletAddress);
console.log("Secret Key present:", !!process.env.THIRDWEB_SECRET_KEY);
console.log("===================================");

// Thirdweb x402 Facilitator
export const thirdwebFacilitator = facilitator({
    client: serverClient,
    serverWalletAddress: X402_CONFIG.serverWalletAddress,
});
