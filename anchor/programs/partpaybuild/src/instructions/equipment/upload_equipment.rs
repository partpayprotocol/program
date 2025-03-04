use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use mpl_core::{instructions::CreateV2Builder, types::DataState, ID as MPL_CORE_ID};

use crate::{
    constants::EQUIPMENT_SEED,
    state::equipment::{Equipment, EquipmentStatus, PaymentPreference},
    state::vendor::Vendor,
    utils::validation::{validate_duration, validate_price},
    errors::ErrorCode,
};

#[derive(Accounts)]
#[instruction(
    name: String,
    uri: String,
    price: u64,
    total_quantity: u64,
    unique_id: Pubkey,
    minimum_deposit: u64,
    max_duration_seconds: i64,
    payment_preference: PaymentPreference
)]
pub struct UploadEquipment<'info> {
    #[account(
        init,
        payer = payer,
        space = Equipment::LEN,
        seeds = [EQUIPMENT_SEED, vendor.key().as_ref(), unique_id.as_ref(), name.as_bytes()],
        bump
    )]
    pub equipment: Account<'info, Equipment>,
    /// CHECK: This is a PDA for the equipment asset, initialized by Metaplex
    #[account(
        mut,
        seeds = [b"equipment_asset", equipment.key().as_ref()],
        bump
    )]
    pub equipment_asset: UncheckedAccount<'info>,
    #[account(mut)]
    pub vendor: Account<'info, Vendor>,
    /// CHECK: This account is managed by the Metaplex Core program
    #[account(mut)]
    pub vendor_collection: UncheckedAccount<'info>,
    #[account(mut)]
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
    total_quantity: u64,
    unique_id: Pubkey,
    minimum_deposit: u64,
    max_duration_seconds: i64,
    payment_preference: PaymentPreference,
) -> Result<()> {
    msg!("Starting upload_equipment function");

    validate_price(price)?;
    validate_price(minimum_deposit)?;
    validate_duration(max_duration_seconds)?;

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

    let equipment_key = ctx.accounts.equipment.key();
    let asset_seeds = &[
        b"equipment_asset",
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

    let equipment = &mut ctx.accounts.equipment;  
    equipment.vendor = ctx.accounts.vendor.key();
    equipment.asset = ctx.accounts.equipment_asset.key();
    equipment.unique_id = unique_id;
    equipment.name = name.clone();
    equipment.uri = uri.clone();
    equipment.price = price;
    equipment.minimum_deposit = minimum_deposit;
    equipment.max_duration_seconds = max_duration_seconds;
    equipment.payment_preference = payment_preference;
    equipment.total_quantity = total_quantity;
    equipment.funded_quantity = 0;
    equipment.sold_quantity = 0;
    equipment.funded_sold_quantity = 0;
    equipment.status = EquipmentStatus::Available;
    equipment.funders = Vec::new();

    ctx.accounts.vendor.equipments.push(equipment.key()); 
    ctx.accounts.vendor.equipment_count += total_quantity;
    Ok(())
}