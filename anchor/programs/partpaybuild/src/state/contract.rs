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
}

impl BNPLContract {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 32 + 8 + 1 + 1 + 9 + 1 + 9 + 1 + 32;
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
