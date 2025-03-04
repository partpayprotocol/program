use anchor_lang::prelude::*;
use crate::{
    state::contract::{BNPLContract, ContractStatus},
    errors::ErrorCode,
};

#[derive(Accounts)]
pub struct GetContractStatus<'info> {
    pub contract: Account<'info, BNPLContract>,
}

pub fn get_contract_status(ctx: Context<GetContractStatus>) -> Result<ContractStatus> {
    let contract = &ctx.accounts.contract;
    let clock = Clock::get().map_err(|_| error!(ErrorCode::ClockUnavailable))?;

    let time_since_start = clock
        .unix_timestamp
        .checked_sub(contract.start_date)
        .ok_or(ErrorCode::MathOverflow)?;
    
    let total_duration = contract
        .end_date
        .checked_sub(contract.start_date)
        .ok_or(ErrorCode::MathOverflow)?;
        
    let progress = ((time_since_start as f64 / total_duration as f64 * 100.0)
        .min(100.0)) as u8;

    let total_due = if contract.is_insured {
        contract
            .total_amount
            .checked_add(contract.insurance_premium.unwrap_or(0))
            .ok_or(ErrorCode::MathOverflow)?
    } else {
        contract.total_amount
    };
    
    let remaining_amount = total_due
    .checked_sub(contract.amount_paid)
    .ok_or(ErrorCode::MathOverflow)?;
    let time_since_last_payment = clock
        .unix_timestamp
        .checked_sub(contract.last_payment_date)
        .ok_or(ErrorCode::MathOverflow)?;
        
    let next_payment_due = contract
        .last_payment_date
        .checked_add(contract.installment_frequency.as_seconds())
        .ok_or(ErrorCode::MathOverflow)?;
        
    let is_payment_overdue = clock.unix_timestamp > next_payment_due;

    Ok(ContractStatus {
        progress,
        total_due,
        remaining_amount,
        time_since_last_payment,
        is_payment_overdue,
        next_payment_due,
        insurance_premium: contract.insurance_premium,
    })
}