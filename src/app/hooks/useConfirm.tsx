'use client';
import { useCluster } from "@/app/context/cluster-data-access";
import { usePartpayProgram } from "./usePartpayProgram";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ConfirmDeliveryToBorrower, ContractArgs } from "../types/contract";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from '@coral-xyz/anchor';
import axios from "axios";
import { apiUrl, USDC_MINT } from "../utils/constant";
import toast from "react-hot-toast";
import { TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ensureATA, getInstalmentFrequency } from "../utils/lib";

export function useConfirmAccount() {
    const { cluster } = useCluster();
    const { program } = usePartpayProgram();
    const { publicKey, signTransaction, connected } = useWallet();

    const confirmDeliveryToBorrower = useMutation({
        mutationKey: ['partpay', 'create-contract', { cluster }],
        mutationFn: async ({
            wallet,
            vendorPda,
            escrowPda,
            equipmentPda,
            contractPda,
            uniqueId,
            funder,
            destination
        }: ConfirmDeliveryToBorrower) => {

            if (!publicKey || !signTransaction || !connected) {
                throw new Error('Wallet not connected');
            }

            const connection = program.provider.connection;

            const payeeATA = funder ? await ensureATA(connection, { publicKey, signTransaction } as any, USDC_MINT, funder) : await ensureATA(connection, { publicKey, signTransaction } as any, USDC_MINT, vendorPda);
            const escrowATA = await ensureATA(connection, { publicKey, signTransaction } as any, USDC_MINT, escrowPda);

            const txBuilder = await program.methods
                .confirmDelivery(uniqueId)
                .accounts({
                    equipment: equipmentPda,
                    escrow: escrowPda,
                    escrowTokenAccount: escrowATA,
                    contract: contractPda,
                    borrower: publicKey,
                    payeeTokenAccount: payeeATA,
                    payee: vendorPda,
                    funder: publicKey,
                    vendor: vendorPda,
                    usdcMint: USDC_MINT,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })

            const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash();
            const tx = await txBuilder.transaction();
            tx.recentBlockhash = blockhash;
            tx.feePayer = wallet.publicKey;

            const signedTx = await signTransaction(tx);
            const signature = await program.provider.connection.sendRawTransaction(signedTx.serialize());
            await program.provider.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });

            const deliveryData = {
                equipmentPda,
                userPubkey: publicKey,
                contract: contractPda,
                signature,
                escrow: escrowPda,
                vendorPubkey: vendorPda,
                funderPubkey: funder,
                destination: destination,
                deliveryStatus: "DELIVERED",
                stablecoinMint: USDC_MINT.toBase58(),
            }

            await axios.post(`${apiUrl}/delivery`, deliveryData, {
                headers: { 'Content-Type': 'application/json' }
            });
        },
        onSuccess: (signature) => {
            toast.success("Successfully confirmed");
        },
        onError: (error) => {
            toast.error(`Failed to confirm delivery: ${error.message}`);
        },
    })


    const confirmFundedDeliveryToBorrower= useMutation({
        mutationKey: ['partpay', 'create-contract', { cluster }],
        mutationFn: async ({
            wallet,
            vendorPda,
            escrowPda,
            equipmentPda,
            uniqueId,
            funder,
            destination
        }: ConfirmDeliveryToBorrower) => {

            if (!publicKey || !signTransaction || !connected) {
                throw new Error('Wallet not connected');
            }

            const connection = program.provider.connection;

            const payeeATA = await ensureATA(connection, { publicKey, signTransaction } as any, USDC_MINT, vendorPda);
            const escrowATA = await ensureATA(connection, { publicKey, signTransaction } as any, USDC_MINT, escrowPda);

            const txBuilder = await program.methods
                .confirmFundedDelivery(uniqueId)
                .accounts({
                    equipment: equipmentPda,
                    escrow: escrowPda,
                    escrowTokenAccount: escrowATA,
                    confirmer: publicKey,
                    payeeTokenAccount: payeeATA,
                    payee: vendorPda,
                    vendor: vendorPda,
                    usdcMint: USDC_MINT,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })

            const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash();
            const tx = await txBuilder.transaction();
            tx.recentBlockhash = blockhash;
            tx.feePayer = wallet.publicKey;

            const signedTx = await signTransaction(tx);
            const signature = await program.provider.connection.sendRawTransaction(signedTx.serialize());
            await program.provider.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });

            const deliveryData = {
                equipmentPda,
                userPubkey: publicKey,
                signature,
                escrow: escrowPda,
                vendorPubkey: vendorPda,
                funderPubkey: funder,
                destination: destination,
                deliveryStatus: "DELIVERED",
                stablecoinMint: USDC_MINT.toBase58(),
            }

            await axios.post(`${apiUrl}/delivery`, deliveryData, {
                headers: { 'Content-Type': 'application/json' }
            });
        },
        onSuccess: (signature) => {
            toast.success("Successfully confirmed");
        },
        onError: (error) => {
            toast.error(`Failed to confirm delivery: ${error.message}`);
        },
    })
    

    return {
        confirmDeliveryToBorrower,
        confirmFundedDeliveryToBorrower

    }
}