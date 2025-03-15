"use client";
import { useCluster } from "@/app/context/cluster-data-access";
import { usePartpayProgram } from "./usePartpayProgram";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { EquipmentArgs } from "../types/equipment";
import { Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as anchor from '@coral-xyz/anchor';
import { apiUrl, MPL_CORE_PROGRAM_ID, USDC_MINT } from "../utils/constant";
import axios from "axios";
import toast from "react-hot-toast";
import { ensureATA } from "../utils/lib";
import { FunderArgs } from "../types/funder";

export function useEquipmentAccount() {
    const { cluster } = useCluster();
    const { program } = usePartpayProgram();
    const { publicKey, signTransaction, connected } = useWallet();

    const fundEquipmentForBorrowerWithNoPayment = useMutation({
        mutationKey: ["partpay", "fund-equipment-for-borrower-no-payment", { cluster }],
        mutationFn: async ({
            wallet,
            equipmentPda,
            vendorPda,
            reciever,
            price,
            quantity,
            uniqueId
        }: FunderArgs) => {
            if (!publicKey || !signTransaction || !connected) {
                throw new Error("Wallet not connected");
            }


            const [escrowPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("escrow"), equipmentPda.toBuffer(), publicKey.toBuffer(), uniqueId.toBuffer()],
                program.programId
            );
            const connection = program.provider.connection;

            const funderATA = await ensureATA(connection, { publicKey, signTransaction } as any, USDC_MINT, publicKey);
            const escrowATA = await ensureATA(connection, { publicKey, signTransaction } as any, USDC_MINT, escrowPda);
            const vendorATA = await ensureATA(connection, { publicKey, signTransaction } as any, USDC_MINT, vendorPda);

            const totalPrice = price * quantity

            const funderBalance = await connection.getTokenAccountBalance(funderATA, "confirmed");
            console.log("Funder USDC Balance:", funderBalance.value.uiAmount, "USDC");
            if (funderBalance.value.uiAmount < totalPrice) {
                throw new Error("Funder has insufficient USDC. Required: 1 USDC");
            }

            const txBuilder = await program.methods
                .fundEquipmentForBorrowerNoPayment(
                    new anchor.BN(quantity),
                    reciever,
                    uniqueId
                )
                .accounts({
                    escrow: escrowPda,
                    escrowTokenAccount: escrowATA,
                    equipment: equipmentPda,
                    vendor: vendorPda,
                    funder: publicKey,
                    usdcMint: USDC_MINT,
                    funderTokenAccount: funderATA,
                    vendorTokenAccount: vendorATA,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                })

            const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash();
            const tx = await txBuilder.transaction();
            tx.recentBlockhash = blockhash;
            tx.feePayer = wallet.publicKey;

            const signedTx = await signTransaction(tx);
            const signature = await program.provider.connection.sendRawTransaction(signedTx.serialize());
            await program.provider.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });

            const funderInfoData = {
                equipmentPda,
                funderPubkey: wallet.publicKey,
                borrowerPubkey: reciever,
                quantity,
                escrow: escrowPda,
                signature
            };

            await axios.post(`${apiUrl}/funders`, funderInfoData, {
                headers: { 'Content-Type': 'application/json' },
            });

            return signature;
        },
        onSuccess: (signature) => toast.success(`Equipment funded: ${signature}`),
        onError: (error) => toast.error(`Funding failed: ${error.message}`),
    });

    const fundEquipmentForListing = useMutation({
        mutationKey: ["partpay", "fund-equipment-for-borrower-no-payment", { cluster }],
        mutationFn: async ({
            wallet,
            equipmentPda,
            vendorPda,
            reciever,
            price,
            quantity,
            uniqueId,
            minimumDeposit,
            funderPrice,
            durationSeconds
        }: FunderArgs) => {
            if (!publicKey || !signTransaction || !connected) {
                throw new Error("Wallet not connected");
            }

            if (!minimumDeposit || !durationSeconds) {
                throw new Error("Minimum deposit or Duration is not provided");
            }

            const [escrowPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("escrow"), equipmentPda.toBuffer(), wallet.publicKey.toBuffer(), uniqueId.toBuffer()],
                program.programId
            );

            const connection = program.provider.connection;

            const funderATA = await ensureATA(connection, { publicKey, signTransaction } as any, USDC_MINT, publicKey);
            const escrowATA = await ensureATA(connection, { publicKey, signTransaction } as any, USDC_MINT, escrowPda);

            const totalPrice = price * quantity

            const funderBalance = await connection.getTokenAccountBalance(funderATA, "confirmed");
            console.log("Funder USDC Balance:", funderBalance.value.uiAmount, "USDC");
            if (funderBalance.value.uiAmount < totalPrice) {
                throw new Error("Funder has insufficient USDC. Required: 1 USDC");
            }

            const txBuilder = await program.methods
                .fundEquipmentForListing(
                    new anchor.BN(quantity),
                    new anchor.BN(minimumDeposit),
                    new anchor.BN(durationSeconds),
                    uniqueId
                )
                .accounts({
                    escrow: escrowPda,
                    escrowTokenAccount: escrowATA,
                    equipment: equipmentPda,
                    vendor: vendorPda,
                    funder: publicKey,
                    usdcMint: USDC_MINT,
                    funderTokenAccount: funderATA,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                })

            const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash();
            const tx = await txBuilder.transaction();
            tx.recentBlockhash = blockhash;
            tx.feePayer = wallet.publicKey;

            const signedTx = await signTransaction(tx);
            const signature = await program.provider.connection.sendRawTransaction(signedTx.serialize());
            await program.provider.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });

            const funderInfoData = {
                equipmentPda,
                funderPubkey: wallet.publicKey,
                borrowerPubkey: reciever,
                quantity,
                escrow: escrowPda,
                funderPrice,
                minimumDeposit,
                durationSeconds,
                signature
            };

            await axios.post(`${apiUrl}/funders`, funderInfoData, {
                headers: { 'Content-Type': 'application/json' },
            });

            return signature;
        },
        onSuccess: (signature) => toast.success(`Equipment funded: ${signature}`),
        onError: (error) => toast.error(`Funding failed: ${error.message}`),
    });

    return {
        fundEquipmentForBorrowerWithNoPayment,
        fundEquipmentForListing,
    };
}