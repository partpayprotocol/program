use anchor_lang::prelude::*;
use crate::state::{
    funded::{FunderEquipmentResponse, FunderEquipmentInfo},
    equipment::Equipment,
};

#[derive(Accounts)]
pub struct GetFunderEquipment<'info> {
    pub funder: Signer<'info>,
}

pub fn get_funded_equipment<'info>(ctx: Context<'_, '_, 'info, 'info, GetFunderEquipment<'info>>) -> Result<FunderEquipmentResponse> {
    let funder_key = ctx.accounts.funder.key();
    let mut equipment_list: Vec<FunderEquipmentInfo> = Vec::new();

    let mut equipment_accounts: Vec<Account<'info, Equipment>> = Vec::new();

    for account_info in ctx.remaining_accounts.iter() {
        let account: Account<'info, Equipment> = Account::try_from(account_info)?;
        equipment_accounts.push(account);
    }

    for equipment in equipment_accounts {
        if let Some(funder_info) = equipment.funders.iter().find(|f| f.funder == funder_key) {
            equipment_list.push(FunderEquipmentInfo {
                equipment_pda: equipment.key(),
                name: equipment.name.clone(),
                price: equipment.price,
                uri: equipment.uri.clone(),
                asset: equipment.asset,
                funded_quantity: funder_info.quantity,
                total_quantity: equipment.total_quantity,
                minimum_deposit: funder_info.minimum_deposit,
                duration_seconds: funder_info.duration_seconds,
            });
        }
    }

    Ok(FunderEquipmentResponse {
        total_count: equipment_list.len() as u64,
        equipment: equipment_list,
    })
}