import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor"
import { PublicKey, Transaction } from "@solana/web3.js";
import axios, { AxiosError } from "axios";
import { apiUrl } from "./constant";
import toast from "react-hot-toast";

export async function ensureATA(
    connection: anchor.web3.Connection,
    wallet: { publicKey: PublicKey; signTransaction: (tx: Transaction) => Promise<Transaction> },
    mint: PublicKey,
    owner: PublicKey
): Promise<PublicKey> {
    const ata = await getAssociatedTokenAddress(
        mint,
        owner,
        true,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    );
    const accountInfo = await connection.getAccountInfo(ata);

    if (!accountInfo) {
        console.log(`ATA ${ata.toBase58()} not initialized, creating...`);
        const tx = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                ata,
                owner,
                mint,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )
        );
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized");
        tx.recentBlockhash = blockhash;
        tx.feePayer = wallet.publicKey;

        try {
            const signedTx = await wallet.signTransaction(tx);
            console.log("ATA Creation Tx Instructions:", signedTx.instructions.map(i => i.programId.toBase58()));
            const signature = await connection.sendRawTransaction(signedTx.serialize(), {
                skipPreflight: true, // Skip simulation to avoid mismatch
                preflightCommitment: "finalized",
            });
            await connection.confirmTransaction(
                { signature, blockhash, lastValidBlockHeight },
                "finalized"
            );
            console.log(`ATA created: ${ata.toBase58()}, Signature: ${signature}`);
        } catch (err) {
            console.error("Error creating ATA:", err);
            throw err;
        }
    } else {
        console.log(`ATA ${ata.toBase58()} already exists`);
    }

    return ata;
}

export const getInstalmentFrequency = async (
    installmentFrequency: | { daily: Record<string, never> }
        | { weekly: Record<string, never> }
        | { monthly: Record<string, never> }
        | { custom: { seconds: anchor.BN } },
    durationSeconds: number,
    customFrequencySeconds?: number,
) => {

    let backendFrequency: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
    let customFrequencyDays: number | null = null;
    let frequencySeconds: number;

    if ("daily" in installmentFrequency) {
        backendFrequency = "DAILY";
        frequencySeconds = 24 * 60 * 60;
    } else if ("weekly" in installmentFrequency) {
        backendFrequency = "WEEKLY";
        frequencySeconds = 7 * 24 * 60 * 60;
    } else if ("monthly" in installmentFrequency) {
        backendFrequency = "MONTHLY";
        frequencySeconds = 30 * 24 * 60 * 60;
    } else if ("custom" in installmentFrequency) {
        backendFrequency = "CUSTOM";
        if (!customFrequencySeconds) throw new Error("customFrequencySeconds required for CUSTOM frequency");
        frequencySeconds = customFrequencySeconds;
        customFrequencyDays = Math.floor(customFrequencySeconds / (24 * 60 * 60));
    } else {
        throw new Error("Invalid installmentFrequency provided");
    }

    const installmentCount = Math.floor(durationSeconds / frequencySeconds);

    return {
        installmentCount,
        customFrequencyDays,
        backendFrequency,
        frequencySeconds
    }

}

export const durationOptions = [
    { label: "1 Week", value: 7 },
    { label: "2 Weeks", value: 14 },
    { label: "1 Month", value: 30 },
    { label: "3 Months", value: 90 },
    { label: "5 Months", value: 150 },
    { label: "6 Months", value: 180 },
    { label: "8 Months", value: 240 },
    { label: "1 Year", value: 365 },
    { label: "1 Year 6 Months", value: 540 },
    { label: "2 Years", value: 730 },
];

export const paymentPreferenceOptions = [
    { label: "Installment Only", value: "Part" },
    { label: "Full Payment Only", value: "Full" },
    { label: "Both", value: "Both" },
];

export const addNewUser = async (publicKey: PublicKey) => {
    if (!publicKey) {
        toast.error("Wallet not connected..")
        return
    }
    try {
        const response = await axios.get(`${apiUrl}/users/${publicKey.toBase58()}`);
        if (response.status === 200) {
            console.log(response.data)
            return;
        }
    } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
            try {
                const newUser = {
                    pubkey: publicKey.toBase58(),
                    role: "VENDOR",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                await axios.post(`${apiUrl}/users`, newUser);
            } catch (postError) {
                toast.error("Failed to create user account");
            }
        } else {
            toast.error("An error occurred");
        }
    }
};

export const durationOption = [
    { label: "1 Week", value: 604800 },
    { label: "2 Weeks", value: 1209600 },
    { label: "3 Weeks", value: 1814400 },
    { label: "4 Weeks", value: 2419200 },
    { label: "1 Month", value: 2592000 },
    { label: "3 Months", value: 7776000 },
    { label: "5 Months", value: 12960000 },
    { label: "6 Months", value: 15552000 },
    { label: "8 Months", value: 20736000 },
    { label: "1 Year", value: 31104000 },
    { label: "1 Year 6 Months", value: 46656000 },
    { label: "2 Years", value: 62208000 },
];