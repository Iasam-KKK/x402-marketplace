"use client";

import { PaymentButton } from "@/components/PaymentButton";
import { WalletConnect } from "@/components/WalletConnect";
import { API_LISTINGS, getAPIById } from "@/lib/api-registry";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function APIDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const api = getAPIById(id);
    const [response, setResponse] = useState<unknown>(null);
    const [error, setError] = useState<string | null>(null);
    const [paramValues, setParamValues] = useState<Record<string, string>>({});

    if (!api) {
        notFound();
    }

    const handleSuccess = (data: unknown) => {
        setResponse(data);
        setError(null);
    };

    const handleError = (err: Error) => {
        setError(err.message);
        setResponse(null);
    };

    const updateParam = (name: string, value: string) => {
        setParamValues((prev) => ({ ...prev, [name]: value }));
    };

    // Get related APIs (same category, excluding current)
    const relatedAPIs = API_LISTINGS.filter(
        (a) => a.category === api.category && a.id !== api.id
    ).slice(0, 3);

    return (
        <div className="min-h-screen hero-gradient">
            {/* Header */}
            <header className="border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <span className="text-2xl">⚡</span>
                        <span className="text-xl font-bold gradient-text">x402 Market</span>
                    </Link>
                    <WalletConnect />
                </div>
            </header>

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-6 py-4">
                <nav className="flex items-center gap-2 text-sm text-gray-400">
                    <Link href="/" className="hover:text-white transition-colors">
                        Marketplace
                    </Link>
                    <span>/</span>
                    <span className="text-white">{api.name}</span>
                </nav>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - API Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <div className="glass-card p-8">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="text-5xl">{api.icon}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold text-white">{api.name}</h1>
                                        <span className="category-badge">{api.category}</span>
                                    </div>
                                    <p className="text-gray-400">{api.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-sm">
                                <div>
                                    <span className="text-gray-500">Method:</span>{" "}
                                    <span className="font-mono px-2 py-1 rounded bg-green-500/20 text-green-400">
                                        {api.method}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Endpoint:</span>{" "}
                                    <span className="font-mono text-purple-400">{api.endpoint}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Price:</span>{" "}
                                    <span className="price-tag">{api.price}</span>
                                </div>
                            </div>
                        </div>

                        {/* Parameters */}
                        {api.parameters && api.parameters.length > 0 && (
                            <div className="glass-card p-8">
                                <h2 className="text-xl font-semibold mb-4 text-white">
                                    Parameters
                                </h2>
                                <div className="space-y-4">
                                    {api.parameters.map((param) => (
                                        <div
                                            key={param.name}
                                            className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg bg-white/5"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-purple-400">
                                                        {param.name}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-400">
                                                        {param.type}
                                                    </span>
                                                    {param.required && (
                                                        <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                                                            required
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {param.description}
                                                </p>
                                            </div>
                                            <div className="md:w-48">
                                                <input
                                                    type="text"
                                                    placeholder={`Enter ${param.name}`}
                                                    value={paramValues[param.name] || ""}
                                                    onChange={(e) =>
                                                        updateParam(param.name, e.target.value)
                                                    }
                                                    className="input-field text-sm"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Example Response */}
                        {api.responseExample && (
                            <div className="glass-card p-8">
                                <h2 className="text-xl font-semibold mb-4 text-white">
                                    Example Response
                                </h2>
                                <div className="code-block">
                                    <pre className="text-green-400 text-sm overflow-x-auto">
                                        {JSON.stringify(api.responseExample, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Actual Response */}
                        {(response || error) && (
                            <div className="glass-card p-8">
                                <h2 className="text-xl font-semibold mb-4 text-white">
                                    {error ? "Error" : "API Response"}
                                </h2>
                                {error ? (
                                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                                        <p className="text-red-400">{error}</p>
                                    </div>
                                ) : (
                                    <div className="response-display">
                                        <pre className="text-green-400 text-sm overflow-x-auto">
                                            {JSON.stringify(response, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Payment CTA */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 sticky top-6 animate-border">
                            <div className="text-center mb-6">
                                <div className="text-4xl mb-2">{api.icon}</div>
                                <h3 className="text-xl font-bold text-white mb-1">
                                    {api.name}
                                </h3>
                                <div className="text-3xl font-bold gradient-text">
                                    {api.price}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">per request</p>
                            </div>

                            <div className="space-y-4 mb-6 text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <span className="text-green-400 text-xs">✓</span>
                                    </span>
                                    <span className="text-gray-400">Instant payment via x402</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <span className="text-green-400 text-xs">✓</span>
                                    </span>
                                    <span className="text-gray-400">No subscription required</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <span className="text-green-400 text-xs">✓</span>
                                    </span>
                                    <span className="text-gray-400">Pay only for what you use</span>
                                </div>
                            </div>

                            <PaymentButton
                                endpoint={api.endpoint}
                                method={api.method}
                                price={api.price}
                                params={paramValues}
                                requiredParams={
                                    api.parameters
                                        ?.filter((p) => p.required)
                                        .map((p) => p.name) || []
                                }
                                onSuccess={handleSuccess}
                                onError={handleError}
                            />

                            <p className="text-xs text-gray-500 text-center mt-4">
                                Payments processed on Base Sepolia
                            </p>
                        </div>

                        {/* Related APIs */}
                        {relatedAPIs.length > 0 && (
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-semibold mb-4 text-white">
                                    Related APIs
                                </h3>
                                <div className="space-y-3">
                                    {relatedAPIs.map((relatedApi) => (
                                        <Link
                                            key={relatedApi.id}
                                            href={`/api-detail/${relatedApi.id}`}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <span className="text-2xl">{relatedApi.icon}</span>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">
                                                    {relatedApi.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {relatedApi.price}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
