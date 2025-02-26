use anchor_lang::prelude::*;
use crate::state::credit_score::CreditScore;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct ViewCreditScore<'info> {
    #[account(
        seeds = [
            CreditScore::SEED_PREFIX, 
            borrower.key().as_ref()
        ],
        bump = credit_score.bump,
        constraint = credit_score.borrower == borrower.key() 
            @ ErrorCode::BorrowerMismatch
    )]
    pub credit_score: Account<'info, CreditScore>,
    /// CHECK: This is not mutable or signed as we're just reading
    pub borrower: AccountInfo<'info>,
}

pub fn view_credit_score(ctx: Context<ViewCreditScore>) -> Result<(u64, u64)> {
    let credit_score = &ctx.accounts.credit_score;
    
    let scale_factor = CreditScore::SCALE_FACTOR; 
    let integer_part = credit_score.score / scale_factor;
    let decimal_part = credit_score.score % scale_factor; 

    Ok((integer_part, decimal_part))
}
