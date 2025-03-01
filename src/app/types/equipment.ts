import { PublicKey } from "@solana/web3.js";

export interface EquipmentArgs {
  wallet: { publicKey: PublicKey };
  vendorPda: PublicKey;
  vendorCollectionPda: PublicKey;
  name: string;
  uri: string;
  minimumAmount: number;
  totalAmount: number;
  quantity: number;
  maxDuration: number;
  paymentPreference: "Part" | "Full" | "Both",
}

export interface ItemProps {
  id: string;
  image: string;
  title: string;
  description: string;
  amount: number
} 