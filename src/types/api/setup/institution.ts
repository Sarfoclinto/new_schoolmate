export interface InstitutionGet {
  institutionId?: string;
  name: string;
  email: string;
  contact: string;
  region: string;
  city: string;
  town?: string;
  postalAddress?: string;
  address?: string;
  logo?: string;
  country: string;
  websiteLink?: string;
  description?: string;
  establishedYear: string;
  institutionType: "private" | "public" | "international";
  motto?: string;
}
