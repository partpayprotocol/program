import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export interface InitializeBorrowerArgs {
    wallet: AnchorWallet;
    borrower: PublicKey;
    creditScore: PublicKey;
  }