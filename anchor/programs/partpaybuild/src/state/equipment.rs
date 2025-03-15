use anchor_lang::prelude::*;

#[account]
pub struct Equipment {
    pub vendor: Pubkey,
    pub asset: Pubkey,
    pub unique_id: Pubkey,
    pub name: String,
    pub uri: String,
    pub price: u64,
    pub minimum_deposit: u64,
    pub max_duration_seconds: i64,
    pub payment_preference: PaymentPreference,
    pub total_quantity: u64,
    pub funded_quantity: u64,
    pub sold_quantity: u64,
    pub funded_sold_quantity: u64,
    pub status: EquipmentStatus,
    pub funders: Vec<Box<FunderInfo>>,
    pub delivery_status: DeliveryStatus,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum PaymentPreference {
    Part,
    Full,
    Both { timeout: i64 },
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum EquipmentStatus {
    Available,
    Funded,
    PartiallySold,
    Sold,
    Reserved,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct FunderInfo {
    pub funder: Pubkey,
    pub quantity: u64,
    pub minimum_deposit: u64,
    pub duration_seconds: i64,
    pub borrower: Option<Pubkey>,
    pub escrow: Pubkey,
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum DeliveryStatus {
    Pending,
    Shipped,
    Delivered,
    Disputed,
}

impl Equipment {
    pub const LEN: usize = 8 + 32 + 32 + 32 + (4 + 64) + (4 + 128) + 8 + 8 + 8 + 9 + 8 + 8 + 8 + 8 + 1 + (4 + 32 * 10) + 1;
}