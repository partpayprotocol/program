use anchor_lang::prelude::*;

#[account]
pub struct CreditScore {
    pub borrower: Pubkey,
    pub on_time_payments: u32,
    pub late_payments: u32,
    pub defaults: u32,
    pub score: u64,
    pub bump: u8,
}

impl CreditScore {
    pub const SCALE_FACTOR: u64 = 100;
    pub const SEED_PREFIX: &'static [u8] = b"credit_score";

    pub fn update_score(&mut self, is_on_time: bool, on_time_score: u32) {
        if is_on_time {
            self.on_time_payments += 1;
            self.score += on_time_score as u64;
        } else {
            self.late_payments += 1;
            self.score = self.score.saturating_sub(on_time_score as u64);
        }
    }
}
