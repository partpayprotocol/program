use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount, Transfer},
};
use crate::{
    constants::CONTRACT_SEED,
    errors::ErrorCode,
    state::{
        contract::{BNPLContract, InstallmentFrequency},
        equipment::{DeliveryStatus, Equipment, EquipmentStatus},
        escrow::Escrow,
    },
};

#[derive(Accounts)]
#[instruction(
    contract_unique_id: Pubkey,
    total_amount: u64,
    installment_frequency: InstallmentFrequency,
    deposit: u64,
    insurance_premium: Option<u64>,
    funder_unique_id: Option<Pubkey>
)]
pub struct CreateContract<'info> {
    #[account(
        init,
        payer = buyer,
        space = BNPLContract::LEN,
        seeds = [CONTRACT_SEED, buyer.key().as_ref(), equipment.key().as_ref(), contract_unique_id.as_ref()],
        bump
    )]
    pub contract: Box<Account<'info, BNPLContract>>,
    #[account(mut)]
    pub equipment: Box<Account<'info, Equipment>>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub usdc_mint: Account<'info, Mint>,
    #[account(mut)]
    pub buyer_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init,
        payer = buyer,
        space = Escrow::LEN,
        seeds = [b"escrow", equipment.key().as_ref(), buyer.key().as_ref(), contract_unique_id.as_ref()],
        bump
    )]
    pub escrow: Box<Account<'info, Escrow>>,
    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = usdc_mint,
        associated_token::authority = escrow
    )]
    pub escrow_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub payee_token_account: Box<Account<'info, TokenAccount>>,
    #[account()]
    /// CHECK: Validated in logic
    pub payee: AccountInfo<'info>,
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
    funder_unique_id: Option<Pubkey>,
) -> Result<()> {
    msg!("Starting create_contract");
    let equipment = &mut ctx.accounts.equipment;
    msg!("Equipment loaded: {:?}", equipment.key());

    require!(total_amount > deposit, ErrorCode::InvalidAmount);
    let frequency_seconds = installment_frequency.as_seconds();
    require!(frequency_seconds > 0, ErrorCode::InvalidFrequency);

    let vendor_quantity = equipment.total_quantity - equipment.funded_quantity;
    msg!("Vendor quantity: {}", vendor_quantity);
    let contract = &mut ctx.accounts.contract;
    let payee: Pubkey;
    let min_deposit: u64;
    let duration: i64;

    match funder_unique_id {
        Some(funder_id) => {
            require!(
                equipment.funded_quantity > equipment.funded_sold_quantity,
                ErrorCode::NoFundedUnitsAvailable
            );
            let funder_info = equipment
                .funders
                .iter_mut()
                .find(|f| f.funder == funder_id && f.quantity > 0)
                .ok_or(ErrorCode::NoAvailableFunder)?;
            payee = funder_info.funder;
            min_deposit = funder_info.minimum_deposit;
            duration = funder_info.duration_seconds;
            equipment.funded_sold_quantity += 1;
            msg!("Using funder as payee: {:?}", payee);
        }
        None => {
            msg!("Processing vendor equipment");
            require!(
                equipment.sold_quantity < vendor_quantity,
                ErrorCode::OutOfStock
            );
            payee = equipment.vendor;
            min_deposit = equipment.minimum_deposit;
            duration = equipment.max_duration_seconds;
            equipment.sold_quantity += 1;
            msg!("Using vendor as payee: {:?}", payee);
        }
    }

    require!(ctx.accounts.payee.key() == payee, ErrorCode::InvalidPayee);
    require!(deposit >= min_deposit, ErrorCode::DepositBelowMinimum);

    let escrow = &mut ctx.accounts.escrow;
    escrow.equipment = equipment.key();
    escrow.funder = ctx.accounts.buyer.key();
    escrow.vendor = equipment.vendor;
    escrow.amount = deposit;
    escrow.is_released = false;

    msg!("Transferring deposit to escrow: {}", deposit);
    anchor_spl::token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer_token_account.to_account_info(),
                to: ctx.accounts.escrow_token_account.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        ),
        deposit,
    )?;
    msg!("Transfer complete");

    msg!("Setting contract state");
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
    let installment_count = (duration / frequency_seconds) as u64;
    require!(installment_count <= u8::MAX as u64, ErrorCode::TooManyInstallments);
    contract.installment_count = installment_count as u8;
    contract.paid_installments = 1;
    contract.installment_frequency = installment_frequency;
    contract.is_completed = false;
    contract.insurance_premium = insurance_premium;
    contract.is_insured = insurance_premium.is_some();
    contract.credit_score_delta = 0;
    contract.stablecoin_mint = ctx.accounts.usdc_mint.key();
    contract.escrow = ctx.accounts.escrow.key();

    equipment.delivery_status = DeliveryStatus::Pending;
    if equipment.sold_quantity == vendor_quantity && equipment.funded_quantity > equipment.funded_sold_quantity {
        equipment.status = EquipmentStatus::PartiallySold;
    } else if equipment.sold_quantity + equipment.funded_sold_quantity == equipment.total_quantity {
        equipment.status = EquipmentStatus::Sold;
    }

    msg!("Contract creation complete");
    Ok(())
}