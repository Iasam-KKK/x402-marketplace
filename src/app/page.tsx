"use client";

import { APICard } from "@/components/APICard";
import { WalletConnect } from "@/components/WalletConnect";
import { API_LISTINGS, getCategories } from "@/lib/api-registry";
import { useState } from "react";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = getCategories();

  const filteredAPIs = selectedCategory
    ? API_LISTINGS.filter((api) => api.category === selectedCategory)
    : API_LISTINGS;

  return (
    <div className="min-h-screen hero-gradient">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold gradient-text">x402 Market</span>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
          <span className="text-sm text-gray-400">Powered by</span>
          <span className="text-sm font-semibold text-white">x402 Protocol</span>
          <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
            Base Sepolia
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="text-white">Pay-Per-Use</span>{" "}
          <span className="gradient-text">API Marketplace</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Access powerful APIs instantly with micropayments. No subscriptions,
          no accounts—just connect your wallet and pay per request.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            {API_LISTINGS.length} APIs Available
          </div>
          <div className="text-gray-600">•</div>
          <div className="text-sm text-gray-500">
            Starting from $0.0001 per request
          </div>
          <div className="text-gray-600">•</div>
          <div className="text-sm text-gray-500">Instant Settlement</div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === null
                ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
          >
            All APIs
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* API Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAPIs.map((api) => (
            <APICard key={api.id} api={api} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="gradient-text">How It Works</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">1. Connect Wallet</h3>
              <p className="text-gray-400 text-sm">
                Connect your crypto wallet with USDC on Base Sepolia
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">2. Pay Per Request</h3>
              <p className="text-gray-400 text-sm">
                Sign a payment for the exact API call you need
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">3. Get Response</h3>
              <p className="text-gray-400 text-sm">
                Receive instant API response after payment settles
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>
            Built with{" "}
            <span className="text-purple-400">x402 Protocol</span> &{" "}
            <span className="text-cyan-400">Thirdweb SDK</span>
          </p>
          <p className="mt-2">
            Testing on Base Sepolia • Payments in USDC
          </p>
        </div>
      </footer>
    </div>
  );
}
