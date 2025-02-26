'use client'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useCluster } from '../../components/cluster/cluster-data-access'
import { useAnchorProvider } from '../../components/solana/solana-provider'
import { InitializeBorrowerArgs } from '@/app/types/borrower'
import { usePartpayProgram } from './usePartpayProgram'
import { useWallet } from '@solana/wallet-adapter-react'

export function useBorrowerAccount() {
  const { cluster } = useCluster();
  const { program } = usePartpayProgram();
  const { publicKey, signTransaction, connected } = useWallet();

  const initializeBorrower = useMutation({
    mutationKey: ['partpay', 'initialize-borrower', { cluster }],
    mutationFn: async ({ wallet, borrower, creditScore }: InitializeBorrowerArgs) => {
      if (!publicKey || !signTransaction || !connected) {
        throw new Error('Wallet not connected');
      }

      const tx = await program.methods
        .initializeBorrower()
        .accounts({
          borrower,
          authority: wallet.publicKey,
          creditScore,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      const { blockhash } = await program.provider.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet.publicKey;

      const signedTx = await signTransaction(tx);
      const signature = await program.provider.connection.sendRawTransaction(signedTx.serialize()); 
      await program.provider.connection.confirmTransaction(signature);

      return signature;
    },
    onSuccess: () => {
      toast.success("initailize successfully...")
    },
    onError: (error) => {
      toast.error(`Failed to initialize borrower: ${error.message}`);
    },
  });

  return {
    initializeBorrower,
  };
}

// Helper function for transaction notifications
function transactionToast(signature: string) {
  toast.success(
    <div>
      Transaction successful!{' '}
      <a href={`https://explorer.solana.com/tx/${signature}?cluster=${cluster.network}`} target="_blank" rel="noopener noreferrer">
        View on Explorer
      </a>
    </div>
  )
}