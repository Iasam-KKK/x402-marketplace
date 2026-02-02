import { settlePayment } from "thirdweb/x402";
import { thirdwebFacilitator, X402_CONFIG } from "./thirdweb";
import { DiscoveryMetadata, createBazaarExtension } from "./discovery-types";

interface SettlePaymentOptions {
    request: Request;
    price: string;
    description: string;
    /** Optional discovery metadata for Bazaar integration */
    discoveryMetadata?: DiscoveryMetadata;
}

interface PaymentResult {
    success: boolean;
    status: number;
    responseHeaders?: Record<string, string>;
    responseBody?: object;
}

/**
 * Handles x402 payment verification and settlement for API endpoints.
 * Returns a PaymentResult indicating if payment was successful or if 402 is required.
 */
export async function handleX402Payment({
    request,
    price,
    description,
    discoveryMetadata,
}: SettlePaymentOptions): Promise<PaymentResult> {
    // Get payment data from headers
    const paymentData =
        request.headers.get("PAYMENT-SIGNATURE") ||
        request.headers.get("X-PAYMENT");

    // Construct the resource URL correctly, respecting proxies (Railway)
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") || "https";
    // request.url in Next.js middleware/api is usually the full URL but might be internal
    // We rebuild it to be sure it matches the public URL
    const pathname = new URL(request.url).pathname;
    const search = new URL(request.url).search;
    const resourceUrl = `${proto}://${host}${pathname}${search}`;

    // Debug log
    console.log(`Processing x402 for resource: ${resourceUrl}`);

    const method = request.method.toUpperCase() as "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

    try {
        // Call settlePayment to verify x402 payment
        const result = await settlePayment({
            resourceUrl,
            method,
            paymentData,
            payTo: X402_CONFIG.payTo,
            network: X402_CONFIG.network,
            price,
            facilitator: thirdwebFacilitator,
            routeConfig: {
                description,
                mimeType: "application/json",
                maxTimeoutSeconds: 60 * 60, // 1 hour signature expiration
                // Note: Cannot specify asset - facilitator determines payment method (USDC on Base Sepolia)
            },
        });

        if (result.status === 200) {
            return {
                success: true,
                status: 200,
                responseHeaders: result.responseHeaders,
            };
        } else {
            // If we have discovery metadata, inject it into the payment-required response
            let enhancedHeaders = result.responseHeaders;
            let enhancedBody = result.responseBody;

            // Find the payment-required header (case-insensitive)
            const headerKey = result.responseHeaders
                ? Object.keys(result.responseHeaders).find(k => k.toLowerCase() === "payment-required")
                : null;

            if (discoveryMetadata && headerKey && result.responseHeaders) {
                try {
                    // Decode the existing payment-required header
                    const paymentRequiredBase64 = result.responseHeaders[headerKey];
                    const paymentRequired = JSON.parse(
                        Buffer.from(paymentRequiredBase64, "base64").toString("utf-8")
                    );

                    // Add bazaar extension with method from request
                    const bazaarExtension = createBazaarExtension({
                        ...discoveryMetadata,
                        method,
                    });

                    // Inject extensions into the accepts array
                    if (paymentRequired.accepts && Array.isArray(paymentRequired.accepts)) {
                        paymentRequired.accepts = paymentRequired.accepts.map((accept: Record<string, unknown>) => ({
                            ...accept,
                            extensions: {
                                ...(accept.extensions as Record<string, unknown> || {}),
                                ...bazaarExtension,
                            },
                        }));
                    }

                    // Add top-level extensions
                    paymentRequired.extensions = {
                        ...(paymentRequired.extensions || {}),
                        ...bazaarExtension,
                    };

                    // Re-encode the header
                    const enhancedPaymentRequired = Buffer.from(
                        JSON.stringify(paymentRequired)
                    ).toString("base64");

                    // Create new headers object, replacing the original header with the enhanced one
                    const newHeaders: Record<string, string> = {};
                    for (const [key, value] of Object.entries(result.responseHeaders!)) {
                        if (key.toLowerCase() === "payment-required") {
                            // Replace with our enhanced version
                            newHeaders[key] = enhancedPaymentRequired;
                        } else {
                            newHeaders[key] = value;
                        }
                    }
                    enhancedHeaders = newHeaders;
                    enhancedBody = paymentRequired;

                    console.log("x402 payment required with Bazaar discovery metadata injected");
                } catch (e) {
                    console.error("Failed to inject bazaar extension:", e);
                    // Fall back to original response
                }
            }

            console.log("x402 payment required. Headers:", JSON.stringify(enhancedHeaders, null, 2));

            return {
                success: false,
                status: result.status,
                responseHeaders: enhancedHeaders,
                responseBody: enhancedBody,
            };
        }
    } catch (error) {
        console.error("x402 payment error:", error);

        // Return 500 error if payment processing fails
        return {
            success: false,
            status: 500,
            responseBody: { error: "Payment processing failed" },
        };
    }
}

/**
 * Creates an appropriate error response based on the payment result status.
 * Use this when paymentResult.success is false.
 */
export function createPaymentErrorResponse(result: PaymentResult): Response {
    return Response.json(result.responseBody || { error: "Payment processing failed" }, {
        status: result.status,
        headers: result.responseHeaders || {},
    });
}

/**
 * Creates a 402 Payment Required response (Wrapped by createPaymentErrorResponse usually)
 */
export function create402Response(
    responseBody: object,
    responseHeaders: Record<string, string>
): Response {
    return Response.json(responseBody, {
        status: 402,
        headers: responseHeaders,
    });
}

/**
 * Creates a successful response with payment receipt headers
 */
export function createSuccessResponse(
    data: object,
    paymentHeaders?: Record<string, string>
): Response {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...paymentHeaders,
    };

    return Response.json(data, {
        status: 200,
        headers,
    });
}
