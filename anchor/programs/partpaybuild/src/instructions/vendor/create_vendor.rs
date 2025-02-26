use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use mpl_core::{instructions::CreateCollectionV2Builder, ID as MPL_CORE_ID};

use crate::{
    constants::{VENDOR_COLLECTION_SEED, VENDOR_SEED},
    errors::ErrorCode,
    state::vendor::{Vendor, VendorStatus},
    utils::validation::{validate_name, validate_uri},
};

#[derive(Accounts)]
#[instruction(
    name: String, 
    uri: String, 
    unique_id: Pubkey,
    collection_unique_id: Pubkey
)]
pub struct CreateVendor<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 32 + 64 + 64 + 8 + 32 + 32,
        seeds = [VENDOR_SEED, authority.key().as_ref(), unique_id.as_ref()],
        bump
    )]
    pub vendor: Account<'info, Vendor>,
    #[account(
        mut,
        seeds = [VENDOR_COLLECTION_SEED, vendor.key().as_ref(), collection_unique_id.as_ref()],
        bump,
    )]
    /// CHECK: This account is initialized in the CPI call
    pub vendor_collection: UncheckedAccount<'info>,
    /// The authority that signs the transaction
     pub authority: Signer<'info>,
    /// The payer of the transaction fees
     #[account(mut)]
     pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: This is the Metaplex Core program
    #[account(address = MPL_CORE_ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn create_vendor(
    ctx: Context<CreateVendor>,
    name: String,
    uri: String,
    unique_id: Pubkey,
    collection_unique_id: Pubkey,
) -> Result<()> {
    msg!("Starting create_vendor function");

    validate_name(&name)?;
    validate_uri(&uri)?;

    let create_collection_ix = CreateCollectionV2Builder::new()
        .collection(ctx.accounts.vendor_collection.key())
        .update_authority(Some(ctx.accounts.authority.key()))
        .payer(ctx.accounts.payer.key())
        .system_program(ctx.accounts.system_program.key())
        .name(name.clone())
        .uri(uri.clone())
        .plugins(vec![])
        .instruction();

    let vendor_key = ctx.accounts.vendor.key();
    let collection_seeds = &[
        VENDOR_COLLECTION_SEED,
        vendor_key.as_ref(),
        collection_unique_id.as_ref(),
        &[ctx.bumps.vendor_collection],
    ];
    let signer_seeds = &[&collection_seeds[..]];

    msg!("Invoking Metaplex Core program for vendor collection");
    invoke_signed(
        &create_collection_ix,
        &[
            ctx.accounts.vendor_collection.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.mpl_core_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
        signer_seeds,
    )
    .map_err(|e| {
        msg!("Error invoking Metaplex Core program: {:?}", e);
        error!(ErrorCode::MetaplexError)
    })?;

    let vendor = &mut ctx.accounts.vendor;
    vendor.authority = ctx.accounts.authority.key();
    vendor.collection = ctx.accounts.vendor_collection.key();
    vendor.name = name;
    vendor.uri = uri;
    vendor.unique_id = unique_id;
    vendor.collection_unique_id = collection_unique_id;
    vendor.marketplace = None;
    vendor.status = VendorStatus::Active;
    vendor.equipment_count = 0;

    msg!("Vendor created successfully");
    Ok(())
}
