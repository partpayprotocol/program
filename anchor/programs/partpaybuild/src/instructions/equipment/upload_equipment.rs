use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use mpl_core::{
    instructions::CreateV2Builder,
    types::DataState,
    ID as MPL_CORE_ID,
};

use crate::{
    state::equipment::{Equipment, EquipmentStatus},
    state::vendor::Vendor,
    constants::{EQUIPMENT_SEED, EQUIPMENT_ASSET_SEED},
    errors::ErrorCode,
    utils::validation::{
        validate_price,
        validate_duration,
    },
};

#[derive(Accounts)]
#[instruction(name: String, uri: String, price: u64, quantity: u64, unique_id: Pubkey, minimum_deposit: u64, max_duration_seconds: i64)]
pub struct UploadEquipment<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 32 + 32 + 4 + name.len() + 4 + uri.len() + 8 + 8 + 8 + 1 + 8 + 8,
        seeds = [EQUIPMENT_SEED, vendor.key().as_ref(), unique_id.as_ref(), name.as_bytes()],
        bump
    )]
    pub equipment: Account<'info, Equipment>,
    /// CHECK: This account is created and managed by the Metaplex Core program
    #[account(
        mut,
        seeds = [EQUIPMENT_ASSET_SEED, equipment.key().as_ref()],
        bump
    )]
    pub equipment_asset: UncheckedAccount<'info>,
    #[account(mut)]
    pub vendor: Account<'info, Vendor>,
    /// CHECK: This account is managed by the Metaplex Core program
    #[account(mut)]
    pub vendor_collection: UncheckedAccount<'info>,
    pub authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: This is the Metaplex Core program
    #[account(address = MPL_CORE_ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn upload_equipment(
    ctx: Context<UploadEquipment>,
    name: String,
    uri: String,
    price: u64,
    quantity: u64,
    unique_id: Pubkey,
    minimum_deposit: u64,
    max_duration_seconds: i64,
) -> Result<()> {
    msg!("Starting upload_equipment function");

    validate_price(price)?;
    validate_price(minimum_deposit)?;
    validate_duration(max_duration_seconds)?;

    // Create Metaplex asset
    let create_equipment_ix = CreateV2Builder::new()
        .asset(ctx.accounts.equipment_asset.key())
        .collection(Some(ctx.accounts.vendor_collection.key()))
        .authority(Some(ctx.accounts.authority.key()))
        .payer(ctx.accounts.payer.key())
        .owner(Some(ctx.accounts.vendor.key()))
        .system_program(ctx.accounts.system_program.key())
        .data_state(DataState::AccountState)
        .name(name.clone())
        .uri(uri.clone())
        .plugins(vec![])
        .external_plugin_adapters(vec![])
        .instruction();

    msg!("Prepared CreateV2 instruction for equipment");

    let equipment_key = ctx.accounts.equipment.key();
    let asset_seeds = &[
        EQUIPMENT_ASSET_SEED,
        equipment_key.as_ref(),
        &[ctx.bumps.equipment_asset],
    ];
    let signer_seeds = &[&asset_seeds[..]];

    invoke_signed(
        &create_equipment_ix,
        &[
            ctx.accounts.equipment_asset.to_account_info(),
            ctx.accounts.vendor_collection.to_account_info(),
            ctx.accounts.vendor.to_account_info(),
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

    msg!("Metaplex Core program invocation successful for equipment asset");

    let equipment = &mut ctx.accounts.equipment;
    equipment.vendor = ctx.accounts.vendor.key();
    equipment.asset = ctx.accounts.equipment_asset.key();
    equipment.name = name;
    equipment.uri = uri;
    equipment.price = price;
    equipment.minimum_deposit = minimum_deposit;
    equipment.max_duration_seconds = max_duration_seconds;
    equipment.status = EquipmentStatus::Available;
    equipment.sold_count = 0;
    equipment.quantity = quantity;
    equipment.unique_id = unique_id;

    ctx.accounts.vendor.equipments.push(equipment.key());

    ctx.accounts.vendor.equipment_count = ctx
        .accounts
        .vendor
        .equipment_count
        .checked_add(1)
        .ok_or(ErrorCode::MathOverflow)?;

    msg!("Equipment account updated");

    Ok(())
}