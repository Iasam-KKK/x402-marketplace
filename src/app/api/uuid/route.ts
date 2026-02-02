import { NextRequest } from "next/server";
import {
    handleX402Payment,
    createPaymentErrorResponse,
    createSuccessResponse,
} from "@/lib/x402-middleware";
import { randomUUID } from "crypto";

export async function GET(request: NextRequest) {
    // Handle x402 payment - price in USDC (facilitator handles decimals)
    // $0.0001 per call
    const paymentResult = await handleX402Payment({
        request,
        price: "0.0001",
        description: "Generate cryptographically secure UUIDs",
        discoveryMetadata: {
            input: { count: "1" },
            inputSchema: {
                properties: {
                    count: { type: "number", description: "Number of UUIDs to generate (default: 1, max: 100)" }
                }
            },
            output: {
                example: {
                    uuids: [
                        "550e8400-e29b-41d4-a716-446655440000",
                        "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
                    ],
                    count: 2,
                    timestamp: "2026-01-01T12:00:00.000Z"
                },
                schema: {
                    properties: {
                        uuids: { type: "string", description: "Array of generated UUIDs" },
                        count: { type: "number", description: "Number of UUIDs generated" },
                        timestamp: { type: "string" }
                    },
                    required: ["uuids", "count"]
                }
            }
        }
    });

    if (!paymentResult.success) {
        return createPaymentErrorResponse(paymentResult);
    }

    // Get count from query params
    const searchParams = request.nextUrl.searchParams;
    const count = Math.min(
        Math.max(parseInt(searchParams.get("count") || "1", 10) || 1, 1),
        100
    );

    // Generate UUIDs
    const uuids: string[] = [];
    for (let i = 0; i < count; i++) {
        uuids.push(randomUUID());
    }

    const response = {
        uuids,
        count: uuids.length,
        timestamp: new Date().toISOString(),
    };

    return createSuccessResponse(response, paymentResult.responseHeaders);
}
