import { PublicKey } from "@solana/web3.js";

export const MPL_CORE_PROGRAM_ID = new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");
export const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
// export const umi = createUmi(`https://api.devnet.solana.com`)
export const apiUrl = "https://server-production-6bdd.up.railway.app" 

export const EQUIPMENT_CATEGORIES = [
    { value: "electronics", label: "Electronics" },
    { value: "machinery", label: "Machinery" },
    { value: "office", label: "Office Equipment" },
    { value: "medical", label: "Medical Equipment" },
    { value: "construction", label: "Construction Equipment" },
    { value: "transportation", label: "Transportation" },
    { value: "kitchen", label: "Kitchen Equipment" },
    { value: "other", label: "Other" }
  ];
  
  // Example budget ranges
  export const BUDGET_RANGES = [
    { value: "0-1000", label: "Under $1,000" },
    { value: "1000-5000", label: "$1,000 - $5,000" },
    { value: "5000-10000", label: "$5,000 - $10,000" },
    { value: "10000-50000", label: "$10,000 - $50,000" },
    { value: "50000+", label: "$50,000+" },
  ];

  export const usdcMint = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");