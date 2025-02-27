import { PublicKey } from "@solana/web3.js";

export interface VendorArgs {
    wallet: { publicKey: PublicKey };
    name: string;
    uri: string;
    additionInfo: any
}