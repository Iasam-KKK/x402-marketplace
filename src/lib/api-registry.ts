// API Registry - Static list of available APIs in the marketplace

export interface APIListing {
    id: string;
    name: string;
    description: string;
    category: string;
    price: string; // Price in USD format, e.g., "$0.001"
    endpoint: string;
    method: "GET" | "POST";
    icon: string;
    parameters?: {
        name: string;
        type: string;
        required: boolean;
        description: string;
    }[];
    responseExample?: object;
}

export const API_LISTINGS: APIListing[] = [
    {
        id: "weather-api",
        name: "Weather API",
        description: "Get real-time weather data for any city worldwide. Returns temperature, humidity, wind speed, and weather conditions.",
        category: "Weather",
        price: "$0.001",
        endpoint: "/api/weather",
        method: "GET",
        icon: "🌤️",
        parameters: [
            {
                name: "city",
                type: "string",
                required: true,
                description: "City name (e.g., 'London', 'New York')"
            }
        ],
        responseExample: {
            city: "London",
            temperature: 15.2,
            humidity: 72,
            windSpeed: 12.5,
            description: "Partly cloudy",
            icon: "03d"
        }
    },
    {
        id: "exchange-rate-api",
        name: "Exchange Rate API",
        description: "Get real-time currency exchange rates. Convert between 150+ currencies with up-to-date rates.",
        category: "Finance",
        price: "$0.001",
        endpoint: "/api/exchange-rate",
        method: "GET",
        icon: "💱",
        parameters: [
            {
                name: "from",
                type: "string",
                required: true,
                description: "Source currency code (e.g., 'USD', 'EUR')"
            },
            {
                name: "to",
                type: "string",
                required: true,
                description: "Target currency code (e.g., 'GBP', 'JPY')"
            },
            {
                name: "amount",
                type: "number",
                required: false,
                description: "Amount to convert (default: 1)"
            }
        ],
        responseExample: {
            from: "USD",
            to: "EUR",
            rate: 0.92,
            amount: 100,
            result: 92.0,
            timestamp: "2026-01-23T15:00:00Z"
        }
    },
    {
        id: "joke-api",
        name: "Random Joke API",
        description: "Get random jokes for your applications. Perfect for chatbots, entertainment apps, and more.",
        category: "Entertainment",
        price: "$0.0005",
        endpoint: "/api/joke",
        method: "GET",
        icon: "😂",
        parameters: [],
        responseExample: {
            setup: "Why do programmers prefer dark mode?",
            punchline: "Because light attracts bugs!",
            category: "programming"
        }
    },
    {
        id: "uuid-api",
        name: "UUID Generator API",
        description: "Generate cryptographically secure UUIDs (v4). Perfect for distributed systems and unique identifiers.",
        category: "Utilities",
        price: "$0.0001",
        endpoint: "/api/uuid",
        method: "GET",
        icon: "🔑",
        parameters: [
            {
                name: "count",
                type: "number",
                required: false,
                description: "Number of UUIDs to generate (default: 1, max: 100)"
            }
        ],
        responseExample: {
            uuids: [
                "550e8400-e29b-41d4-a716-446655440000",
                "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
            ],
            count: 2
        }
    }
];

// Get API by ID
export function getAPIById(id: string): APIListing | undefined {
    return API_LISTINGS.find(api => api.id === id);
}

// Get APIs by category
export function getAPIsByCategory(category: string): APIListing[] {
    return API_LISTINGS.filter(api => api.category === category);
}

// Get all categories
export function getCategories(): string[] {
    return [...new Set(API_LISTINGS.map(api => api.category))];
}
