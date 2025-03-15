use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer, Mint};
use crate::{
    state::{equipment::{Equipment, DeliveryStatus}, escrow::Escrow},
    errors::ErrorCode,
};

#[derive(Accounts)]
#[instruction(unique_id: Pubkey)]
pub struct ConfirmFundedDelivery<'info> {
    #[account(mut, has_one = vendor)]
    pub equipment: Account<'info, Equipment>,
    #[account(
        mut,
        seeds = [b"escrow", equipment.key().as_ref(), confirmer.key().as_ref(), unique_id.as_ref()],
        bump,
        has_one = equipment
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = escrow
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub confirmer: Signer<'info>,
    #[account(mut)]
    pub payee_token_account: Account<'info, TokenAccount>,
    /// CHECK: Validated via logic
    pub payee: AccountInfo<'info>,
    /// CHECK: Used for equipment validation
    pub vendor: AccountInfo<'info>,
    pub usdc_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

pub fn confirm_funded_delivery(ctx: Context<ConfirmFundedDelivery>, unique_id: Pubkey) -> Result<()> {
    let equipment = &mut ctx.accounts.equipment;

    // Determine expected confirmer and payee
    let is_funder_confirmer = ctx.accounts.escrow.funder == ctx.accounts.confirmer.key();
    let funder_info = equipment.funders
        .iter()
        .find(|f| f.escrow == ctx.accounts.escrow.key())
        .ok_or(ErrorCode::InvalidEscrow)?;

    let expected_payee = if is_funder_confirmer {
        ctx.accounts.escrow.vendor
    } else {
        if funder_info.minimum_deposit > 0 || funder_info.duration_seconds > 0 {
            ctx.accounts.escrow.funder
        } else {
            ctx.accounts.escrow.vendor
        }
    };

    require!(
        ctx.accounts.confirmer.key() == ctx.accounts.escrow.funder || funder_info.borrower == Some(ctx.accounts.confirmer.key()),
        ErrorCode::Unauthorized
    );
    require!(equipment.delivery_status == DeliveryStatus::Pending, ErrorCode::InvalidDeliveryStatus);
    require!(!ctx.accounts.escrow.is_released, ErrorCode::FundsAlreadyReleased);
    require!(ctx.accounts.payee.key() == expected_payee, ErrorCode::InvalidPayee);

    anchor_spl::token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.payee_token_account.to_account_info(),
                authority: ctx.accounts.escrow.to_account_info(),
            },
        ).with_signer(&[&[
            b"escrow",
            equipment.key().as_ref(),
            ctx.accounts.confirmer.key().as_ref(),
            unique_id.as_ref(),
            &[ctx.bumps.escrow]
        ]]),
        ctx.accounts.escrow.amount,
    )?;

    equipment.delivery_status = DeliveryStatus::Delivered;
    ctx.accounts.escrow.is_released = true;

    Ok(())
}