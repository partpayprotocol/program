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

export function useEquipmentAccount() {
    const { cluster } = useCluster();
    const { program } = usePartpayProgram();
    const { publicKey, signTransaction, connected } = useWallet();

    const initializeEquipment = useMutation({
        mutationKey: ['partpay', 'upload-equipment', { cluster }],
        mutationFn: async ({
            publicKey,
            vendorPda,
            vendorCollectionPda,
            metadata,
            price,
            minimumDeposit,
            quantity,
            maxDuration,
            images,
            video,
            paymentPreference,
        }: EquipmentArgs) => {
            if (!publicKey || !signTransaction || !connected) {
                throw new Error('Wallet not connected');
            }

            const equipmentUniqueId = Keypair.generate().publicKey;
            const equipmentSeeds = [
                Buffer.from("equipment"),
                vendorPda.toBuffer(),
                equipmentUniqueId.toBuffer(),
                Buffer.from(metadata.name),
            ];
            const [equipmentPda] = PublicKey.findProgramAddressSync(equipmentSeeds, program.programId);

            const [equipmentAssetPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("equipment_asset"), equipmentPda.toBuffer()],
                program.programId
            );

            let programPaymentPreference;
            if ("part" in paymentPreference) {
                programPaymentPreference = { part: {} };
            } else if ("full" in paymentPreference) {
                programPaymentPreference = { full: {} };
            } else if ("both" in paymentPreference) {
                programPaymentPreference = { both: { timeout: new anchor.BN(paymentPreference.both.timeout || 3600) } };
            } else {
                throw new Error("Invalid paymentPreference provided");
            }

            const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash("confirmed");

            const txBuilder = await program.methods
                .uploadEquipment(
                    metadata.name,
                    metadata.uri,
                    new anchor.BN(price),
                    new anchor.BN(quantity),
                    equipmentUniqueId,
                    new anchor.BN(minimumDeposit),
                    new anchor.BN(maxDuration),
                    programPaymentPreference
                )
                .accounts({
                    equipment: equipmentPda,
                    equipmentAsset: equipmentAssetPda,
                    vendor: vendorPda,
                    vendorCollection: vendorCollectionPda,
                    authority: publicKey,
                    payer: publicKey,
                    systemProgram: SystemProgram.programId,
                    mplCoreProgram: MPL_CORE_PROGRAM_ID,
                    rent: SYSVAR_RENT_PUBKEY,
                });

            const tx = await txBuilder.transaction();
            tx.recentBlockhash = blockhash;
            tx.feePayer = publicKey;

            const signedTx = await signTransaction(tx);
            const signature = await program.provider.connection.sendRawTransaction(signedTx.serialize(), {
                skipPreflight: false,
                preflightCommitment: "confirmed",
            });

            const confirmation = await program.provider.connection.confirmTransaction(
                { signature, blockhash, lastValidBlockHeight },
                "finalized"
            );

            console.log("price:", price)
            console.log("minimumDeposit:", minimumDeposit)

            const backendPaymentPreference = "part" in paymentPreference ? "Part" :
                "full" in paymentPreference ? "Full" :
                    "both" in paymentPreference ? "Both" : "Unknown";

            const equipmentData = {
                equipmentPda: equipmentPda.toBase58(),
                assetPda: equipmentAssetPda.toBase58(),
                vendorPda: vendorPda.toBase58(),
                vendorPubkey: publicKey.toBase58(),
                uniqueId: equipmentUniqueId.toBase58(),
                paymentPreference: backendPaymentPreference,
                minimumDeposit: minimumDeposit,
                authority: publicKey,
                price: price,
                totalQuantity: quantity,
                uri: metadata.uri,
                maxDuration,
                name: metadata.name,
                description: metadata.description,
                status: "AVAILABLE",
                vendorId: publicKey.toBase58(),
                images,
                video: video || null,
            };

            await axios.post(`${apiUrl}/equipment`, equipmentData, {
                headers: { 'Content-Type': 'application/json' }
            });

            return signature;
        },
        onSuccess: (signature) => {
            toast.success("Equipment initialized successfully!");
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
          funderPrice,
        }: {
          wallet: { publicKey: PublicKey };
          equipmentPda: string;
          vendorPda: string;
          quantity: number;
          minimumAmount: number;
          durationSeconds: number;
          funderPrice: number;
        }) => {
          if (!publicKey || !signTransaction || !connected) {
            throw new Error("Wallet not connected");
          }
      
          console.log("Wallet Public Key:", wallet.publicKey.toBase58());
          console.log("Vendor PDA:", vendorPda);
          console.log("Equipment PDA:", equipmentPda);
      
          const connection = program.provider.connection;
      
          // Fetch equipment state to validate
          const equipmentAccount = await program.account.equipment.fetch(new PublicKey(equipmentPda));
          console.log("Equipment State:", {
            fundedQuantity: equipmentAccount.fundedQuantity.toString(),
            paymentPreference: equipmentAccount.paymentPreference,
          });
      
          // Validate equipment state
          const isFundable =
            equipmentAccount.fundedQuantity.eq(new anchor.BN(0)) &&
            (equipmentAccount.paymentPreference.full !== undefined || equipmentAccount.paymentPreference.both !== undefined);
          if (!isFundable) {
            throw new Error(
              `Equipment cannot be funded: funded_quantity = ${equipmentAccount.fundedQuantity.toString()}, payment_preference = ${
                Object.keys(equipmentAccount.paymentPreference)[0]
              }`
            );
          }
      
          const funderATA = await getAssociatedTokenAddress(
            USDC_MINT,
            wallet.publicKey,
            true,
            TOKEN_PROGRAM_ID, // Use Token 2022 for consistency
            ASSOCIATED_TOKEN_PROGRAM_ID
          );
          const vendorPubkey = new PublicKey("45S7j2rvWhwzeuQkPaEf3Gatvd2mD4X29bBkVYB8CjuX");
          const vendorATA = await getAssociatedTokenAddress(
            USDC_MINT,
            vendorPubkey,
            true,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          );
      
          const tx = new Transaction();
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized");
          tx.recentBlockhash = blockhash;
          tx.feePayer = wallet.publicKey;
      
          // Check and add ATA creation instructions if needed
          if (!(await connection.getAccountInfo(funderATA))) {
            console.log(`Funder ATA ${funderATA.toBase58()} not initialized, adding creation...`);
            tx.add(
              createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                funderATA,
                wallet.publicKey,
                USDC_MINT,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
              )
            );
          }
          if (!(await connection.getAccountInfo(vendorATA))) {
            console.log(`Vendor ATA ${vendorATA.toBase58()} not initialized, adding creation...`);
            tx.add(
              createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                vendorATA,
                vendorPubkey,
                USDC_MINT,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
              )
            );
          }
      
          // Add fundEquipment instruction
          const txBuilder = await program.methods
            .fundEquipment(
              new anchor.BN(quantity),
              new anchor.BN(minimumAmount),
              new anchor.BN(durationSeconds),
              new anchor.BN(funderPrice) // Note: Requires program update to accept this
            )
            .accounts({
              equipment: new PublicKey(equipmentPda),
              vendor: new PublicKey(vendorPda),
              funder: wallet.publicKey,
              usdcMint: USDC_MINT,
              funderTokenAccount: funderATA,
              vendorTokenAccount: vendorATA,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
              associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            });
          tx.add(await txBuilder.instruction());
      
          const signedTx = await signTransaction(tx);
          console.log("Funding Tx Instructions:", signedTx.instructions.map(i => i.programId.toBase58()));
          const signature = await connection.sendRawTransaction(signedTx.serialize(), {
            skipPreflight: true, // Skip simulation as before
            preflightCommitment: "finalized",
          });
          await connection.confirmTransaction(
            { signature, blockhash, lastValidBlockHeight },
            "finalized"
          );
      
          const funderInfoData = {
            equipmentPda,
            funderPubkey: wallet.publicKey.toBase58(),
            quantity,
            minimumDeposit: minimumAmount / 1e6,
            durationSeconds,
            funderPrice,
          };
      
          await axios.post(`${apiUrl}/funders`, funderInfoData, {
            headers: { 'Content-Type': 'application/json' },
          });
      
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
            const offChainData = apiResponse.data;

            const equipmentPda = new PublicKey(offChainData.equipmentPda);

            const equipmentAccount = await program.account.equipment.fetch(equipmentPda);
            return {
                onChain: {
                    equipmentPda: equipmentPda.toBase58(),
                    equipmentAccount,
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

            const enrichedEquipments = await Promise.all(
                offChainEquipments.map(async (equipment: any) => {
                    const equipmentPda = new PublicKey(equipment.equipmentPda);
                    const equipmentAccount = await program.account.equipment.fetch(equipmentPda);
                    return {
                        offChain: equipment,
                        onChain: {
                            equipmentPda: equipmentPda.toBase58(),
                            equipmentAccount,
                        },
                    };
                })
            );

            return {
                vendorPda: offChainVendor.vendorPda,
                equipments: enrichedEquipments,
            };
        },
        enabled: !!publicKey && connected,
    });

    return {
        initializeEquipment,
        fundEquipment,
        getEquipment,
        getAllVendorEquipment,
    };
}