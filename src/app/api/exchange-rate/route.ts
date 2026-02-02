import { NextRequest } from "next/server";
import {
    handleX402Payment,
    createPaymentErrorResponse,
    createSuccessResponse,
} from "@/lib/x402-middleware";

const EXCHANGERATE_API_KEY = process.env.EXCHANGERATE_API_KEY;
const EXCHANGERATE_BASE_URL = "https://v6.exchangerate-api.com/v6";

export async function GET(request: NextRequest) {
    // Handle x402 payment - price in USDC (facilitator handles decimals)
    // $0.001 per call
    const paymentResult = await handleX402Payment({
        request,
        price: "0.001",
        description: "Get real-time currency exchange rates",
        discoveryMetadata: {
            category: "finance",
            tags: ["finance", "exchange-rate", "currency", "forex"],
            input: { from: "USD", to: "EUR", amount: "100" },
            inputSchema: {
                properties: {
                    from: { type: "string", description: "Source currency code (e.g., 'USD', 'EUR')" },
                    to: { type: "string", description: "Target currency code (e.g., 'GBP', 'JPY')" },
                    amount: { type: "number", description: "Amount to convert (default: 1)" }
                },
                required: ["from", "to"]
            },
            output: {
                example: {
                    from: "USD",
                    to: "EUR",
                    rate: 0.92,
                    amount: 100,
                    result: 92.0,
                    timestamp: "2026-01-01T12:00:00.000Z"
                },
                schema: {
                    properties: {
                        from: { type: "string" },
                        to: { type: "string" },
                        rate: { type: "number", description: "Exchange rate" },
                        amount: { type: "number" },
                        result: { type: "number", description: "Converted amount" },
                        timestamp: { type: "string" }
                    },
                    required: ["from", "to", "rate", "result"]
                }
            }
        }
    });

    if (!paymentResult.success) {
        return createPaymentErrorResponse(paymentResult);
    }

    // Get parameters from query
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get("from")?.toUpperCase();
    const to = searchParams.get("to")?.toUpperCase();
    const amount = parseFloat(searchParams.get("amount") || "1");

    if (!from || !to) {
        return Response.json(
            { error: "Missing required parameters: from and to currency codes" },
            { status: 400 }
        );
    }

    try {
        // Fetch from ExchangeRate API
        const rateResponse = await fetch(
            `${EXCHANGERATE_BASE_URL}/${EXCHANGERATE_API_KEY}/pair/${from}/${to}`
        );

        if (!rateResponse.ok) {
            return Response.json(
                { error: "Failed to fetch exchange rate data" },
                { status: rateResponse.status }
            );
        }

        const rateData = await rateResponse.json();

        if (rateData.result !== "success") {
            return Response.json(
                { error: rateData["error-type"] || "Failed to fetch exchange rate" },
                { status: 400 }
            );
        }

        // Format response
        const formattedResponse = {
            from,
            to,
            rate: rateData.conversion_rate,
            amount,
            result: amount * rateData.conversion_rate,
            timestamp: new Date().toISOString(),
        };

        return createSuccessResponse(formattedResponse, paymentResult.responseHeaders);
    } catch (error) {
        console.error("Exchange Rate API error:", error);
        return Response.json(
            { error: "Failed to fetch exchange rate data" },
            { status: 500 }
        );
    }
}
