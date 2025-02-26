use anchor_lang::prelude::*;
use crate::state::vendor::{Vendor, EquipmentInfo, VendorEquipmentResponse};
use crate::utils::load_equipment::load_equipment_account;

#[derive(Accounts)]
pub struct GetAllVendorEquipment<'info> {
    pub vendor: Account<'info, Vendor>,
}

pub fn get_all_vendor_equipment<'info>(
    ctx: Context<'_, '_, 'info, 'info, GetAllVendorEquipment<'info>>
) -> Result<VendorEquipmentResponse> {
    let vendor = &ctx.accounts.vendor;
    let mut response = VendorEquipmentResponse {
        total_count: vendor.equipment_count,
        equipment: Vec::new(),
        failed_loads: Vec::new(),
    };

    if vendor.equipment_count == 0 {
        return Ok(response);
    }

    for (i, account_info) in ctx.remaining_accounts.iter().enumerate() {
        if i >= vendor.equipment_count as usize {
            break;
        }

        match load_equipment_account(
            &vendor.key(),
            i as u64,
            account_info,
            ctx.program_id,
        ) {
            Ok(equipment) => {
                response.equipment.push(EquipmentInfo {
                    name: equipment.name,
                    price: equipment.price,
                    uri: equipment.uri,
                    asset: equipment.asset,
                    index: i as u64,
                });
            },
            Err(_) => {
                response.failed_loads.push(i as u64);
            }
        }
    }

    Ok(response)
}