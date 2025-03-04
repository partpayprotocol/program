use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, TokenAccount, Token, TransferChecked}
};
use crate::{
    state::{contract::BNPLContract, equipment::Equipment, vendor::Vendor},
    errors::ErrorCode,
};

#[derive(Accounts)]
pub struct MakePayment<'info> {
    #[account(mut)]
    pub contract: Account<'info, BNPLContract>,
    #[account(mut)]
    pub equipment: Account<'info, Equipment>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub usdc_mint: Account<'info, Mint>,
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub payee_token_account: Account<'info, TokenAccount>,
    pub vendor: Account<'info, Vendor>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn make_payment(ctx: Context<MakePayment>, payment_amount: u64) -> Result<()> {
    let contract = &mut ctx.accounts.contract;
    let equipment = &mut ctx.accounts.equipment;

    require!(contract.borrower == ctx.accounts.buyer.key(), ErrorCode::UnauthorizedBuyer);
    require!(!contract.is_completed, ErrorCode::ContractAlreadyCompleted);

    let payee_key = contract.payee;
    require!(
        payee_key == equipment.vendor || equipment.funders.iter().any(|f| f.funder == payee_key && f.quantity > 0),
        ErrorCode::InvalidPayee
    );

    let remaining_amount = contract.total_amount - contract.amount_paid;
    require!(payment_amount <= remaining_amount, ErrorCode::Overpayment);

    let cpi_accounts = TransferChecked {
        from: ctx.accounts.buyer_token_account.to_account_info(),
        to: ctx.accounts.payee_token_account.to_account_info(),
        mint: ctx.accounts.usdc_mint.to_account_info(),
        authority: ctx.accounts.buyer.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    
    token::transfer_checked(
        cpi_ctx,
        payment_amount,
        ctx.accounts.usdc_mint.decimals
    )?;

    contract.amount_paid += payment_amount;
    contract.paid_installments += 1;
    contract.last_payment_date = Clock::get()?.unix_timestamp;

    if contract.amount_paid >= contract.total_amount {
        contract.is_completed = true;
        contract.credit_score_delta += 10;
    }

    Ok(())
}