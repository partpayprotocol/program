use anchor_lang::prelude::*;

#[account]
pub struct Marketplace {
    pub authority: Pubkey,
    pub collection: Pubkey,
    pub name: String,
    pub uri: String,
}