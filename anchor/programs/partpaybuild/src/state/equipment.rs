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
    pub status: EquipmentStatus, 
    pub quantity: u64,
    pub sold_count: u64, 
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub enum EquipmentStatus {
    Available,
    Sold,
    Reserved,
}