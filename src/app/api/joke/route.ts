import { NextRequest } from "next/server";
import {
    handleX402Payment,
    createPaymentErrorResponse,
    createSuccessResponse,
} from "@/lib/x402-middleware";

// Collection of programming and general jokes
const jokes = [
    { setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs!", category: "programming" },
    { setup: "Why did the developer go broke?", punchline: "Because he used up all his cache!", category: "programming" },
    { setup: "Why do Java developers wear glasses?", punchline: "Because they don't C#!", category: "programming" },
    { setup: "What's a programmer's favorite hangout place?", punchline: "Foo Bar!", category: "programming" },
    { setup: "Why was the JavaScript developer sad?", punchline: "Because he didn't Node how to Express himself!", category: "programming" },
    { setup: "What do you call 8 hobbits?", punchline: "A hobbyte!", category: "programming" },
    { setup: "Why did the blockchain developer break up?", punchline: "There was no connection!", category: "web3" },
    { setup: "Why are crypto investors always calm?", punchline: "Because they're used to HODLing!", category: "web3" },
    { setup: "What did the Bitcoin say to the bank?", punchline: "I'm going to disrupt you!", category: "web3" },
    { setup: "Why did the API feel lonely?", punchline: "It had no endpoints to connect to!", category: "programming" },
];

export async function GET(request: NextRequest) {
    // Handle x402 payment - price in USDC (facilitator handles decimals)
    // $0.0005 per call
    const paymentResult = await handleX402Payment({
        request,
        price: "0.0005",
        description: "Get a random joke",
        discoveryMetadata: {
            // No input required for this API
            output: {
                example: {
                    setup: "Why do programmers prefer dark mode?",
                    punchline: "Because light attracts bugs!",
                    category: "programming",
                    timestamp: "2026-01-01T12:00:00.000Z"
                },
                schema: {
                    properties: {
                        setup: { type: "string", description: "The joke setup/question" },
                        punchline: { type: "string", description: "The joke punchline/answer" },
                        category: { type: "string", description: "Joke category (programming, web3)" },
                        timestamp: { type: "string" }
                    },
                    required: ["setup", "punchline", "category"]
                }
            }
        }
    });

    if (!paymentResult.success) {
        return createPaymentErrorResponse(paymentResult);
    }

    // Get random joke
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

    const response = {
        ...randomJoke,
        timestamp: new Date().toISOString(),
    };

    return createSuccessResponse(response, paymentResult.responseHeaders);
}
