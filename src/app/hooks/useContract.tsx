'use client'
import { useCluster } from "@/components/cluster/cluster-data-access";
import { usePartpayProgram } from "./usePartpayProgram";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ContractArgs } from "../types/contract";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from '@coral-xyz/anchor'
import axios from "axios";
import { apiUrl } from "../utils/constant";
import toast from "react-hot-toast";

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
            deposit,
            insurancePremium,
        }: ContractArgs) => {
            if (!publicKey || !signTransaction || !connected) {
                throw new Error('Wallet not connected');
            }

            const [contractPda] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("bnpl_contract"),
                    buyerPubkey.toBuffer(),
                    vendorPda.toBuffer(),
                    equipmentPda.toBuffer(),
                    uniqueId.toBuffer(),
                ],
                program.programId
            );

            const txBuilder = await program.methods
                .createContract(
                    uniqueId,
                    new anchor.BN(totalAmount),
                    new anchor.BN(durationSeconds),
                    new anchor.BN(installmentFrequency),
                    new anchor.BN(deposit),
                    insurancePremium ? new anchor.BN(insurancePremium) : null
                )
                .accounts({
                    contract: contractPda,
                    buyer: buyerPubkey,
                    seller: vendorPda,
                    equipment: equipmentPda,
                    systemProgram: SystemProgram.programId,
                });

            const { blockhash } = await program.provider.connection.getLatestBlockhash();
            const tx = await txBuilder.transaction();
            tx.recentBlockhash = blockhash;
            tx.feePayer = wallet.publicKey;

            const signedTx = await signTransaction(tx);
            const signature = await program.provider.connection.sendRawTransaction(signedTx.serialize());
            await program.provider.connection.confirmTransaction(signature);

            const contractData = {
                contractPda: contractPda.toBase58(),
                borrowerPubkey: buyerPubkey.toBase58(),
                vendorPubkey: vendorPda.toBase58(),
                equipmentPubkey: equipmentPda.toBase58(),
                contract_unique_id: uniqueId.toBase58(),
                totalAmount: totalAmount,
                installmentCount: Math.floor((totalAmount - deposit) / (totalAmount / (durationSeconds / installmentFrequency))),
                installmentFrequency: installmentFrequency === 7 * 24 * 60 * 60 ? "weekly" : "custom",
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + durationSeconds * 1000).toISOString(),
                lastPaymentDate: null,
                paidInstallments: 0,
                amountPaid: 0,
                deposit: deposit,
                creditScoreDelta: 0,
                isInsured: !!insurancePremium,
                stablecoinMint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
                insurancePremium: insurancePremium ? insurancePremium / 1e9 : 0,
                customFrequency: installmentFrequency === 7 * 24 * 60 * 60 ? null : `${installmentFrequency / (24 * 60 * 60)} days`,
            };

            await axios.post(`${apiUrl}/contracts`, contractData, {
                headers: { 'Content-Type': 'application/json' }
            });

            return signature;
        },
        onSuccess: (signature) => {
            toast.success("Contract initialized successfully!");
            // transactionToast(signature);
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

            // Fetch off-chain contract data from API
            const apiResponse = await axios.get(`${apiUrl}/contracts/borrower/${publicKey.toBase58()}`);
            const offChainData = apiResponse.data;

            const contractPda = new PublicKey(offChainData.contractPda);
            const vendorPda = new PublicKey(offChainData.vendorPubkey);
            const equipmentPda = new PublicKey(offChainData.equipmentPubkey);
            const uniqueId = new PublicKey(offChainData.contract_unique_id);

            const [derivedContractPda] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("bnpl_contract"),
                    publicKey.toBuffer(),
                    vendorPda.toBuffer(),
                    equipmentPda.toBuffer(),
                    uniqueId.toBuffer(),
                ],
                program.programId
            );
            if (derivedContractPda.toBase58() !== contractPda.toBase58()) {
                console.warn('Derived contractPda does not match API data');
            }

            const contractAccount = await program.account.bnplContract.fetch(contractPda);

            const contractStatus = await program.methods
                .getContractStatus()
                .accounts({
                    contract: contractPda,
                })
                .view();

            return {
                onChain: {
                    contractPda: contractPda.toBase58(),
                    contractAccount,
                    contractStatus,
                },
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
                    const contractStatus = await program.methods
                        .getContractStatus()
                        .accounts({
                            contract: contractPda,
                        })
                        .view();

                    return {
                        offChain: contract,
                        onChain: {
                            contractPda: contractPda.toBase58(),
                            contractAccount,
                            contractStatus,
                        },
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