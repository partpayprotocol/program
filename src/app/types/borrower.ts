import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export interface BorrowerArgs {
    wallet: AnchorWallet;
    buyerPublicKey: PublicKey;
  }