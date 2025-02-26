'use client'
import { getPartpayProgram, getPartpayProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../../components/cluster/cluster-data-access'
import { useAnchorProvider } from '../../components/solana/solana-provider'

export function usePartpayProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getPartpayProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getPartpayProgram(provider, programId), [provider, programId])

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  return {
    program,
    programId,
    getProgramAccount,
  }
}