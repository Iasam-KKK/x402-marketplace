"use client";

import { ConnectButton } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { sepolia } from "thirdweb/chains";

const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

export function WalletConnect() {
    return (
        <ConnectButton
            client={client}
            chain={sepolia}
            connectButton={{
                label: "Connect Wallet",
                className: "btn-primary !py-3 !px-6",
            }}
            theme="dark"
        />
    );
}
