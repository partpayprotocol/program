use anchor_lang::prelude::*;
use state::{
    vendor::VendorEquipmentResponse,
    contract::{ContractStatus, InstallmentFrequency},
    equipment::{Equipment, PaymentPreference},
    funded::FunderEquipmentResponse
};

declare_id!("PARnAABYT9Kuq3sgokcr4Tyz6FY7DUKpiy2Rjrp3jSh");

pub mod constants;
pub mod errors;
pub mod state;
pub mod utils;
pub mod instructions;

use instructions::*;

#[program]
pub mod partpay {
    use super::*;
    
    pub fn create_marketplace(
        ctx: Context<CreateMarketplace>,
        name: String,
        uri: String,
    ) -> Result<()> {
        msg!("Starting create_marketplace");
        marketplace::create_marketplace(ctx, name, uri)
    }

    pub fn create_vendor(
        ctx: Context<CreateVendor>,
        name: String,
        uri: String,
        unique_id: Pubkey,
        collection_unique_id: Pubkey,
    ) -> Result<()> {
        msg!("Starting create_vendor");
        vendor::create_vendor(ctx, name, uri, unique_id, collection_unique_id)
    }

    pub fn upload_equipment(
        ctx: Context<UploadEquipment>,
        name: String,
        uri: String,
        price: u64,
        total_quantity: u64,
        unique_id: Pubkey,
        minimum_deposit: u64,
        max_duration_seconds: i64,
        payment_preference: PaymentPreference,
    ) -> Result<()> {
        equipment::upload_equipment(
            ctx,
            name,
            uri,
            price,
            total_quantity,
            unique_id,
            minimum_deposit,
            max_duration_seconds,
            payment_preference,
        )
    }

    pub fn update_equipment(
        ctx: Context<UpdateEquipment>,
        name: Option<String>,
        uri: Option<String>,
        price: Option<u64>,
    ) -> Result<()> {
        msg!("Starting update_equipment");
        equipment::update_equipment(ctx, name, uri, price)
    }

    pub fn get_all_vendor_equipment<'info>(
        ctx: Context<'_, '_, 'info, 'info, GetAllVendorEquipment<'info>> 
    ) -> Result<VendorEquipmentResponse> {
        equipment::get_all_vendor_equipment(ctx)
    }

    pub fn get_equipment(ctx: Context<GetEquipment>) -> Result<Equipment> {
        msg!("Starting get_equipment");
        equipment::get_equipment(ctx)
    }

    // pub fn sell_equipment(ctx: Context<SellEquipment>) -> Result<()> {
    //     msg!("Starting sell_equipment");
    //     equipment::sell_equipment(ctx)
    // }

    pub fn initialize_borrower(ctx: Context<InitializeBorrower>) -> Result<()> {
        msg!("Initializing borrower");
        borrower::initialize_borrower(ctx)
    }

    pub fn get_vendor(ctx: Context<GetVendor>) -> Result<()> {
        msg!("Starting get_vendor");
        vendor::get_vendor(ctx)
    }

    pub fn create_contract(
        ctx: Context<CreateContract>,
        contract_unique_id: Pubkey,
        total_amount: u64,
        installment_frequency: InstallmentFrequency,
        deposit: u64,
        insurance_premium: Option<u64>,
        funder_unique_id: Option<Pubkey>
    ) -> Result<()> {
        contract::create_contract(
            ctx,
            contract_unique_id,
            total_amount,
            installment_frequency,
            deposit,
            insurance_premium,
            funder_unique_id
        )
    }

    pub fn get_contract_status(ctx: Context<GetContractStatus>) -> Result<ContractStatus> {
        msg!("Starting get_contract_status");
        contract::get_contract_status(ctx)
    }

    pub fn make_payment(
        ctx: Context<MakePayment>,
        payment_amount: u64,
    ) -> Result<()> {
        contract::make_payment(ctx, payment_amount)
    }

    pub fn track_repayment(
        ctx: Context<TrackRepayment>,
        amount: u64,
        on_time_score: f64,
        contract_unique_id: Pubkey,
    ) -> Result<()> {
        borrower::track_repayment(
            ctx,
            amount,
            on_time_score,
            contract_unique_id,
        )
    }

    pub fn get_funder_equipment<'info>(
        ctx: Context<'_, '_, 'info, 'info, GetFunderEquipment<'info>>
    ) -> Result<FunderEquipmentResponse> {
        equipment::get_funded_equipment(ctx)
    }

    pub fn fund_equipment_for_listing(
        ctx: Context<FundEquipmentForListing>,
        quantity_to_fund: u64,
        minimum_deposit: u64,
        duration_seconds: i64,
        unique_id: Pubkey,
    ) -> Result<()> {
        equipment::fund_equipment_for_listing(ctx, quantity_to_fund, minimum_deposit, duration_seconds, unique_id)
    }

    pub fn fund_equipment_for_borrower_no_payment(
        ctx: Context<FundEquipmentForBorrowerNoPayment>,
        quantity_to_fund: u64,
        borrower: Pubkey,
        unique_id: Pubkey
    ) -> Result<()> {
        equipment::fund_equipment_for_borrower_no_payment(ctx, quantity_to_fund, borrower, unique_id)
    }

    pub fn fund_equipment_for_borrower_with_payment(
        ctx: Context<FundEquipmentForBorrowerWithPayment>,
        quantity_to_fund: u64,
        borrower: Pubkey,
        minimum_deposit: u64,
        duration_seconds: i64,
        unique_id: Pubkey
    ) -> Result<()> {
        equipment::fund_equipment_for_borrower_with_payment(ctx, quantity_to_fund, borrower, minimum_deposit, duration_seconds, unique_id)
    }

    pub fn confirm_delivery(
        ctx: Context<ConfirmDelivery>,
        unique_id: Pubkey
    ) -> Result<()> {
        equipment::confirm_delivery(ctx, unique_id)
    }

    pub fn confirm_funded_delivery(
        ctx: Context<ConfirmFundedDelivery>,
        unique_id: Pubkey
    ) -> Result<()> {
        equipment::confirm_funded_delivery(ctx, unique_id)
    }

    pub fn view_credit_score(ctx: Context<ViewCreditScore>) -> Result<u64> {
        let credit_score = ctx.accounts.credit_score.score;
        Ok(credit_score)
    }
}