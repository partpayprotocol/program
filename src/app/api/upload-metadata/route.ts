import { NextRequest, NextResponse } from "next/server";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { signerIdentity, publicKey, Signer, Transaction as UmiTransaction } from "@metaplex-foundation/umi";
import { Transaction as Web3Transaction } from "@solana/web3.js";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { umi } from "@/app/utils/constant";

const metaData = {
  name: "Test Vendor",
  description: "A test vendor metadata",
  image: "https://example.com/image.png",
};

function createSignerFromWallet(wallet: WalletContextState): Signer {
  if (!wallet.publicKey) {
    throw new Error("Wallet is missing publicKey");
  }

  return {
    publicKey: publicKey(wallet.publicKey),
    signMessage: async (message: Uint8Array): Promise<Uint8Array> => {
      if (!wallet.signMessage) throw new Error("Wallet does not support message signing");
      return wallet.signMessage(message);
    },
    signTransaction: async (transaction: UmiTransaction): Promise<UmiTransaction> => {
      if (!wallet.signTransaction) throw new Error("Wallet does not support transaction signing");
      const web3Tx = transaction as unknown as Web3Transaction;
      const signedTx = await wallet.signTransaction(web3Tx);
      return signedTx as unknown as UmiTransaction;
    },
    signAllTransactions: async (transactions: UmiTransaction[]): Promise<UmiTransaction[]> => {
      if (!wallet.signAllTransactions) {
        if (!wallet.signTransaction) throw new Error("Wallet does not support transaction signing");
        const signedTxs = await Promise.all(
          transactions.map((tx) => wallet.signTransaction!(tx as unknown as Web3Transaction))
        );
        return signedTxs as unknown as UmiTransaction[];
      }
      const web3Txs = transactions as unknown as Web3Transaction[];
      const signedTxs = await wallet.signAllTransactions(web3Txs);
      return signedTxs as unknown as UmiTransaction[];
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const { wallet } = await req.json(); // Expect wallet data from client

    if (!wallet || !wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
      return NextResponse.json({ error: "Wallet is not connected or lacks signing capability" }, { status: 400 });
    }

    umi.use(irysUploader());
    const signer = createSignerFromWallet(wallet as WalletContextState);
    umi.use(signerIdentity(signer));

    const balance = await umi.rpc.getBalance(publicKey(signer));
    if (balance.basisPoints === BigInt(0)) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    if (!umi.uploader) {
      return NextResponse.json({ error: "umi.uploader is not initialized" }, { status: 500 });
    }

    const uri = await umi.uploader.uploadJson(metaData);
    if (!uri) {
      return NextResponse.json({ error: "Failed to upload metadata" }, { status: 500 });
    }

    return NextResponse.json({ uri });
  } catch (error) {
    console.error("Error in upload-metadata:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}