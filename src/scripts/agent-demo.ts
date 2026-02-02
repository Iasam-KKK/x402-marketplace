import { createThirdwebClient } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Configuration
const RPC_URL = "https://base-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY_OR_PUBLIC_RPC"; // Or use thirdweb default
const TARGET_URL = "https://x402-marketplace-production-5b9d.up.railway.app/api/weather?city=London";

// 1. Setup "Agent" Wallet
// In a real scenario, the agent has its own wallet with funds.
// We'll check for a key or generate one.

const CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
if (!CLIENT_ID) {
    console.error("Missing NEXT_PUBLIC_THIRDWEB_CLIENT_ID env var");
    process.exit(1);
}

const client = createThirdwebClient({
    clientId: CLIENT_ID,
});

async function runAgent() {
    console.log(" AI Agent Starting...");
    console.log(`Target: ${TARGET_URL} `);

    // 2. Discover (Get 402)
    console.log("\n1️  Discovering API...");
    const initialRes = await fetch(TARGET_URL);
    console.log(`Initial Status: ${initialRes.status} ${initialRes.statusText} `);

    if (initialRes.status !== 402) {
        console.log("✅ No payment required! (Or error)");
        console.log(await initialRes.text());
        return;
    }

    const paymentHeader = initialRes.headers.get("payment-required");
    if (!paymentHeader) {
        console.error(" 402 received but no payment-required header found.");
        return;
    }

    // 3. Analyze Discovery Metadata
    console.log("\n2️⃣  Analyzing Payment Requirements...");
    const paymentReq = JSON.parse(Buffer.from(paymentHeader, "base64").toString("utf-8"));

    // Log "Agent Reasoning" based on discovery metadata
    if (paymentReq.extensions?.bazaar) {
        const bazaar = paymentReq.extensions.bazaar;
        console.log(" I found Bazaar Metadata!");
        console.log(`   Category: ${bazaar.category} `);
        console.log(`   Tags: ${bazaar.tags?.join(", ")} `);
        console.log(`   Input Schema: ${JSON.stringify(bazaar.info?.input?.queryParams || bazaar.info?.input?.body)} `);
        console.log("   I understand how to call this API.");
    } else {
        console.log(" No Bazaar discovery metadata found. I might get stuck.");
    }

    // 4. Pay
    const privateKey = process.env.AGENT_PRIVATE_KEY;
    if (!privateKey) {
        console.log("\n No AGENT_PRIVATE_KEY found in environment.");
        console.log("To run the payment, I need a wallet with Base Sepolia USDC.");
        console.log("Please add AGENT_PRIVATE_KEY to your .env.local file.");
        return;
    }

    console.log("\nInitiating Payment...");
    const account = privateKeyToAccount({
        client,
        privateKey,
    });

    console.log(`   Agent Wallet: ${account.address} `);

    try {
        // Find the correct "accepts" option - usually the first one or matching network
        // For simulation we just pick the first valid one
        const networkId = paymentReq.accepts[0].network;
        // networkId is like "eip155:84532" -> chainId 84532
        const chainId = parseInt(networkId.split(":")[1]);
        console.log(`   Paying on chainId: ${chainId} `);

        const tokenAddress = paymentReq.accepts[0].asset;
        const amount = paymentReq.accepts[0].maxAmountRequired; // This is in wei/units
        console.log(`   Amount: ${amount} units of ${tokenAddress} `);

        // Define the EIP-712 Domain
        const domain = {
            name: "USD Coin",
            version: "2",
            chainId: chainId,
            verifyingContract: tokenAddress,
        } as const;

        // Define the Types for TransferWithAuthorization (standard USDC permit)
        // Or whatever x402 v2 expects. Usually it's TransferWithAuthorization.
        const types = {
            TransferWithAuthorization: [
                { name: "from", type: "address" },
                { name: "to", type: "address" },
                { name: "value", type: "uint256" },
                { name: "validAfter", type: "uint256" },
                { name: "validBefore", type: "uint256" },
                { name: "nonce", type: "bytes32" },
            ],
        } as const;

        // Construct the message
        // validBefore = now + 1 hour
        const validAfter = BigInt(0);
        const validBefore = BigInt(Math.floor(Date.now() / 1000) + 3600);
        // Random nonce
        const nonce = ("0x" + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, "0")).join("")) as `0x${string} `;

        const message = {
            from: account.address,
            to: paymentReq.accepts[0].payTo, // The recipient
            value: BigInt(amount),
            validAfter,
            validBefore,
            nonce,
        };

        console.log("   Signing payment...");

        // Sign using Thirdweb account
        const signature = await account.signTypedData({
            domain,
            types,
            primaryType: "TransferWithAuthorization",
            message,
        });

        console.log("   Signature generated!");

        // 5. Send Payment
        console.log("\n  Accessing API with Payment...");

        // Construct the X-Payment header
        // It's usually the full signed object or just the signature depending on implementation.
        // For x402 v2 it is typically a base64 encoded JSON of the "proof".

        const paymentProof = {
            ...message,
            value: message.value.toString(),
            validAfter: message.validAfter.toString(),
            validBefore: message.validBefore.toString(),
            signature,
            chainId: chainId,
            tokenAddress,
        };

        const paymentHeaderValue = Buffer.from(JSON.stringify(paymentProof)).toString("base64");

        const paidRes = await fetch(TARGET_URL, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${paymentHeaderValue} `, // Some use Authorization, others custom header
                "X-Payment": paymentHeaderValue, // We used X-Payment or PAYMENT-SIGNATURE in middleware
                "Payment-Signature": paymentHeaderValue
            }
        });

        console.log(`FINAL STATUS: ${paidRes.status} `);
        if (paidRes.ok) {
            console.log(" SUCCESS! API access granted.");
            console.log("Response:", await paidRes.json());
            console.log("\n This transaction should now trigger the Bazaar indexer!");
        } else {
            console.log(" Payment rejected.");
            console.log(await paidRes.text());
        }

    } catch (e) {
        console.error("   Payment failed:", e);
        console.log("\nDebug Hint: Make sure your wallet has Base Sepolia ETH (for gas? no gas needed for sig) and USDC.");
    }
}

runAgent();
