"use client";

import { useFetchWithPayment } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { useState } from "react";

const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

interface PaymentButtonProps {
    endpoint: string;
    method: "GET" | "POST";
    price: string;
    params?: Record<string, string>;
    requiredParams?: string[];
    onSuccess?: (data: unknown) => void;
    onError?: (error: Error) => void;
}

export function PaymentButton({
    endpoint,
    method,
    price,
    params,
    requiredParams = [],
    onSuccess,
    onError,
}: PaymentButtonProps) {
    const { fetchWithPayment, isPending } = useFetchWithPayment(client);
    const [isLoading, setIsLoading] = useState(false);

    // Check if all required parameters are filled
    const missingParams = requiredParams.filter(
        (param) => !params?.[param] || params[param].trim() === ""
    );
    const hasAllRequiredParams = missingParams.length === 0;

    const handleClick = async () => {
        // Validate required parameters before making payment
        if (!hasAllRequiredParams) {
            onError?.(
                new Error(
                    `Missing required parameters: ${missingParams.join(", ")}`
                )
            );
            return;
        }

        setIsLoading(true);
        try {
            // Build URL with query params
            let url = endpoint;
            if (params && Object.keys(params).length > 0) {
                const searchParams = new URLSearchParams(params);
                url = `${endpoint}?${searchParams.toString()}`;
            }

            const data = await fetchWithPayment(url, {
                method,
            });

            onSuccess?.(data);
        } catch (error) {
            console.error("Payment/API error:", error);
            onError?.(error as Error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <button
                onClick={handleClick}
                disabled={isPending || isLoading || !hasAllRequiredParams}
                className="btn-primary flex items-center justify-center gap-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                    !hasAllRequiredParams
                        ? `Please fill required parameters: ${missingParams.join(", ")}`
                        : undefined
                }
            >
                {isPending || isLoading ? (
                    <>
                        <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Processing...
                    </>
                ) : (
                    <>
                        <span>⚡</span>
                        Pay {price} & Use API
                    </>
                )}
            </button>
            {!hasAllRequiredParams && missingParams.length > 0 && (
                <p className="text-xs text-yellow-400 mt-2 text-center">
                    ⚠️ Please fill: {missingParams.join(", ")}
                </p>
            )}
        </div>
    );
}
