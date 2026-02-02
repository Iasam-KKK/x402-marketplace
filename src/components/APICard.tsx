"use client";

import { APIListing } from "@/lib/api-registry";
import Link from "next/link";

interface APICardProps {
    api: APIListing;
}

export function APICard({ api }: APICardProps) {
    return (
        <Link href={`/api-detail/${api.id}`}>
            <div className="glass-card p-6 h-full cursor-pointer group">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{api.icon}</div>
                    <span className="price-tag">{api.price}</span>
                </div>

                {/* Title & Category */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 transition-all">
                    {api.name}
                </h3>
                <span className="category-badge mb-3 inline-block">{api.category}</span>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                    {api.description}
                </p>

                {/* Method Badge */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-2 py-1 rounded bg-green-500/20 text-green-400">
                        {api.method}
                    </span>
                    <span className="text-xs text-gray-500">
                        {api.parameters?.length || 0} params
                    </span>
                </div>
            </div>
        </Link>
    );
}
