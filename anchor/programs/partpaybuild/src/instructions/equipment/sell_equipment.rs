// use anchor_lang::prelude::*;
// use crate::{
//     state::equipment::{Equipment, EquipmentStatus},
//     errors::ErrorCode,
// };

// #[derive(Accounts)]
// pub struct SellEquipment<'info> {
//     #[account(mut, has_one = vendor)]
//     pub equipment: Account<'info, Equipment>,
//     /// CHECK: This is the vendor's account. It's validated by the `has_one` constraint on the `equipment`.
//     #[account(signer)]
//     pub vendor: AccountInfo<'info>,
//     pub system_program: Program<'info, System>,
// }

// pub fn sell_equipment(
//     ctx: Context<SellEquipment>,
// ) -> Result<()> {
//     let equipment = &mut ctx.accounts.equipment;

//     if equipment.status != EquipmentStatus::Available {
//         return Err(ErrorCode::EquipmentNotAvailable.into());
//     }

//     if equipment.quantity == equipment.sold_count {
//         return Err(ErrorCode::OutOfStock.into());
//     }

//     equipment.sold_count = equipment.sold_count
//         .checked_add(1)
//         .ok_or(ErrorCode::MathOverflow)?;

//     if equipment.quantity == equipment.sold_count {
//         equipment.status = EquipmentStatus::Sold;
//     }

//     msg!("Equipment sold successfully: {}", equipment.name);
//     Ok(())
// }
