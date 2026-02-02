import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const results = {
        ipv4_check: null as any,
        api_thirdweb: null as any,
        google: null as any,
        env_keys: !!process.env.THIRDWEB_SECRET_KEY,
    };

    try {
        const start = Date.now();
        const res = await fetch("https://api.thirdweb.com", {
            method: "HEAD",
            signal: AbortSignal.timeout(5000), // 5s timeout
        });
        results.api_thirdweb = {
            status: res.status,
            ok: res.ok,
            time: Date.now() - start,
        };
    } catch (error: any) {
        results.api_thirdweb = { error: error.message, code: error.code };
    }

    try {
        const start = Date.now();
        const res = await fetch("https://google.com", {
            method: "HEAD",
            signal: AbortSignal.timeout(5000),
        });
        results.google = {
            status: res.status,
            time: Date.now() - start,
        };
    } catch (error: any) {
        results.google = { error: error.message };
    }

    return Response.json(results);
}
