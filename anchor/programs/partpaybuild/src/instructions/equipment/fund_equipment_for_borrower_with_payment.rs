use crate::{
    errors::ErrorCode,
    state::{
        equipment::{DeliveryStatus, Equipment, EquipmentStatus, FunderInfo, PaymentPreference},
        escrow::Escrow,
        vendor::Vendor,
    },
};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount, Transfer},
};

#[derive(Accounts)]
#[instruction(quantity_to_fund: u64, borrower: Pubkey, unique_id: Pubkey)]
pub struct FundEquipmentForBorrowerWithPayment<'info> {
    #[account(
        init,
        payer = funder,
        space = Escrow::LEN,
        seeds = [b"escrow", equipment.key().as_ref(), borrower.as_ref(), unique_id.as_ref()],
        bump
    )]
    pub escrow: Box<Account<'info, Escrow>>,
    #[account(
        init_if_needed,
        payer = funder,
        associated_token::mint = usdc_mint,
        associated_token::authority = escrow
    )]
    pub escrow_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub equipment: Box<Account<'info, Equipment>>,
    #[account(mut)]
    pub vendor: Box<Account<'info, Vendor>>,
    #[account(mut)]
    pub funder: Signer<'info>,
    pub usdc_mint: Account<'info, Mint>,
    #[account(mut)]
    pub funder_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vendor_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn fund_equipment_for_borrower_with_payment(
    ctx: Context<FundEquipmentForBorrowerWithPayment>,
    quantity_to_fund: u64,
    borrower: Pubkey,
    minimum_deposit: u64,
    duration_seconds: i64,
    _unique_id: Pubkey,
) -> Result<()> {
    msg!("Equipment: {}", ctx.accounts.equipment.key());
    msg!("Funder: {}", ctx.accounts.funder.key());
    msg!("Borrower: {}", borrower);
    msg!("Unique ID: {}", _unique_id);
    msg!("Escrow: {}", ctx.accounts.escrow.key());

    let equipment = &mut ctx.accounts.equipment;
    let available_to_fund =
        equipment.total_quantity - equipment.funded_quantity - equipment.sold_quantity;
    require!(
        quantity_to_fund <= available_to_fund,
        ErrorCode::InsufficientQuantity
    );
    require!(
        equipment.status == EquipmentStatus::Available || 
        equipment.status == EquipmentStatus::Reserved || 
        equipment.status == EquipmentStatus::Funded,
        ErrorCode::EquipmentNotAvailable
    );

    let total_payment = equipment
        .price
        .checked_mul(quantity_to_fund)
        .ok_or(ErrorCode::MathOverflow)?;
    anchor_spl::token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.funder_token_account.to_account_info(),
                to: ctx.accounts.escrow_token_account.to_account_info(),
                authority: ctx.accounts.funder.to_account_info(),
            },
        ),
        total_payment,
    )?;

    equipment.funded_quantity += quantity_to_fund;
    equipment.funders.push(Box::new(FunderInfo {
        funder: ctx.accounts.funder.key(),
        quantity: quantity_to_fund,
        minimum_deposit,
        duration_seconds,
        borrower: Some(borrower),
        escrow: ctx.accounts.escrow.key(),
    }));
    equipment.payment_preference = PaymentPreference::Part;
    equipment.status = EquipmentStatus::Reserved;
    equipment.delivery_status = DeliveryStatus::Pending;

    let escrow = &mut ctx.accounts.escrow;

    escrow.equipment = ctx.accounts.equipment.key();
    escrow.funder = ctx.accounts.funder.key();
    escrow.vendor = ctx.accounts.vendor.key();
    escrow.amount = total_payment;
    escrow.is_released = false;
    Ok(())
}
