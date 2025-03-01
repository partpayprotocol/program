import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export interface VendorArgs {
    publicKey: PublicKey;
    metadata: {
        name: string;
        image?: string;
        description?: string
    }
}