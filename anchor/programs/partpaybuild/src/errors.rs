use anchor_lang::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("The provided buyer is not authorized to make this payment")]
    UnauthorizedBuyer,
    #[msg("The contract is already completed")]
    ContractAlreadyCompleted,
    #[msg("Failed to create collection")]
    FailedToCreateCollection,
    #[msg("Clock is unavailable")]
    ClockUnavailable,
    #[msg("Invalid contract vendor")]
    InvalidVendor,
    #[msg("Failed to mint NFT receipt")]
    InvalidEquipment,
    #[msg("Invalid equipment")]
    FailedToMintNFT,
    #[msg("Error invoking Metaplex Core program")]
    MetaplexError,
    #[msg("Marketplace already exists")]
    MarketplaceAlreadyExists,
    #[msg("Invalid Marketplace Authority")]
    InvalidMarketplaceAuthority,
    #[msg("Math operation resulted in overflow")]
    MathOverflow,
    #[msg("Invalid price")]
    InvalidPrice,
    #[msg("First payment must meet the minimum payment")]
    FirstPaymentBelowDeposit,
    #[msg("Invalid duration")]
    InvalidDuration,
    #[msg("Invalid insurance premium")]
    InvalidInsurancePremium,
    #[msg("Equipment not found")]
    EquipmentNotFound,
    #[msg("Invalid equipment update")]
    InvalidEquipmentUpdate,
    #[msg("Equipment price must be greater than zero")]
    InvalidEquipmentPrice,
    #[msg("Equipment name must not be empty")]
    InvalidEquipmentName,
    #[msg("Equipment URI must be valid")]
    InvalidEquipmentUri,
    #[msg("Unauthorized equipment update")]
    UnauthorizedEquipmentUpdate,
    #[msg("String length is invalid")]
    InvalidStringLength,
    #[msg("Invalid URI")]
    InvalidUri,
    #[msg("Invalid name")]
    InvalidName,
    #[msg("Invalid installment frequency")]
    InvalidInstallmentFrequency,
    #[msg("The buyer must sign this transaction.")]
    BuyerSignatureRequired,
    #[msg("The seller must sign this transaction.")]
    SellerSignatureRequired,
    #[msg("Invalid payment amount")]
    InvalidPaymentAmount,
    #[msg("Overpayment")]
    Overpayment,
    #[msg("Invalid timestamp")]
    InvalidTimestamp,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Borrower does not match credit score record")]
    BorrowerMismatch,
    #[msg("Invalid credit score PDA")]
    InvalidCreditScorePda,
    #[msg("Invalid mint")]
    InvalidMint,
    #[msg("Invalid  seller account")]
    InvalidSellerTokenAccount,
    #[msg("Invalid  buyer account")]
    InvalidBuyerTokenAccount,
    #[msg("Equipment is out of stock")]
    OutOfStock,
    #[msg("No remaining quantity")]
    NoRemainingQuantity,
    #[msg("Loan not found for this borrower")]
    LoanNotFound,
    #[msg("Deposit is below the minimum set by the vendor")]
    DepositBelowMinimum,
    #[msg("Funder price must be greater than or equal to vendor price")]
    InvalidFunderPrice,
    #[msg("Duration exceeds the maximum allowed by the vendor")]
    DurationExceedsMax,
    #[msg("Invalid payee")]
    InvalidPayee,
    #[msg("Insufficient quantity available")]
    InsufficientQuantity,
    #[msg("Failed to transfer tokens")]
    TokenTransferFailed,
    #[msg("Invalid contract")]
    InvalidContract,
    #[msg("Invalid payment preference")]
    InvalidPaymentPreference,
    #[msg("Equipment not available")]
    EquipmentNotAvailable,
}
