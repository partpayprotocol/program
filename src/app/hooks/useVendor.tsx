'use client'
import { Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useCluster } from '../context/cluster-data-access'
import { usePartpayProgram } from './usePartpayProgram'
import { useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'
import { VendorArgs } from '../types/vendor'
import { apiUrl, MPL_CORE_PROGRAM_ID } from '../utils/constant'

export function useVendorAccount() {
    const { cluster } = useCluster();
    const { program } = usePartpayProgram();
    const { publicKey, signTransaction, connected } = useWallet();

    const initializeVendor = useMutation({
        mutationKey: ['partpay', 'create-vendor', { cluster }],
        mutationFn: async ({ publicKey, metadata}: VendorArgs) => {
            if (!publicKey || !signTransaction || !connected) {
                throw new Error('Wallet not connected');
            }

            const response = await axios.get(`${apiUrl}/metadata/upload/${metadata}`);
            const uri = response.data;

            const vendorUniqueId = Keypair.generate().publicKey;
            const vendorCollectionUniqueId = Keypair.generate().publicKey;

            const [vendorPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("vendor"), publicKey.toBuffer(), vendorUniqueId.toBuffer()],
                program.programId
            );
            const [collectionPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("vendor_collection"), vendorPDA.toBuffer(), vendorCollectionUniqueId.toBuffer()],
                program.programId
            );

            const txBuilder = await program.methods
                .createVendor(metadata.name, uri, vendorUniqueId, vendorCollectionUniqueId)
                .accounts({
                    vendor: vendorPDA,
                    vendorCollection: collectionPDA,
                    authority: publicKey,
                    payer: publicKey,
                    systemProgram: SystemProgram.programId,
                    mplCoreProgram: MPL_CORE_PROGRAM_ID,
                    rent: SYSVAR_RENT_PUBKEY,
                });

            const { blockhash } = await program.provider.connection.getLatestBlockhash();
            const tx = await txBuilder.transaction();
            tx.recentBlockhash = blockhash;
            tx.feePayer = publicKey;

            const signedTx = await signTransaction(tx);
            const signature = await program.provider.connection.sendRawTransaction(signedTx.serialize());
            await program.provider.connection.confirmTransaction(signature, 'finalized');

            const vendorData = {
                vendorUniqueId: vendorUniqueId.toBase58(),
                vendorCollectionId: vendorCollectionUniqueId.toBase58(),
                vendorPda: vendorPDA.toBase58(),
                vendorPubkey: publicKey.toBase58(),
                collectionPda: collectionPDA.toBase58(),
                uri,
                name: metadata.name,
                authority: publicKey.toBase58(),
                additionInfo: metadata
            };

            await axios.post(`${apiUrl}/vendors`, vendorData, {
                headers: { 'Content-Type': 'application/json' }
            });

            return signature;
        },
        onSuccess: (signature) => {
            toast.success("Vendor initialized successfully!");
            transactionToast(signature);
        },
        onError: (error) => {
            toast.error(`Failed to initialize vendor: ${error.message}`);
        },
    });

    const getVendor = useQuery({
        queryKey: ['vendor', 'fetch', publicKey?.toBase58()],
        queryFn: async () => {
            if (!publicKey) {
                throw new Error('Wallet not connected');
            }

            const response = await axios.get(`${apiUrl}/vendors/${publicKey.toBase58()}`);
            return response.data;
        },
        enabled: !!publicKey && connected,
    });

    return {
        initializeVendor,
        getVendor,
    };
}

// Helper function for transaction notifications
function transactionToast(signature: string) {
    const { cluster } = useCluster();
    toast.success(
        <div>
            Transaction successful!{' '}
            <a href={`https://explorer.solana.com/tx/${signature}?cluster=${cluster.network}`} target="_blank" rel="noopener noreferrer">
                View on Explorer
            </a>
        </div>
    );
}