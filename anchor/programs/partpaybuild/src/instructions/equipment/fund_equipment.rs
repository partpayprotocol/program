use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, TokenAccount, Token, TransferChecked}
};
use crate::{
    state::{equipment::{Equipment, PaymentPreference, EquipmentStatus, FunderInfo}, vendor::Vendor},
    errors::ErrorCode,
};

#[derive(Accounts)]
pub struct FundEquipment<'info> {
    #[account(mut)]
    pub equipment: Account<'info, Equipment>,
    #[account(mut)]
    pub vendor: Account<'info, Vendor>,
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

pub fn fund_equipment(
    ctx: Context<FundEquipment>,
    quantity_to_fund: u64,
    minimum_deposit: u64,
    duration_seconds: i64,
    funder_price: u64,
) -> Result<()> {
    let equipment = &mut ctx.accounts.equipment;
    require!(
        equipment.funded_quantity == 0 && 
        matches!(equipment.payment_preference, PaymentPreference::Full | PaymentPreference::Both { .. }),
        ErrorCode::InvalidPaymentPreference
    );
    let available_to_fund = equipment.total_quantity - equipment.funded_quantity - equipment.sold_quantity;
    require!(quantity_to_fund <= available_to_fund, ErrorCode::InsufficientQuantity);
    require!(
        equipment.status == EquipmentStatus::Available || equipment.status == EquipmentStatus::Funded,
        ErrorCode::EquipmentNotAvailable
    );
    require!(funder_price >= equipment.price, ErrorCode::InvalidFunderPrice);

    let total_payment = equipment.price.checked_mul(quantity_to_fund).ok_or(ErrorCode::MathOverflow)?;
    let cpi_accounts = TransferChecked {
        from: ctx.accounts.funder_token_account.to_account_info(),
        to: ctx.accounts.vendor_token_account.to_account_info(),
        mint: ctx.accounts.usdc_mint.to_account_info(),
        authority: ctx.accounts.funder.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    
    token::transfer_checked(
        cpi_ctx,
        total_payment,
        ctx.accounts.usdc_mint.decimals
    )?;

    equipment.funded_quantity += quantity_to_fund;
    equipment.funders.push(FunderInfo {
        funder: ctx.accounts.funder.key(),
        quantity: quantity_to_fund,
        minimum_deposit,
        duration_seconds,
        funder_price,
    });
    equipment.status = EquipmentStatus::Funded;
    equipment.payment_preference = PaymentPreference::Part;

    msg!(
        "Funder {} funded {} units for {} USDC at funder price {} USDC/unit, now installment-only",
        ctx.accounts.funder.key(), quantity_to_fund, total_payment, funder_price
    );
    Ok(())
}