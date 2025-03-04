import { PublicKey } from "@solana/web3.js";

export interface EquipmentArgs {
  publicKey: PublicKey;
  vendorPda: PublicKey;
  vendorCollectionPda: PublicKey;
  metadata: { 
    name: string; 
    uri: string 
    description?: string 
  };
  price: number;
  minimumDeposit: number;
  quantity: number;
  maxDuration: number;
  paymentPreference:
  | { part: Record<string, never> }
  | { full: Record<string, never> }
  | { both: Record<string, never> };
  images: string[];
  video: string|null;
}

export interface ItemProps {
  id: string;
  image: string;
  title: string;
  description: string;
  amount: number
} 