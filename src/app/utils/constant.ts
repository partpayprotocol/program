import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { PublicKey } from "@solana/web3.js";

export const MPL_CORE_PROGRAM_ID = new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");
export const umi = createUmi(`https://api.devnet.solana.com`)
export const apiUrl = "https://server-production-6bdd.up.railway.app" 