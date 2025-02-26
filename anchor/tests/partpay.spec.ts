import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js'
import { Partpay } from '../target/types/partpay'

describe('partpaybuild', () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Partpaybuild as Program<Partpay>
  const connection = new Connection("https://api.devnet.solana.com", "finalized");
  const partpayKeypair = Keypair.generate()
  anchor.setProvider(new anchor.AnchorProvider(connection, payer, { commitment: "finalized" }));

  const buyerPrivateKey = new Uint8Array([])
  const buyer = Keypair.fromSecretKey(buyerPrivateKey)

  it("initialize borrower", async () => {
    const [borrowerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("borrower"), buyer.publicKey.toBuffer()],
      program.programId
    );
    const [creditScorePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("credit_score"), borrowerPda.toBuffer()],
      program.programId
    );
    const tx = await program.methods.initializeBorrower()
      .accounts({
        borrower: borrowerPda,
        authority: buyer.publicKey,
        credit_score: creditScorePda,
        system_program: SystemProgram.programId,
      })
      .signers([buyer])
      .transaction();

    const signature = await program.provider.sendAndConfirm(tx, [buyer]);
  });
})
