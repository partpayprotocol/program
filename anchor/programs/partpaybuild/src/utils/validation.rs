use anchor_lang::prelude::*;
use crate::errors::ErrorCode;

pub fn validate_string_length(string: &str, min: usize, max: usize) -> Result<()> {
    require!(
        string.len() >= min && string.len() <= max,
        ErrorCode::InvalidStringLength
    );
    Ok(())
}

pub fn validate_name(name: &str) -> Result<()> {
    require!(!name.is_empty(), ErrorCode::InvalidName);
    validate_string_length(name, 1, 32)?;
    Ok(())
}

pub fn validate_uri(uri: &str) -> Result<()> {
    require!(!uri.is_empty(), ErrorCode::InvalidUri);
    validate_string_length(uri, 1, 200)?;
    Ok(())
}

pub fn validate_price(price: u64) -> Result<()> {
    require!(price > 0, ErrorCode::InvalidPrice);
    Ok(())
}

pub fn validate_duration(duration: i64) -> Result<()> {
    require!(duration > 0, ErrorCode::InvalidDuration);
    Ok(())
}

pub fn validate_insurance_premium(premium: Option<u64>) -> Result<()> {
    if let Some(amount) = premium {
        require!(amount > 0, ErrorCode::InvalidInsurancePremium);
    }
    Ok(())
}

pub fn validate_installment_frequency(frequency: u64) -> Result<()> {
    require!(frequency > 0, ErrorCode::InvalidInstallmentFrequency);
    Ok(())
}