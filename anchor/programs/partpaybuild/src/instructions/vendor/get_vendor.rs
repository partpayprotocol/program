use anchor_lang::prelude::*;
use crate::state::vendor::Vendor;

#[derive(Accounts)]
pub struct GetVendor<'info> {
    #[account(mut)]
    pub vendor: Account<'info, Vendor>,
}

pub fn get_vendor(ctx: Context<GetVendor>) -> Result<()> {
    let vendor = &ctx.accounts.vendor;
    
    // msg!("Vendor Details:");
    // msg!("Name: {}", vendor.name);
    // msg!("URI: {}", vendor.uri);
    // msg!("Equipment Count: {}", vendor.equipment_count);
    // msg!("Authority: {}", vendor.authority);
    // msg!("Collection: {}", vendor.collection);
    // msg!("Unique ID: {}", vendor.unique_id);
    
    if let Some(marketplace) = vendor.marketplace {
        msg!("Marketplace: {}", marketplace);
    } else {
        msg!("Not associated with a marketplace");
    }

    Ok(())
}