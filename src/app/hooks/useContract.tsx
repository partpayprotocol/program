'use client';
import { useCluster } from "@/app/context/cluster-data-access";
import { usePartpayProgram } from "./usePartpayProgram";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ContractArgs } from "../types/contract";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from '@coral-xyz/anchor';
import axios from "axios";
import { apiUrl, USDC_MINT } from "../utils/constant";
import toast from "react-hot-toast";
import { TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ensureATA, getInstalmentFrequency } from "../utils/lib";

export function useContractAccount() {
    const { cluster } = useCluster();
    const { program } = usePartpayProgram();
    const { publicKey, signTransaction, connected } = useWallet();

    const initializeContract = useMutation({
        mutationKey: ['partpay', 'create-contract', { cluster }],
        mutationFn: async ({
            wallet,
            buyerPubkey,
            vendorPda,
            equipmentPda,
            uniqueId,
            totalAmount,
            durationSeconds,
            installmentFrequency,
            customFrequencySeconds,
            deposit,
            insurancePremium,
            funder
        }: ContractArgs) => {
            if (!publicKey || !signTransaction || !connected) {
                throw new Error('Wallet not connected');
            }

            const [contractPda] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("bnpl_contract"),
                    buyerPubkey.toBuffer(),
                    equipmentPda.toBuffer(),
                    uniqueId.toBuffer(),
                ],
                program.programId
            );

            const [escrowPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("escrow"), equipmentPda.toBuffer(), publicKey.toBuffer(), uniqueId.toBuffer()],
                program.programId
            );

            const connection = program.provider.connection;
            const buyerATA = await ensureATA(connection, { publicKey, signTransaction } as any, USDC_MINT, buyerPubkey);
            const payeeATA = funder ? await ensureATA(connection, { publicKey, signTransaction } as any, USDC_MINT, funder) : await ensureATA(connection, { publicKey, signTransaction } as any, USDC_MINT, vendorPda);
            const escrowATA = await ensureATA(connection, { publicKey, signTransaction } as any, USDC_MINT, escrowPda);

            const buyerBalance = await connection.getTokenAccountBalance(buyerATA);
            if (buyerBalance && buyerBalance.value?.uiAmount < 20) {
                throw new Error("Buyer needs at least 20 USDC");
            }

            const txBuilder = await program.methods
                .createContract(
                    uniqueId,
                    new anchor.BN(totalAmount),
                    installmentFrequency,
                    new anchor.BN(deposit),
                    insurancePremium ? new anchor.BN(insurancePremium) : null,
                    funder ? new PublicKey(funder) : null
                )
                .accounts({
                    contract: contractPda,
                    equipment: equipmentPda,
                    buyer: buyerPubkey,
                    usdcMint: USDC_MINT,
                    buyerTokenAccount: buyerATA,
                    escrow: escrowPda,
                    escrowTokenAccount: escrowATA,
                    payeeTokenAccount: payeeATA,
                    payee: funder ? funder : vendorPda,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                });

            const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash();
            const tx = await txBuilder.transaction();
            tx.recentBlockhash = blockhash;
            tx.feePayer = wallet.publicKey;

            const signedTx = await signTransaction(tx);
            const signature = await program.provider.connection.sendRawTransaction(signedTx.serialize());
            await program.provider.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });

            const { installmentCount, customFrequencyDays, backendFrequency, frequencySeconds } = await getInstalmentFrequency(installmentFrequency, durationSeconds, customFrequencySeconds,)

            const contractData = {
                contractPda: contractPda.toBase58(),
                borrowerPubkey: buyerPubkey.toBase58(),
                vendorPubkey: vendorPda.toBase58(),
                equipmentPubkey: equipmentPda.toBase58(),
                contract_unique_id: uniqueId.toBase58(),
                totalAmount: totalAmount / 1e6,
                amountPaid: deposit / 1e6,
                deposit: deposit / 1e6,
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + durationSeconds * 1000).toISOString(),
                lastPaymentDate: new Date().toISOString(),
                installmentCount,
                escrow: escrowPda,
                funder,
                paidInstallments: 0,
                installmentFrequency: backendFrequency,
                customFrequency: customFrequencyDays,
                isCompleted: false,
                insurancePremium: insurancePremium ? insurancePremium / 1e6 : null,
                isInsured: !!insurancePremium,
                creditScoreDelta: 0,
                stablecoinMint: USDC_MINT.toBase58(),
                signature
            };

            await axios.post(`${apiUrl}/contract`, contractData, {
                headers: { 'Content-Type': 'application/json' }
            });

            return signature;
        },
        onSuccess: (signature) => {
            toast.success("Contract initialized successfully!");
        },
        onError: (error) => {
            toast.error(`Failed to initialize contract: ${error.message}`);
        },
    });

    const getContract = useQuery({
        queryKey: ['contract', 'fetch', publicKey?.toBase58()],
        queryFn: async () => {
            if (!publicKey) {
                throw new Error('Wallet not connected');
            }

            const apiResponse = await axios.get(`${apiUrl}/contracts/borrower/${publicKey.toBase58()}`);
            const offChainData = apiResponse.data;

            const contractPda = new PublicKey(offChainData.contractPda);
            const contractAccount = await program.account.bnplContract.fetch(contractPda);
            return {
                onChain: { contractPda: contractPda.toBase58(), contractAccount },
                offChain: offChainData,
            };
        },
        enabled: !!publicKey && connected,
    });

    const getAllContracts = useQuery({
        queryKey: ['contracts', 'fetch-all', publicKey?.toBase58()],
        queryFn: async () => {
            if (!publicKey) {
                throw new Error('Wallet not connected');
            }

            const response = await axios.get(`${apiUrl}/contracts/borrower/${publicKey.toBase58()}/all`);
            const contracts = response.data;

            const enrichedContracts = await Promise.all(
                contracts.map(async (contract: any) => {
                    const contractPda = new PublicKey(contract.contractPda);
                    const contractAccount = await program.account.bnplContract.fetch(contractPda);
                    return {
                        offChain: contract,
                        onChain: { contractPda: contractPda.toBase58(), contractAccount },
                    };
                })
            );

            return enrichedContracts;
        },
        enabled: !!publicKey && connected,
    });

    return {
        initializeContract,
        getContract,
        getAllContracts,
    };
}