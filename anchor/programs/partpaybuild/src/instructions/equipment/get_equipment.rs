use anchor_lang::prelude::*;
use crate::state::{equipment::Equipment, vendor::Vendor};

#[derive(Accounts)]
pub struct GetEquipment<'info> {
    pub equipment: Account<'info, Equipment>,
    #[account(constraint = vendor.key() == equipment.vendor)]
    pub vendor: Account<'info, Vendor>,
}

pub fn get_equipment(ctx: Context<GetEquipment>) -> Result<Equipment> {
    let equipment = &ctx.accounts.equipment;
    Ok(Equipment {
        vendor: equipment.vendor,
        asset: equipment.asset,
        name: equipment.name.clone(),
        uri: equipment.uri.clone(),
        price: equipment.price,
        status: equipment.status.clone(),
        sold_quantity: equipment.sold_quantity,
        total_quantity: equipment.total_quantity,
        funded_sold_quantity: equipment.funded_sold_quantity,
        funded_quantity: equipment.funded_quantity,
        unique_id: equipment.unique_id,
        funders: equipment.funders.clone(),
        payment_preference: equipment.payment_preference.clone(),
        minimum_deposit: equipment.minimum_deposit,
        max_duration_seconds: equipment.max_duration_seconds,
    })
}
