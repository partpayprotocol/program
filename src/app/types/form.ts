export interface EquipmentUploadValues {
    name: string;
    description: string;
    minimumAmount: string;
    totalAmount: string;
    quantity: string;
    pricePerUnit: string; 
    minimumDeposit: string; 
    totalQuantity: string;   
    maxDuration: string;    
    paymentPreference: string;
  };

export interface RequestEquipmentFormInputs {
    category?: string;
    title: string;
    description?: string;
    budgetRange?: string;
    image?: string;
    // urgency: "urgent" | "normal" | "flexible";
    preferredPayment: "installments" | "full" | "either";
    additionalDetails?: string;
  }