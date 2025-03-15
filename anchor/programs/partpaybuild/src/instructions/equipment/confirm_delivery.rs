use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer, Mint};
use crate::{
    state::{
        equipment::{Equipment, DeliveryStatus},
        escrow::Escrow,
        contract::BNPLContract,
    },
    errors::ErrorCode,
    constants::CONTRACT_SEED
};


#[derive(Accounts)]
#[instruction(unique_id: Pubkey)]
pub struct ConfirmDelivery<'info> {
    #[account(mut, has_one = vendor)]
    pub equipment: Account<'info, Equipment>,
    #[account(
        mut,
        seeds = [b"escrow", equipment.key().as_ref(), borrower.key().as_ref(), unique_id.as_ref()],
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
    #[account(
        mut,
        seeds = [CONTRACT_SEED, borrower.key().as_ref(), equipment.key().as_ref(), unique_id.as_ref()],
        bump,
        has_one = borrower,
        has_one = equipment,
        has_one = escrow
    )]
    pub contract: Account<'info, BNPLContract>,
    #[account(mut)]
    pub borrower: Signer<'info>,
    #[account(mut)]
    pub payee_token_account: Account<'info, TokenAccount>,
    /// CHECK: Validated via contract.payee
    pub payee: AccountInfo<'info>,
    /// CHECK: Used only for equipment validation
    pub vendor: AccountInfo<'info>,
    pub usdc_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

pub fn confirm_delivery(ctx: Context<ConfirmDelivery>, unique_id: Pubkey) -> Result<()> {
    let equipment = &mut ctx.accounts.equipment;
    let escrow = &mut ctx.accounts.escrow;
    let contract = &ctx.accounts.contract;

    require!(contract.borrower == ctx.accounts.borrower.key(), ErrorCode::Unauthorized);
    require!(equipment.delivery_status == DeliveryStatus::Pending, ErrorCode::InvalidDeliveryStatus);
    require!(!escrow.is_released, ErrorCode::FundsAlreadyReleased);
    require!(contract.payee == ctx.accounts.payee.key(), ErrorCode::InvalidPayee);

    anchor_spl::token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.payee_token_account.to_account_info(),
                authority: escrow.to_account_info(),
            },
        ).with_signer(&[&[
            b"escrow",
            equipment.key().as_ref(),
            ctx.accounts.borrower.key().as_ref(),
            unique_id.as_ref(),
            &[ctx.bumps.escrow]
        ]]),
        escrow.amount,
    )?;

    equipment.delivery_status = DeliveryStatus::Delivered;
    escrow.is_released = true;
    Ok(())
}