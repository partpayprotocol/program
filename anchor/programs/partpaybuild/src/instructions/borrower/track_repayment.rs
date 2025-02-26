use anchor_lang::prelude::*;
use crate::constants::CONTRACT_SEED;
use crate::errors::ErrorCode;
use crate::state::{borrower::Borrower, contract::BNPLContract, credit_score::CreditScore};

#[derive(Accounts)]
#[instruction(
    contract_unique_id: Pubkey,
)]
pub struct TrackRepayment<'info> {
    #[account(
        mut,
        seeds = [Borrower::SEED_PREFIX, authority.key().as_ref()],
        bump = borrower.bump,
        has_one = authority,
        has_one = credit_score,
    )]
    pub borrower: Account<'info, Borrower>,
    #[account(
        mut,
        seeds = [CONTRACT_SEED, authority.key().as_ref(), vendor.key().as_ref(), equipment.key().as_ref(), contract_unique_id.as_ref()],
        bump
    )]
    pub contract: Account<'info, BNPLContract>,
    /// CHECK: This is a raw `AccountInfo` because we do not need to deserialize its data.
    pub vendor: AccountInfo<'info>,
    /// CHECK: This is a raw `AccountInfo` because we do not need to deserialize its data.
    pub equipment: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [CreditScore::SEED_PREFIX, borrower.key().as_ref()],
        bump = credit_score.bump
    )]
    pub credit_score: Account<'info, CreditScore>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn track_repayment(
    ctx: Context<TrackRepayment>,
    amount: u64,
    on_time_score: f64,
    _contract_unique_id: Pubkey
) -> Result<()> {
    let borrower = &mut ctx.accounts.borrower;
    let credit_score = &mut ctx.accounts.credit_score;
    let contract = &mut ctx.accounts.contract;
    let clock = Clock::get().map_err(|_| error!(ErrorCode::ClockUnavailable))?;

    require!(amount > 0, ErrorCode::InvalidAmount);

    borrower.total_repayments = borrower
        .total_repayments
        .checked_add(amount)
        .ok_or(ErrorCode::MathOverflow)?;
    borrower.last_repayment_date = Clock::get()?.unix_timestamp;

    let next_payment_due = contract
        .last_payment_date
        .checked_add(contract.installment_frequency.get_duration_seconds())
        .ok_or(ErrorCode::MathOverflow)?;

    let is_on_time = clock.unix_timestamp <= next_payment_due;

    let scaled_score: u32 = (on_time_score * 100.0).round() as u32;

    credit_score.update_score(is_on_time, scaled_score);

    msg!(
        "Payment tracked: Amount={}, OnTime={}, NewScore={}",
        amount,
        is_on_time,
        credit_score.score
    );

    Ok(())
}
