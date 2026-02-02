
const fs = require('fs');

async function listResources() {
    const url = 'https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources';

    console.log(`Fetching resources from ${url}...`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'x402-marketplace/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        processData(data);

    } catch (error) {
        console.error('Error fetching resources:', error.message);
    }
}

function processData(data) {
    // Verify structure
    let resources = [];
    if (Array.isArray(data)) {
        console.log("Response is an array.");
        resources = data;
    } else {
        // console.log("Response is an object with keys:", Object.keys(data));
        if (data.resources && Array.isArray(data.resources)) {
            resources = data.resources;
        } else if (data.data && Array.isArray(data.data)) {
            resources = data.data;
        } else if (data.items && Array.isArray(data.items)) {
            resources = data.items;
        } else {
            console.log("Could not find array of resources.");
            return;
        }
    }

    console.log(`\nFound ${resources.length} resources. Showing first 10:\n`);

    // Slice to avoid spamming terminal
    const displayResources = resources.slice(0, 10);

    // if (resources.length > 0) {
    //     console.log("Sample resource structure:", JSON.stringify(resources[0], null, 2));
    // }

    displayResources.forEach((res, index) => {
        const id = res.id || res.resourceId || 'N/A';

        let url = 'N/A';
        if (typeof res.resource === 'string') {
            url = res.resource;
        } else if (res.resource && res.resource.url) {
            url = res.resource.url;
        }

        // Name might be description or title
        let name = res.name || res.title || res.metadata?.name || 'N/A';
        // If no name, check description in accepts
        if (name === 'N/A' && res.accepts && res.accepts.length > 0) {
            name = res.accepts[0].description || res.accepts[0].name || name;
        }

        console.log(`${index + 1}. [${name}]`);
        console.log(`   URL: ${url}`);

        // Check for Bazaar metadata
        let hasBazaar = false;
        let hasOutputSchema = false;
        if (res.extensions?.bazaar) hasBazaar = true;

        if (res.accepts) {
            res.accepts.forEach(acc => {
                if (acc.extensions?.bazaar) hasBazaar = true;
                if (acc.outputSchema) hasOutputSchema = true;
            });
        }

        console.log(`   Has Bazaar Metadata: ${hasBazaar ? 'YES' : 'NO'}`);
        if (hasOutputSchema) console.log(`   (Has Output Schema)`);
        console.log('-');
    });
}

listResources();
