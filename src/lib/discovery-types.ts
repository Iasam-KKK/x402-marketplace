// x402 Bazaar Discovery Types
// These types define the metadata that makes your APIs discoverable by AI agents

export interface JSONSchema {
    type?: string;
    properties?: Record<string, {
        type: string;
        description?: string;
        enum?: string[];
        minimum?: number;
        maximum?: number;
    }>;
    required?: string[];
    additionalProperties?: boolean;
}

export interface DiscoveryInput {
    /** Example query parameters for GET/HEAD/DELETE */
    queryParams?: Record<string, string | number | boolean>;
    /** Example request body for POST/PUT/PATCH */
    body?: Record<string, unknown>;
    /** Body content type (required for POST/PUT/PATCH) */
    bodyType?: "json" | "form-data" | "text";
}

export interface DiscoveryOutput {
    /** Example response that the API returns */
    example: Record<string, unknown>;
    /** JSON Schema describing the response structure */
    schema?: JSONSchema;
}

export interface DiscoveryMetadata {
    /** HTTP method for this endpoint */
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";
    /** Example input with schema */
    input?: Record<string, unknown>;
    /** JSON Schema for input validation */
    inputSchema?: JSONSchema;
    /** Output example and schema */
    output?: DiscoveryOutput;
}

/**
 * Creates a Bazaar discovery extension object for the 402 response.
 * This metadata helps AI agents understand how to call your API.
 */
export function createBazaarExtension(metadata: DiscoveryMetadata): Record<string, unknown> {
    const isBodyMethod = metadata.method && ["POST", "PUT", "PATCH"].includes(metadata.method);

    const info: Record<string, unknown> = {
        input: {
            type: "http",
            ...(metadata.method ? { method: metadata.method } : {}),
            discoverable: true,
            ...(isBodyMethod && metadata.input
                ? { bodyType: "json", body: metadata.input }
                : metadata.input
                    ? { queryParams: metadata.input }
                    : {}),
        },
    };

    if (metadata.output?.example) {
        info.output = {
            type: "json",
            example: metadata.output.example,
        };
    }

    // Build JSON schema for the extension
    const schema: Record<string, unknown> = {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "object",
        properties: {
            input: {
                type: "object",
                properties: {
                    type: { type: "string", const: "http" },
                    method: { type: "string" },
                    discoverable: { type: "boolean" },
                    ...(isBodyMethod
                        ? {
                            bodyType: { type: "string", enum: ["json", "form-data", "text"] },
                            body: metadata.inputSchema || { type: "object" },
                        }
                        : metadata.inputSchema
                            ? { queryParams: { type: "object", ...metadata.inputSchema } }
                            : {}),
                },
                required: ["type"],
            },
            ...(metadata.output?.example
                ? {
                    output: {
                        type: "object",
                        properties: {
                            type: { type: "string" },
                            example: {
                                type: "object",
                                ...(metadata.output.schema || {}),
                            },
                        },
                        required: ["type"],
                    },
                }
                : {}),
        },
        required: ["input"],
    };

    return {
        bazaar: { info, schema },
    };
}
