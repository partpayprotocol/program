use anchor_lang::prelude::*;
use crate::state::equipment::Equipment;

pub fn load_equipment_account<'a>(
    vendor_key: &Pubkey,
    _index: u64,
    account_info: &'a AccountInfo<'a>,
    _program_id: &Pubkey,
) -> Result<Equipment> {
    let account = Account::<Equipment>::try_from(account_info).map_err(|_| ProgramError::InvalidAccountData)?;
    
    if &account.vendor != vendor_key {
        return Err(ProgramError::InvalidArgument.into());
    }

    Ok(account.into_inner())
}
