"use client"
import { useCluster } from "@/app/context/cluster-data-access";
import { usePartpayProgram } from "./usePartpayProgram";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { EquipmentArgs } from "../types/equipment";
import { Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token"
import * as anchor from '@coral-xyz/anchor'
import { apiUrl, MPL_CORE_PROGRAM_ID, USDC_MINT } from "../utils/constant";
import axios from "axios";
import toast from "react-hot-toast";
import { BN } from "bn.js";

export function useEquipmentAccount() {
    const { cluster } = useCluster();
    const { program } = usePartpayProgram();
    const { publicKey, signTransaction, connected } = useWallet();

    const initializeEquipment = useMutation({
        mutationKey: ['partpay', 'upload-equipment', { cluster }],
        mutationFn: async ({
            wallet,
            vendorPda,
            vendorCollectionPda,
            name,
            uri,
            minimumAmount,
            totalAmount,
            paymentPreference,
            quantity,
            maxDuration,
        }: EquipmentArgs) => {
            if (!publicKey || !signTransaction || !connected) {
                throw new Error('Wallet not connected');
            }

            const equipmentUniqueId = Keypair.generate().publicKey;

            const equipmentSeeds = [
                Buffer.from("equipment"),
                vendorPda.toBuffer(),
                equipmentUniqueId.toBuffer(),
                Buffer.from(name),
            ];
            const [equipmentPda] = PublicKey.findProgramAddressSync(equipmentSeeds, program.programId);

            const [assetPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("equipment_asset"), equipmentPda.toBuffer()],
                program.programId
            );
 //         equipmentName,
  //         uri,
  //         new BN(1_000_000), // 1 USDC price
  //         new BN(10), // 10 units
  //         equipmentUniqueId,
  //         new BN(200_000), // 0.2 USDC min deposit
  //         new BN(604_800), // 1 week
  //         { part: {} }
            const txBuilder = await program.methods
                .uploadEquipment(
                    name,
                    uri,
                    new anchor.BN(minimumAmount),
                    new anchor.BN(totalAmount),
                    equipmentUniqueId,
                    new anchor.BN(quantity),
                    new anchor.BN(maxDuration)
                )
                .accounts({
                    equipment: equipmentPda,
                    asset: assetPda,
                    vendor: vendorPda,
                    vendorCollection: vendorCollectionPda,
                    authority: wallet.publicKey,
                    payer: wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                    mplCoreProgram: MPL_CORE_PROGRAM_ID,
                    rent: SYSVAR_RENT_PUBKEY,
                });

            const { blockhash } = await program.provider.connection.getLatestBlockhash();
            const tx = await txBuilder.transaction();
            tx.recentBlockhash = blockhash;
            tx.feePayer = wallet.publicKey;

            const signedTx = await signTransaction(tx);
            const signature = await program.provider.connection.sendRawTransaction(signedTx.serialize());
            await program.provider.connection.confirmTransaction(signature);

            const equipmentData = {
                equipmentPda
assetPda: 
vendorPda
vendorPubkey
uniqueId
paymentPreference
minimumDeposit
price
totalQuantity
uri
maxDuration
name
status
            };

            await axios.post(`${apiUrl}/equipment`, equipmentData, {
                headers: { 'Content-Type': 'application/json' }
            });

            return signature;
        },
        onSuccess: (signature) => {
            toast.success("Equipment initialized successfully!");
            // transactionToast(signature);
        },
        onError: (error) => {
            toast.error(`Failed to initialize equipment: ${error.message}`);
        },
    });

    const fundEquipment = useMutation({
        mutationKey: ["partpay", "fund-equipment", { cluster }],
        mutationFn: async ({
            wallet,
            equipmentPda,
            vendorPda,
            quantity,
            minimumAmount,
            durationSeconds,
        }: {
            wallet: { publicKey: PublicKey };
            equipmentPda: string;
            vendorPda: string;
            quantity: number;
            minimumAmount: number;
            durationSeconds: number;
        }) => {
            if (!publicKey || !signTransaction || !connected) {
                throw new Error("Wallet not connected");
            }

            const txBuilder = await program.methods
                .fundEquipment(new BN(quantity), new BN(minimumAmount), new BN(durationSeconds))
                .accounts({
                    equipment: new PublicKey(equipmentPda),
                    vendor: new PublicKey(vendorPda),
                    funder: wallet.publicKey,
                    usdcMint: USDC_MINT,
                    funderTokenAccount: await getAssociatedTokenAddress(USDC_MINT, wallet.publicKey),
                    vendorTokenAccount: await getAssociatedTokenAddress(USDC_MINT, new PublicKey(vendorPda)),
                    tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                    systemProgram: SystemProgram.programId,
                    associatedTokenProgram: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
                });

            const { blockhash } = await program.provider.connection.getLatestBlockhash();
            const tx = await txBuilder.transaction();
            tx.recentBlockhash = blockhash;
            tx.feePayer = wallet.publicKey;

            const signedTx = await signTransaction(tx);
            const signature = await program.provider.connection.sendRawTransaction(signedTx.serialize());
            await program.provider.connection.confirmTransaction(signature, "finalized");
            return signature;
        },
        onSuccess: (signature) => toast.success(`Equipment funded: ${signature}`),
        onError: (error) => toast.error(`Funding failed: ${error.message}`),
    });

    const getEquipment = useQuery({
        queryKey: ['equipment', 'fetch', publicKey?.toBase58()],
        queryFn: async () => {
            if (!publicKey) {
                throw new Error('Wallet not connected');
            }

            const apiResponse = await axios.get(`${apiUrl}/equipment/vendor/${publicKey.toBase58()}`);
            const vendorApiResponse = await axios.get(`${apiUrl}/vendor/${publicKey.toBase58()}`);
            const offChainVendor = vendorApiResponse.data;
            const offChainData = apiResponse.data;

            const equipmentPda = new PublicKey(offChainData.equipmentPda);
            const vendorPda = new PublicKey(offChainVendor.vendorPda);

            const equipmentAccount = await program.account.equipment.fetch(equipmentPda);
            const equipmentDetails = await program.methods
                .getEquipment()
                .accounts({
                    equipment: equipmentPda,
                    vendor: vendorPda,
                })
                .view();

            return {
                onChain: {
                    equipmentPda: equipmentPda.toBase58(),
                    equipmentAccount,
                    equipmentDetails,
                },
                offChain: offChainData,
            };
        },
        enabled: !!publicKey && connected,
    });

    const getAllVendorEquipment = useQuery({
        queryKey: ['vendor-equipment', 'fetch-all', publicKey?.toBase58()],
        queryFn: async () => {
            if (!publicKey) {
                throw new Error('Wallet not connected');
            }

            const apiResponse = await axios.get(`${apiUrl}/equipment/vendor/${publicKey.toBase58()}/all`);
            const vendorApiResponse = await axios.get(`${apiUrl}/vendor/${publicKey.toBase58()}`);
            const offChainEquipments = apiResponse.data;
            const offChainVendor = vendorApiResponse.data;

            const vendorEquipmentResponse = await program.methods
                .getAllVendorEquipment()
                .accounts({
                    vendor: offChainVendor.vendorPDA,
                })
                .view();

            const enrichedEquipments = offChainEquipments.map((equipment: any) => {
                const equipmentPda = new PublicKey(equipment.equipmentPda);
                return {
                    offChain: equipment,
                    onChain: {
                        equipmentPda: equipmentPda.toBase58(),
                    },
                };
            });

            return {
                vendorEquipmentResponse,
                equipments: enrichedEquipments,
            };
        },
        enabled: !!publicKey && connected,
    });

    return {
        initializeEquipment,
        getEquipment,
        getAllVendorEquipment,
    };
}