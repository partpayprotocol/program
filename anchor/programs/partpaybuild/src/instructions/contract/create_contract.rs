use anchor_lang::prelude::*;
use crate::{
    state::contract::{BNPLContract, InstallmentFrequency},
    state::equipment::Equipment,
    constants::CONTRACT_SEED,
    errors::ErrorCode,
    utils::validation::{
        validate_price,
        validate_duration,
        validate_insurance_premium,
        validate_installment_frequency,
    },
};

#[derive(Accounts)]
#[instruction(
    contract_unique_id: Pubkey,
    total_amount: u64,
    duration_seconds: i64,
    installment_frequency: u64,
    deposit: u64,
    insurance_premium: Option<u64>,
)]
pub struct CreateContract<'info> {
    #[account(
        init,
        payer = buyer,
        space = 8 + BNPLContract::LEN,
        seeds = [CONTRACT_SEED, buyer.key().as_ref(), seller.key().as_ref(), equipment.key().as_ref(), contract_unique_id.as_ref()],
        bump
    )]
    pub contract: Account<'info, BNPLContract>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: The seller's account is only stored as a reference.
    pub seller: AccountInfo<'info>,
    #[account(constraint = equipment.vendor == seller.key() @ ErrorCode::InvalidEquipment)]
    pub equipment: Account<'info, Equipment>,
    pub system_program: Program<'info, System>,
}

pub fn create_contract(
    ctx: Context<CreateContract>,
    _contract_unique_id: Pubkey,
    total_amount: u64,
    duration_seconds: i64,
    installment_frequency: u64,
    deposit: u64,
    insurance_premium: Option<u64>,
) -> Result<()> {
    msg!("Starting create_contract function");

    validate_price(total_amount)?;
    validate_duration(duration_seconds)?;
    validate_installment_frequency(installment_frequency)?;
    validate_insurance_premium(insurance_premium)?;

    require!(deposit >= ctx.accounts.equipment.minimum_deposit, ErrorCode::DepositBelowMinimum);
    require!(duration_seconds <= ctx.accounts.equipment.max_duration_seconds, ErrorCode::DurationExceedsMax);

    let clock = Clock::get().map_err(|_| error!(ErrorCode::ClockUnavailable))?;

    let contract = &mut ctx.accounts.contract;
    contract.borrower = ctx.accounts.buyer.key();
    contract.vendor = ctx.accounts.seller.key();
    contract.equipment = ctx.accounts.equipment.key();
    contract.total_amount = total_amount;
    contract.amount_paid = 0;
    contract.start_date = clock.unix_timestamp;
    contract.end_date = clock.unix_timestamp.checked_add(duration_seconds).ok_or(ErrorCode::MathOverflow)?;
    contract.last_payment_date = clock.unix_timestamp;
    contract.installment_frequency = match installment_frequency {
        1 => InstallmentFrequency::Daily,
        7 => InstallmentFrequency::Weekly,
        30 => InstallmentFrequency::Monthly,
        _ => InstallmentFrequency::Custom(installment_frequency),
    };
    contract.is_completed = false;
    contract.deposit = deposit;
    contract.insurance_premium = insurance_premium;
    contract.is_insured = insurance_premium.is_some();

    Ok(())
}