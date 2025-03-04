// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import PartpayIDL from '../target/idl/partpay.json'
import type { Partpay } from '../target/types/partpay'

// Re-export the generated IDL and type
export { Partpay, PartpayIDL }

// The programId is imported from the program IDL.
export const PARTPAY_PROGRAM_ID = new PublicKey(PartpayIDL.address)

// This is a helper function to get the Partpay Anchor program.
export function getPartpayProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...PartpayIDL, address: address ? address.toBase58() : PartpayIDL.address } as Partpay, provider)
}

// This is a helper function to get the program ID for the Partpay program depending on the cluster.
export function getPartpayProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      return new PublicKey('PARcfURNnk9kGkMieyTHEjsFKbRrnP5eRL7iZW9QqXY')
    case 'mainnet-beta':
    default:
      return PARTPAY_PROGRAM_ID
  }
}
