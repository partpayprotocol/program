use anchor_lang::prelude::*;
use crate::{
    state::{equipment::Equipment, vendor::Vendor},
    errors::ErrorCode,
    utils::validation::{validate_name, validate_uri, validate_price},
};

#[derive(Accounts)]
pub struct UpdateEquipment<'info> {
    #[account(
        mut,
        has_one = vendor,
        constraint = equipment.vendor == vendor.key()
    )]
    pub equipment: Account<'info, Equipment>,
    
    pub vendor: Account<'info, Vendor>,
    
    #[account(
        constraint = authority.key() == vendor.authority,
        constraint = authority.key() == vendor.authority @ ErrorCode::InvalidMarketplaceAuthority
    )]
    pub authority: Signer<'info>,
}

pub fn update_equipment(
    ctx: Context<UpdateEquipment>,
    name: Option<String>,
    uri: Option<String>,
    price: Option<u64>,
) -> Result<()> {
    msg!("Starting update_equipment function");
    
    let equipment = &mut ctx.accounts.equipment;

    // Update and validate name if provided
    if let Some(new_name) = name {
        validate_name(&new_name)?;
        equipment.name = new_name;
        msg!("Updated equipment name");
    }

    // Update and validate URI if provided
    if let Some(new_uri) = uri {
        validate_uri(&new_uri)?;
        equipment.uri = new_uri;
        msg!("Updated equipment URI");
    }

    // Update and validate price if provided
    if let Some(new_price) = price {
        validate_price(new_price)?;
        equipment.price = new_price;
        msg!("Updated equipment price");
    }

    msg!("Equipment update completed successfully");
    msg!("Current equipment details:");
    msg!("Name: {}", equipment.name);
    msg!("URI: {}", equipment.uri);
    msg!("Price: {}", equipment.price);

    Ok(())
}