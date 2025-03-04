use anchor_lang::prelude::*;
use crate::state::{
    borrower::Borrower,
    credit_score::CreditScore
};

#[derive(Accounts)]
pub struct InitializeBorrower<'info> {
    #[account(
        init,
        seeds = [Borrower::SEED_PREFIX, authority.key().as_ref()],
        bump,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 8 + 8 + 8 + 1 + 16
    )]
    pub borrower: Account<'info, Borrower>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        seeds = [CreditScore::SEED_PREFIX, borrower.key().as_ref()],
        bump,
        payer = authority,
        space = 8 + 32 + 4 + 4 + 4 + 8 + 1
    )]
    pub credit_score: Account<'info, CreditScore>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_borrower(ctx: Context<InitializeBorrower>) -> Result<()> {
    let borrower = &mut ctx.accounts.borrower;
    let credit_score_key = ctx.accounts.credit_score.key();

    // Initialize borrower
    borrower.authority = ctx.accounts.authority.key();
    borrower.borrower_pubkey = borrower.key();
    borrower.credit_score = credit_score_key;
    borrower.total_loans = 0;
    borrower.total_repayments = 0;
    borrower.last_repayment_date = 0;
    borrower.bump = ctx.bumps.borrower;

    let credit_score = &mut ctx.accounts.credit_score;
    credit_score.borrower = borrower.key();
    credit_score.on_time_payments = 0;
    credit_score.late_payments = 0;
    credit_score.defaults = 0;
    credit_score.score = 0;
    credit_score.bump = ctx.bumps.credit_score;

    Ok(())
}