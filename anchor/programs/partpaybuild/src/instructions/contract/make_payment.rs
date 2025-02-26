use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::TokenAccount, token_2022::Token2022};

use crate::utils::calculate_end_date::keep_same_day_for_payment;
use crate::{
    constants::USDC_DECIMALS,
    errors::ErrorCode,
    state::contract::{BNPLContract, InstallmentFrequency},
    state::equipment::Equipment,
};

#[derive(Accounts)]
#[instruction(payment_amount: u64)]
pub struct MakePayment<'info> {
    #[account(mut)]
    pub contract: Account<'info, BNPLContract>,
    #[account(
        mut,
        constraint = equipment.key() == contract.equipment @ ErrorCode::InvalidEquipment
    )]
    pub equipment: Account<'info, Equipment>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: This is the USDC mint account
    pub usdc_mint: AccountInfo<'info>,
    #[account(
        mut,
        token::mint = usdc_mint,
        token::authority = buyer
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        token::mint = usdc_mint,
        token::authority = vendor
    )]
    pub seller_token_account: Account<'info, TokenAccount>,
    /// CHECK: This will be the vendor from the contract
    #[account(address = contract.vendor @ ErrorCode::InvalidVendor)]
    pub vendor: AccountInfo<'info>,
    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn make_payment(ctx: Context<MakePayment>, payment_amount: u64) -> Result<()> {
    let contract = &mut ctx.accounts.contract;
    let equipment = &mut ctx.accounts.equipment; // Replaced nonce_account with equipment
    let clock = Clock::get().map_err(|_| error!(ErrorCode::ClockUnavailable))?;
    let current_timestamp = clock.unix_timestamp;

    if payment_amount == 0 {
        return Err(ErrorCode::InvalidPaymentAmount.into());
    }

    if contract.amount_paid == 0 {
        if payment_amount < contract.deposit {
            return Err(ErrorCode::FirstPaymentBelowDeposit.into());
        }

        equipment.sold_count += 1; 

        msg!(
            "First deposit received, updating equipment quantity. Sold count: {}",
            equipment.sold_count
        );

        if equipment.quantity == equipment.sold_count {
            equipment.status = crate::state::equipment::EquipmentStatus::Sold; // Update status
            msg!("All equipment sold, marking as 'Sold'.");
        }
    }

    let remaining_balance = contract
        .total_amount
        .checked_sub(contract.amount_paid)
        .ok_or(ErrorCode::MathOverflow)?;

    if payment_amount > remaining_balance {
        return Err(ErrorCode::Overpayment.into());
    }

    anchor_spl::token_2022::transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token_2022::TransferChecked {
                from: ctx.accounts.buyer_token_account.to_account_info(),
                to: ctx.accounts.seller_token_account.to_account_info(),
                mint: ctx.accounts.usdc_mint.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        ),
        payment_amount,
        USDC_DECIMALS,
    )?;

    contract.amount_paid = contract
        .amount_paid
        .checked_add(payment_amount)
        .ok_or(ErrorCode::MathOverflow)?;
    contract.paid_installments += 1;
    contract.last_payment_date = current_timestamp;

    match contract.installment_frequency {
        InstallmentFrequency::Monthly => {
            contract.last_payment_date = keep_same_day_for_payment(contract.last_payment_date)?;
        }
        InstallmentFrequency::Custom(days) => {
            contract.last_payment_date = contract
                .last_payment_date
                .checked_add((days as i64) * 86400)
                .ok_or(ErrorCode::MathOverflow)?;
        }
        InstallmentFrequency::Daily | InstallmentFrequency::Weekly => {
            contract.last_payment_date = current_timestamp;
        }
    }

    if contract.amount_paid == contract.total_amount {
        contract.is_completed = true;
        msg!("Contract fully paid.");
    }

    msg!(
        "Payment of {} USDC received. Total paid: {}/{}",
        payment_amount,
        contract.amount_paid,
        contract.total_amount
    );

    Ok(())
}