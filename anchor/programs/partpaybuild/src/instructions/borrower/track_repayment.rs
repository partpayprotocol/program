use anchor_lang::prelude::*;
use crate::{
    state::{
        borrower::Borrower, 
        contract::BNPLContract, 
        credit_score::CreditScore,
        equipment::Equipment,
        vendor::Vendor,
    },
    errors::ErrorCode,
};

#[derive(Accounts)]
pub struct TrackRepayment<'info> {
    #[account(mut)]
    pub borrower: Account<'info, Borrower>,
    #[account(mut)]
    pub contract: Account<'info, BNPLContract>,
    pub vendor: Account<'info, Vendor>,
    pub equipment: Account<'info, Equipment>,
    #[account(mut)]
    pub credit_score: Account<'info, CreditScore>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn track_repayment(
    ctx: Context<TrackRepayment>,
    amount: u64,
    on_time_score: f64,
    contract_unique_id: Pubkey,
) -> Result<()> {
    let contract = &mut ctx.accounts.contract;
    let credit_score = &mut ctx.accounts.credit_score;

    require!(contract.borrower == ctx.accounts.authority.key(), ErrorCode::BorrowerMismatch);
    require!(contract.contract_unique_id == contract_unique_id, ErrorCode::InvalidContract);

    credit_score.borrower = ctx.accounts.authority.key();
    if on_time_score > 0.0 {
        credit_score.on_time_payments += 1;
        credit_score.score += (amount / 1_000_000) as u64;
    } else {
        credit_score.late_payments += 1;
        credit_score.score = credit_score.score.saturating_sub((amount / 1_000_000) as u64);
    }

    contract.credit_score_delta = if on_time_score > 0.0 { 10 } else { -10 };
    Ok(())
}