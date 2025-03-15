use anchor_lang::prelude::*;

#[account]
pub struct Escrow {
    pub equipment: Pubkey,
    pub funder: Pubkey,
    pub vendor: Pubkey,
    pub amount: u64,
    pub is_released: bool,
    pub bump: u8,
} 

impl Escrow {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 1 + 1;
}