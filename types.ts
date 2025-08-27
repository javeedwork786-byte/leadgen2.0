
export interface Lead {
  company: string;
  website: string;
  email: string;
  phone: string;
  location: string;
  social: string[];
  priority: 'High' | 'Medium' | 'Low';
}

export interface VerificationResult {
  email: string;
  type: 'Business' | 'Support' | 'Personal' | 'Unknown';
  status: 'Valid' | 'Invalid';
  reason: string;
}
