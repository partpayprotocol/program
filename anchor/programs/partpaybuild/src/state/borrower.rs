use anchor_lang::prelude::*;

#[account]
pub struct Borrower {
    pub authority: Pubkey,
    pub borrower_pubkey: Pubkey,          
    pub credit_score: Pubkey,
    pub total_loans: u64,      
    pub total_repayments: u64, 
    pub last_repayment_date: i64, 
    pub bump: u8,
}

impl Borrower {
    pub const SEED_PREFIX: &'static [u8] = b"borrower";
}