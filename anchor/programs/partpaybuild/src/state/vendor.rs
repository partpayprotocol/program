use anchor_lang::prelude::*;

#[account]
pub struct Vendor {
    pub authority: Pubkey,
    pub collection: Pubkey,
    pub name: String,
    pub uri: String,
    pub marketplace: Option<Pubkey>,
    pub equipments: Vec<Pubkey>,
    pub status: VendorStatus,
    pub unique_id: Pubkey,
    pub collection_unique_id: Pubkey,
    pub equipment_count: u64,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub enum VendorStatus {
    Active,
    Suspended,
    Deactivated,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct EquipmentInfo {
    pub name: String,
    pub price: u64,
    pub uri: String,
    pub asset: Pubkey,
    pub index: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct VendorEquipmentResponse {
    pub total_count: u64,
    pub equipment: Vec<EquipmentInfo>,
    pub failed_loads: Vec<u64>,
}