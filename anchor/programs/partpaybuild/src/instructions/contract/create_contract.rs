use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, TokenAccount, Token, TransferChecked}
};

use crate::{
    constants::CONTRACT_SEED,
    state::{
        contract::{BNPLContract, InstallmentFrequency},
        equipment::{Equipment, EquipmentStatus}
    },
    errors::ErrorCode,
};

#[derive(Accounts)]
#[instruction(
    contract_unique_id: Pubkey,
    total_amount: u64,
    installment_frequency: InstallmentFrequency,
    deposit: u64,
    insurance_premium: Option<u64>
)]
pub struct CreateContract<'info> {
    #[account(
        init,
        payer = buyer,
        space = BNPLContract::LEN,
        seeds = [CONTRACT_SEED, buyer.key().as_ref(), equipment.key().as_ref(), contract_unique_id.as_ref()],
        bump
    )]
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
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn create_contract(
    ctx: Context<CreateContract>,
    contract_unique_id: Pubkey,
    total_amount: u64,
    installment_frequency: InstallmentFrequency,
    deposit: u64,
    insurance_premium: Option<u64>,
) -> Result<()> {
    let equipment = &mut ctx.accounts.equipment;
    let vendor_quantity = equipment.total_quantity - equipment.funded_quantity;
    require!(
        equipment.sold_quantity < vendor_quantity || equipment.funded_quantity > equipment.funded_sold_quantity,
        ErrorCode::OutOfStock
    );

    let contract = &mut ctx.accounts.contract;
    let payee: Pubkey;
    let min_deposit: u64;
    let duration: i64;
    if equipment.funded_quantity > equipment.funded_sold_quantity {
        let funder_info = equipment.funders.iter_mut().find(|f| f.quantity > 0).unwrap();
        payee = funder_info.funder;
        min_deposit = funder_info.minimum_deposit;
        duration = funder_info.duration_seconds;
        equipment.funded_sold_quantity += 1;
    } else {
        payee = equipment.vendor;
        min_deposit = equipment.minimum_deposit;
        duration = equipment.max_duration_seconds;
        equipment.sold_quantity += 1;
    }
    require!(deposit >= min_deposit, ErrorCode::DepositBelowMinimum);

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
        deposit,
        ctx.accounts.usdc_mint.decimals
    )?;

    contract.borrower = ctx.accounts.buyer.key();
    contract.payee = payee;
    contract.equipment = equipment.key();
    contract.equipment_unit_index = equipment.sold_quantity + equipment.funded_sold_quantity - 1;
    contract.total_amount = total_amount;
    contract.amount_paid = deposit;
    contract.deposit = deposit;
    contract.start_date = Clock::get()?.unix_timestamp;
    contract.end_date = contract.start_date + duration;
    contract.contract_unique_id = contract_unique_id;
    contract.last_payment_date = contract.start_date;
    contract.installment_count = (duration / installment_frequency.as_seconds()) as u8;
    contract.paid_installments = 1;
    contract.installment_frequency = installment_frequency;
    contract.is_completed = false;
    contract.insurance_premium = insurance_premium;
    contract.is_insured = insurance_premium.is_some();
    contract.credit_score_delta = 0;
    contract.stablecoin_mint = ctx.accounts.usdc_mint.key();

    if equipment.sold_quantity == vendor_quantity && equipment.funded_quantity > equipment.funded_sold_quantity {
        equipment.status = EquipmentStatus::PartiallySold;
    } else if equipment.sold_quantity + equipment.funded_sold_quantity == equipment.total_quantity {
        equipment.status = EquipmentStatus::Sold;
    }
    Ok(())
}