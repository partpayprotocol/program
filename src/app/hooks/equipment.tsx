"use client"
import { useCluster } from "@/components/cluster/cluster-data-access";
import { usePartpayProgram } from "./usePartpayProgram";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { EquipmentArgs } from "../types/equipment";
import { Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import * as anchor from '@coral-xyz/anchor'
import { apiUrl, MPL_CORE_PROGRAM_ID } from "../utils/constant";
import axios from "axios";
import toast from "react-hot-toast";

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

            const [equipmentAssetPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("equipment_asset"), equipmentPda.toBuffer()],
                program.programId
            );

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
                    equipmentAsset: equipmentAssetPda,
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
                equipmentPda: equipmentPda.toBase58(),
                equipmentAddress: equipmentAssetPda.toBase58(),
                vendorPda: vendorPda.toBase58(),
                vendorPubkey: wallet.publicKey.toBase58(),
                collection: vendorCollectionPda.toBase58(),
                equipmentAddressPda: equipmentAssetPda.toBase58(),
                uniqueId: equipmentUniqueId.toBase58(),
                authority: wallet.publicKey.toBase58(),
                minimumAmount: minimumAmount,
                totalAmount: totalAmount,
                quantity,
                uri,
                maxDuration,
                name,
                additionInfo: {},
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