use anchor_lang::prelude::*;
use crate::state::marketplace::Marketplace;

#[derive(Accounts)]
#[instruction(name: String, uri: String)]
pub struct CreateMarketplace<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 32 + 64 + 64,
        seeds = [crate::constants::MARKETPLACE_SEED, authority.key().as_ref()],
        bump
    )]
    pub marketplace: Account<'info, Marketplace>,

    #[account(
        mut,
        seeds = [
            crate::constants::MARKETPLACE_COLLECTION_SEED,
            marketplace.key().as_ref()
        ],
        bump,
    )]
    /// CHECK: This account is initialized in the instruction
    pub marketplace_collection: UncheckedAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,

    /// CHECK: This is the Metaplex Core program
    #[account(address = mpl_core::ID)]
    pub mpl_core_program: UncheckedAccount<'info>,

    pub rent: Sysvar<'info, Rent>,
}