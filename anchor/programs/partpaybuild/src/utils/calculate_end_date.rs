use anchor_lang::prelude::*;
use crate::{
    errors::ErrorCode,
}; 

// pub fn calculate_end_date(
//     start_date: i64,
//     installment_count: u8,
//     frequency: &InstallmentFrequency,
// ) -> Result<> {
//     match frequency {
//         InstallmentFrequency::Monthly => Ok(start_date + (installment_count as i64 * 30 * 86400)),
//         InstallmentFrequency::Weekly => Ok(start_date + (installment_count as i64 * 7 * 86400)),
//         InstallmentFrequency::Custom(days) => Ok(start_date + (installment_count as i64 * *days as i64 * 86400)),
//     }
// }

pub fn keep_same_day_for_payment(last_payment_date: i64) -> Result<i64> {
    use chrono::{DateTime, NaiveDateTime, Datelike, Utc};

    let last_payment = DateTime::<Utc>::from_timestamp(last_payment_date, 0)
        .ok_or(ErrorCode::InvalidTimestamp)?
        .naive_utc();

    let next_month = last_payment.month() % 12 + 1;
    let next_year = if next_month == 1 { last_payment.year() + 1 } else { last_payment.year() };

    let next_due_date = NaiveDateTime::new(
        chrono::NaiveDate::from_ymd_opt(next_year, next_month, last_payment.day())
            .unwrap_or_else(|| chrono::NaiveDate::from_ymd_opt(next_year, next_month, 28).unwrap()),
        chrono::NaiveTime::from_hms_opt(0, 0, 0).unwrap(),
    );

    Ok(next_due_date.and_utc().timestamp())
}