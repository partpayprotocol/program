use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use mpl_core::instructions::CreateCollectionV2Builder;

use crate::{
    errors::ErrorCode,
    utils::validation::{validate_name, validate_uri},
};
use super::structs::CreateMarketplace;

pub fn create_marketplace(
    ctx: Context<CreateMarketplace>,
    name: String,
    uri: String,
) -> Result<()> {
    msg!("Starting create_marketplace function");
    
    validate_name(&name)?;
    validate_uri(&uri)?;

    let create_collection_ix = CreateCollectionV2Builder::new()
        .collection(ctx.accounts.marketplace_collection.key())
        .update_authority(Some(ctx.accounts.authority.key()))
        .payer(ctx.accounts.payer.key())
        .system_program(ctx.accounts.system_program.key())
        .name(name.clone())
        .uri(uri.clone())
        .plugins(vec![])
        .instruction();

    let marketplace_key = ctx.accounts.marketplace.key();
    let collection_seeds = &[
        crate::constants::MARKETPLACE_COLLECTION_SEED,
        marketplace_key.as_ref(),
        &[ctx.bumps.marketplace_collection],
    ];
    let signer_seeds = &[&collection_seeds[..]];

    msg!("Invoking Metaplex Core program");
    invoke_signed(
        &create_collection_ix,
        &[
            ctx.accounts.marketplace_collection.to_account_info(),
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

    let marketplace = &mut ctx.accounts.marketplace;
    marketplace.authority = ctx.accounts.authority.key();
    marketplace.collection = ctx.accounts.marketplace_collection.key();
    marketplace.name = name;
    marketplace.uri = uri;

    msg!("Marketplace created successfully");
    Ok(())
}