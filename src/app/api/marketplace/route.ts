import { NextRequest } from "next/server";
import { API_LISTINGS, getCategories } from "@/lib/api-registry";

// Public endpoint - no payment required
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");

    let apis = API_LISTINGS;

    // Filter by category if provided
    if (category) {
        apis = apis.filter(
            (api) => api.category.toLowerCase() === category.toLowerCase()
        );
    }

    return Response.json({
        apis,
        categories: getCategories(),
        total: apis.length,
    });
}
