'use client'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useCluster } from '../context/cluster-data-access'
import { BorrowerArgs } from '@/app/types/borrower'
import { usePartpayProgram } from './usePartpayProgram'
import { useWallet } from '@solana/wallet-adapter-react'
import { apiUrl } from '../utils/constant'
import axios from 'axios'

export function useBorrowerAccount() {
  const { cluster } = useCluster();
  const { program } = usePartpayProgram();
  const { publicKey, signTransaction, connected } = useWallet();

  const initializeBorrower = useMutation({
    mutationKey: ['partpay', 'initialize-borrower', { cluster }],
    mutationFn: async ({ wallet, buyerPublicKey }: BorrowerArgs) => {
      if (!publicKey || !signTransaction || !connected) {
        throw new Error('Wallet not connected');
      }

      const [borrowerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("borrower"), buyerPublicKey.toBuffer()],
        program.programId
      );
      const [creditScorePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("credit_score"), borrowerPda.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .initializeBorrower()
        .accounts({
          borrower: borrowerPda,
          authority: wallet.publicKey,
          creditScore: creditScorePda,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      const { blockhash } = await program.provider.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet.publicKey;

      const signedTx = await signTransaction(tx);
      const signature = await program.provider.connection.sendRawTransaction(signedTx.serialize());
      await program.provider.connection.confirmTransaction(signature);

      const borrowerData = {
        borrowerPda: borrowerPda.toBase58(),
        creditScorePda: creditScorePda.toBase58(),
        authority: wallet.publicKey.toBase58()
      };

      await axios.post(`${apiUrl}/borrowers`, borrowerData, {
        headers: { 'Content-Type': 'application/json' }
      });

      return signature;
    },
    onSuccess: () => {
      toast.success("initailize successfully...")
    },
    onError: (error) => {
      toast.error(`Failed to initialize borrower: ${error.message}`);
    },
  });


  const getBorrower = useQuery({
    queryKey: ['borrower', 'fetch', publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      const response = await axios.get(`${apiUrl}/borrowers/${publicKey.toBase58()}`);
      return response.data;
    },
    enabled: !!publicKey && connected,
  });
  return {
    initializeBorrower,
    getBorrower
  };
}

export function viewBorrowerScore({ buyerPublicKey }: BorrowerArgs) {
  const { program } = usePartpayProgram();

  const queryCreditScore = useQuery({
    queryKey: ['credit-score', 'fetch', buyerPublicKey.toString()],
    queryFn: async () => {
      const [borrowerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('borrower'), buyerPublicKey.toBuffer()],
        program.programId
      );

      const [creditScorePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('credit_score'), borrowerPda.toBuffer()],
        program.programId
      );

      const creditScore = await program.account.creditScore.fetch(creditScorePda);

      const borrowerResponse = await axios.get(`${apiUrl}/borrowers/${buyerPublicKey.toBase58()}`);
      const borrowerData = borrowerResponse.data;

      return {
        borrowerPda,
        creditScorePda,
        creditScore: creditScore.score,
        borrowerData
      };
    },
    enabled: !!buyerPublicKey,
  });

  return queryCreditScore;
}