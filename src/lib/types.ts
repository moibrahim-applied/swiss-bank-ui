export type Language = "de" | "fr" | "en";

export type DemoPhase =
  | "splash"
  | "property"
  | "documents"
  | "processing"
  | "decision"
  | "communication"
  | "casefile";

export type ProcessingStep =
  | "extraction"
  | "verification"
  | "affordability"
  | "ltv"
  | "compliance"
  | "legal"
  | "risk"
  | "communication";

export type StepStatus = "pending" | "active" | "completed" | "failed";

export type DecisionType = "GREEN" | "AMBER" | "RED";

export interface PropertyData {
  address: string;
  canton: string;
  askingPrice: number;
  propertyType: string;
  nwf: number;
  rooms: number;
  constructionYear: number;
  listingAgent: string;
  lat: number;
  lng: number;
}

export interface ApplicantData {
  name: string;
  dateOfBirth: string;
  nationality: string;
  residencePermit: string;
  employer: string;
  position: string;
  grossIncome: number;
  netIncome: number;
  pillar2: number;
  pillar3: number;
  liquidAssets: number;
  existingLiabilities: number;
  referenceNumber: string;
}

export interface AffordabilityData {
  theoreticalInterest: number;
  annualAmortisation: number;
  maintenanceCost: number;
  totalAnnualCost: number;
  grossAnnualIncome: number;
  housingCostRatio: number;
  ratioPass: boolean;
  equityTotal: number;
  equityLiquid: number;
  equityPillar2: number;
  liquidMinimumMet: boolean;
}

export interface LtvData {
  purchasePrice: number;
  benchmarkValuation: number;
  ltv: number;
  firstMortgage: number;
  secondMortgage: number;
  totalMortgage: number;
  amortisationYears: { year: number; balance: number }[];
}

export interface ComplianceCheck {
  name: string;
  status: "pending" | "scanning" | "clear" | "flagged";
  subChecks?: { name: string; status: "pending" | "scanning" | "clear" | "flagged" }[];
}

export interface RiskScore {
  dimension: string;
  weight: number;
  score: number;
  weighted: number;
  color: "emerald" | "amber" | "crimson";
}

export interface AuditLogEntry {
  timestamp: string;
  category: "EXTRACT" | "VERIFY" | "AFFORD" | "LTV" | "COMPLY" | "RISK" | "DECIDE" | "COMM";
  message: string;
}

export interface DocumentItem {
  name: string;
  nameDE: string;
  nameFR: string;
  required: boolean;
  uploaded: boolean;
  verified: boolean;
  category: "personal" | "property";
}
