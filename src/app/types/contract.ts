import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor"

export interface ContractArgs {
  wallet: { publicKey: PublicKey };
  buyerPubkey: PublicKey;
  vendorPda: PublicKey;
  equipmentPda: PublicKey;
  uniqueId: PublicKey;
  totalAmount: number;
  durationSeconds: number;
  installmentFrequency: 
        | { daily: Record<string, never> }
        | { weekly: Record<string, never> }
        | { monthly: Record<string, never> }
        | { custom: { seconds: anchor.BN } };
  customFrequencySeconds?: number;
  deposit: number;
  insurancePremium?: number;
}