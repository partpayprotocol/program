use anchor_lang::prelude::*;
use crate::state::vendor::Vendor;

#[derive(Accounts)]
pub struct GetVendor<'info> {
    #[account(mut)]
    pub vendor: Account<'info, Vendor>,
}

pub fn get_vendor(ctx: Context<GetVendor>) -> Result<()> {
    let vendor = &ctx.accounts.vendor;
    
    if let Some(marketplace) = vendor.marketplace {
        msg!("Marketplace: {}", marketplace);
    } else {
        msg!("Not associated with a marketplace");
    }

    Ok(())
}