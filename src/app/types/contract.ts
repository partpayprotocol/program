import { PublicKey } from "@solana/web3.js";

export interface ContractArgs {
    wallet: { publicKey: PublicKey };
    buyerPubkey: PublicKey;
    vendorPda: PublicKey;
    equipmentPda: PublicKey;
    uniqueId: PublicKey;
    totalAmount: number;
    durationSeconds: number;
    installmentFrequency: number;
    deposit: number;
    insurancePremium?: number;
  }