use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct FunderEquipmentResponse {
    pub total_count: u64,
    pub equipment: Vec<FunderEquipmentInfo>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct FunderEquipmentInfo {
    pub equipment_pda: Pubkey,
    pub name: String,
    pub price: u64,
    pub uri: String,
    pub asset: Pubkey,
    pub funded_quantity: u64,
    pub total_quantity: u64,
    pub minimum_deposit: u64,
    pub duration_seconds: i64,
}