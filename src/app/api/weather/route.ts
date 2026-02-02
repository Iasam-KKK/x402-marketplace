import { NextRequest } from "next/server";
import {
    handleX402Payment,
    createPaymentErrorResponse,
    createSuccessResponse,
} from "@/lib/x402-middleware";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export async function GET(request: NextRequest) {
    // Handle x402 payment - price in USDC (facilitator handles decimals)
    // $0.001 per call
    const paymentResult = await handleX402Payment({
        request,
        price: "0.001",
        description: "Get real-time weather data for any city worldwide",
        discoveryMetadata: {
            input: { city: "London" },
            inputSchema: {
                properties: {
                    city: { type: "string", description: "City name (e.g., 'London', 'New York')" }
                },
                required: ["city"]
            },
            output: {
                example: {
                    city: "London",
                    country: "GB",
                    temperature: 15.2,
                    feelsLike: 14.5,
                    humidity: 72,
                    windSpeed: 12.5,
                    description: "partly cloudy",
                    icon: "03d",
                    timestamp: "2026-01-01T12:00:00.000Z"
                },
                schema: {
                    properties: {
                        city: { type: "string" },
                        country: { type: "string" },
                        temperature: { type: "number", description: "Temperature in Celsius" },
                        feelsLike: { type: "number" },
                        humidity: { type: "number", description: "Humidity percentage" },
                        windSpeed: { type: "number", description: "Wind speed in m/s" },
                        description: { type: "string" },
                        icon: { type: "string" },
                        timestamp: { type: "string" }
                    },
                    required: ["city", "temperature", "humidity"]
                }
            }
        }
    });

    if (!paymentResult.success) {
        return createPaymentErrorResponse(paymentResult);
    }

    // Get city from query params
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city");

    if (!city) {
        return Response.json(
            { error: "Missing required parameter: city" },
            { status: 400 }
        );
    }

    try {
        // Fetch from OpenWeather API
        const weatherResponse = await fetch(
            `${OPENWEATHER_BASE_URL}?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        if (!weatherResponse.ok) {
            const errorData = await weatherResponse.json();
            return Response.json(
                { error: errorData.message || "Failed to fetch weather data" },
                { status: weatherResponse.status }
            );
        }

        const weatherData = await weatherResponse.json();

        // Format response
        const formattedResponse = {
            city: weatherData.name,
            country: weatherData.sys.country,
            temperature: weatherData.main.temp,
            feelsLike: weatherData.main.feels_like,
            humidity: weatherData.main.humidity,
            windSpeed: weatherData.wind.speed,
            description: weatherData.weather[0].description,
            icon: weatherData.weather[0].icon,
            timestamp: new Date().toISOString(),
        };

        return createSuccessResponse(formattedResponse, paymentResult.responseHeaders);
    } catch (error) {
        console.error("Weather API error:", error);
        return Response.json(
            { error: "Failed to fetch weather data" },
            { status: 500 }
        );
    }
}
