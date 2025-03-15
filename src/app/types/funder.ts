import { PublicKey } from "@solana/web3.js";

export interface FunderArgs {
    wallet: { publicKey: PublicKey },
    equipmentPda: PublicKey,
    vendorPda: PublicKey,
    reciever: PublicKey,
    quantity: number,
    price: number,
    minimumDeposit?: number,
    funderPrice?: number,
    durationSeconds?: number
    uniqueId: PublicKey
}