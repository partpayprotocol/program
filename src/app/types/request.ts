  
 export interface Vendor {
    id: string;
    name: string;
    logoUrl?: string;
    rating: number;
    proposal?: {
      amount: number;
      description: string;
      paymentTerms: string;
      deliveryTime: string;
      submitted: string;
    };
  }
  
 export interface RequestDetails {
    // id: string;
    title: string;
    description?: string;
    category: string;
    budgetRange?: string;
    additionalDetails?: string;
    submittedDate?: string;
    vendors?: Vendor[];
  }