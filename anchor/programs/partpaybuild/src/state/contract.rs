use anchor_lang::prelude::*;

#[account]
pub struct BNPLContract {
    pub borrower: Pubkey,
    pub payee: Pubkey,
    pub equipment: Pubkey,
    pub equipment_unit_index: u64,
    pub total_amount: u64,
    pub amount_paid: u64,
    pub deposit: u64,
    pub start_date: i64,
    pub end_date: i64,
    pub contract_unique_id: Pubkey,
    pub last_payment_date: i64,
    pub installment_count: u8,
    pub paid_installments: u8,
    pub installment_frequency: InstallmentFrequency,
    pub is_completed: bool,
    pub insurance_premium: Option<u64>,
    pub is_insured: bool,
    pub credit_score_delta: i8,
    pub stablecoin_mint: Pubkey,
    pub escrow: Pubkey,
}

impl BNPLContract {
    pub const LEN: usize = 8 + // Discriminator
        32 + // borrower
        32 + // payee
        32 + // equipment
        8 +  // equipment_unit_index
        8 +  // total_amount
        8 +  // amount_paid
        8 +  // deposit
        8 +  // start_date
        8 +  // end_date
        32 + // contract_unique_id
        8 +  // last_payment_date
        1 +  // installment_count
        1 +  // paid_installments
        9 +  // installment_frequency (1 tag + 8 payload)
        1 +  // is_completed
        9 +  // insurance_premium (1 tag + 8 u64)
        1 +  // is_insured
        1 +  // credit_score_delta
        32 + // stablecoin_mint
        32; 
}
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ContractStatus {
    pub progress: u8,
    pub total_due: u64,
    pub remaining_amount: u64,
    pub time_since_last_payment: i64,
    pub is_payment_overdue: bool,
    pub next_payment_due: i64,
    pub insurance_premium: Option<u64>,
} 

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum InstallmentFrequency {
    Daily,
    Weekly,
    Monthly, 
    Custom { seconds: u64 },
}

impl InstallmentFrequency {
    pub fn as_seconds(&self) -> i64 {
        match self {
            InstallmentFrequency::Daily => 86_400,
            InstallmentFrequency::Weekly => 604_800,
            InstallmentFrequency::Monthly => 2_592_000,
            InstallmentFrequency::Custom { seconds } => *seconds as i64,
        }
    }
}
