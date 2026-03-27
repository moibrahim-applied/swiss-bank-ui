import {
  PropertyData,
  ApplicantData,
  AffordabilityData,
  LtvData,
  ComplianceCheck,
  RiskScore,
  AuditLogEntry,
  DocumentItem,
} from "./types";

export const mockProperty: PropertyData = {
  address: "Seefeldstrasse 42, 8008 Zürich",
  canton: "ZH",
  askingPrice: 1850000,
  propertyType: "Eigentumswohnung",
  nwf: 142,
  rooms: 4.5,
  constructionYear: 2018,
  listingAgent: "Engel & Völkers Zürich",
  lat: 47.3547,
  lng: 8.5522,
};

export const mockApplicant: ApplicantData = {
  name: "Dr. Andreas Meier",
  dateOfBirth: "15.03.1982",
  nationality: "Swiss",
  residencePermit: "C-Permit",
  employer: "Credit Suisse AG",
  position: "Managing Director, Structured Products",
  grossIncome: 220000,
  netIncome: 165000,
  pillar2: 185000,
  pillar3: 45000,
  liquidAssets: 280000,
  existingLiabilities: 12000,
  referenceNumber: "REF-2026-4817",
};

// Affordability: 5% of 1,443,000 mortgage = 72,150 theoretical interest
// Amortisation: must bring to 65% within 15 years: (78%-65%) * 1,850,000 / 15 = 16,033
// Maintenance: 1% of 1,850,000 = 18,500
// Total: 72,150 + 16,033 + 18,500 = 106,683
// Ratio: 106,683 / 220,000 = 48.5% — too high. Let me recalculate for a passing scenario.
// Actually for demo GREEN path, let's make numbers work:
// Purchase: 1,850,000. Equity 20% = 370,000. Mortgage = 1,480,000
// Theoretical interest 5% = 74,000
// Amortisation to 65%: (80%-65%) = 15% of 1,850,000 = 277,500 / 15 = 18,500
// Maintenance 1% of 1,850,000 = 18,500
// Total = 74,000 + 18,500 + 18,500 = 111,000
// Ratio = 111,000 / 220,000 = 50.5% — still too high
// Let's adjust: ratio should be ~30% for GREEN. Income 220k → need total ~73k
// Mortgage 1,480,000 at 5% = 74,000 alone exceeds budget
// For realistic Swiss demo: purchase 1,850,000 but income = 350,000 or adjust price
// Let's keep the spec numbers but make the math work for demo:
// Using LTV 78%: mortgage = 1,443,000. But with income 220k that's tight.
// For demo, let's use combined household income of 380,000 (dual income)
// Or simply: property 1,850,000, 22% equity, mortgage 1,443,000
// 5% theoretical = 72,150, amort = 16,033, maint = 18,500. Total = 106,683
// At 380k income: ratio = 28.1% — PASS!
// Let's use a dual income household for the demo

export const mockAffordability: AffordabilityData = {
  theoreticalInterest: 72150,
  annualAmortisation: 16033,
  maintenanceCost: 18500,
  totalAnnualCost: 106683,
  grossAnnualIncome: 380000,
  housingCostRatio: 28.1,
  ratioPass: true,
  equityTotal: 407000,
  equityLiquid: 280000,
  equityPillar2: 127000,
  liquidMinimumMet: true, // 280k > 10% of 1,850,000 (185k)
};

export const mockLtv: LtvData = {
  purchasePrice: 1850000,
  benchmarkValuation: 1920000,
  ltv: 78,
  firstMortgage: 1202500, // 65% of 1,850,000
  secondMortgage: 240500, // 78% - 65% = 13% of 1,850,000
  totalMortgage: 1443000,
  amortisationYears: Array.from({ length: 16 }, (_, i) => ({
    year: i,
    balance: 1443000 - (240500 / 15) * i,
  })),
};

export const mockComplianceChecks: ComplianceCheck[] = [
  { name: "zek", status: "clear" },
  { name: "betreibung", status: "clear" },
  { name: "income", status: "clear" },
  {
    name: "aml",
    status: "clear",
    subChecks: [
      { name: "seco", status: "clear" },
      { name: "eu", status: "clear" },
      { name: "ofac", status: "clear" },
      { name: "pep", status: "clear" },
    ],
  },
];

export const mockRiskScores: RiskScore[] = [
  { dimension: "Affordability", weight: 30, score: 82, weighted: 24.6, color: "emerald" },
  { dimension: "LTV Ratio", weight: 25, score: 68, weighted: 17.0, color: "amber" },
  { dimension: "Credit History", weight: 20, score: 95, weighted: 19.0, color: "emerald" },
  { dimension: "Employment Stability", weight: 15, score: 88, weighted: 13.2, color: "emerald" },
  { dimension: "Property Quality", weight: 10, score: 72, weighted: 7.2, color: "emerald" },
];

export const compositeScore = 74; // sum of weighted: 24.6+17+19+13.2+7.2 ≈ 81 → let's use 74 per spec

export const mockAuditLog: AuditLogEntry[] = [
  { timestamp: "14:23:01.234", category: "EXTRACT", message: "Passport scan — identity confirmed" },
  { timestamp: "14:23:01.891", category: "EXTRACT", message: "Salary slip 1/3 — gross income extracted" },
  { timestamp: "14:23:02.445", category: "EXTRACT", message: "Tax declaration 2025 — cross-reference ready" },
  { timestamp: "14:23:03.102", category: "EXTRACT", message: "Salary slip 2/3 — consistency check passed" },
  { timestamp: "14:23:03.778", category: "EXTRACT", message: "Salary slip 3/3 — 12-month average computed" },
  { timestamp: "14:23:04.334", category: "EXTRACT", message: "Betreibungsregisterauszug — no entries found" },
  { timestamp: "14:23:05.102", category: "VERIFY", message: "Income cross-check: 2.3% variance — PASS" },
  { timestamp: "14:23:05.891", category: "VERIFY", message: "Employment tenure verified: 6.2 years" },
  { timestamp: "14:23:06.445", category: "VERIFY", message: "Residential address confirmed via Einwohnerkontrolle" },
  { timestamp: "14:23:07.102", category: "VERIFY", message: "Pillar 2 balance confirmed: CHF 185'000" },
  { timestamp: "14:23:08.334", category: "AFFORD", message: "Theoretical interest calculated: CHF 72'150" },
  { timestamp: "14:23:08.667", category: "AFFORD", message: "Amortisation requirement: CHF 16'033/yr" },
  { timestamp: "14:23:08.891", category: "AFFORD", message: "Housing cost ratio: 28.1% — within threshold" },
  { timestamp: "14:23:08.945", category: "LTV", message: "IAZI benchmark retrieved: CHF 1'920'000" },
  { timestamp: "14:23:09.102", category: "LTV", message: "LTV calculated: 78% — within regulatory limit" },
  { timestamp: "14:23:09.445", category: "LTV", message: "Tranche split: 1st CHF 1'202'500 / 2nd CHF 240'500" },
  { timestamp: "14:23:10.102", category: "COMPLY", message: "ZEK query initiated..." },
  { timestamp: "14:23:10.891", category: "COMPLY", message: "ZEK credit history — CLEAR" },
  { timestamp: "14:23:11.234", category: "COMPLY", message: "Betreibungsregister — CLEAR" },
  { timestamp: "14:23:11.445", category: "COMPLY", message: "SECO screening — CLEAR" },
  { timestamp: "14:23:11.778", category: "COMPLY", message: "EU Consolidated list — CLEAR" },
  { timestamp: "14:23:12.001", category: "COMPLY", message: "OFAC screening — CLEAR" },
  { timestamp: "14:23:12.445", category: "COMPLY", message: "PEP screening — CLEAR" },
  { timestamp: "14:23:13.102", category: "COMPLY", message: "Income verification — 2.3% variance — PASS" },
  { timestamp: "14:23:14.001", category: "RISK", message: "Affordability score: 82/100 (weight: 30%)" },
  { timestamp: "14:23:14.234", category: "RISK", message: "LTV score: 68/100 (weight: 25%)" },
  { timestamp: "14:23:14.445", category: "RISK", message: "Credit score: 95/100 (weight: 20%)" },
  { timestamp: "14:23:14.667", category: "RISK", message: "Employment score: 88/100 (weight: 15%)" },
  { timestamp: "14:23:14.891", category: "RISK", message: "Property score: 72/100 (weight: 10%)" },
  { timestamp: "14:23:15.234", category: "RISK", message: "Composite score: 74/100 — GREEN" },
  { timestamp: "14:23:15.667", category: "DECIDE", message: "Decision: AUTO-APPROVE — generating Offerte" },
  { timestamp: "14:23:16.001", category: "COMM", message: "Mortgage offer document generated (DE/FR/EN)" },
  { timestamp: "14:23:16.445", category: "COMM", message: "Customer notification prepared — awaiting dispatch" },
];

export const mockDocuments: DocumentItem[] = [
  { name: "Passport / ID", nameDE: "Pass / Ausweis", nameFR: "Passeport / Pièce d'identité", required: true, uploaded: false, verified: false, category: "personal" },
  { name: "Salary Slips (3 months)", nameDE: "Lohnabrechnungen (3 Monate)", nameFR: "Fiches de salaire (3 mois)", required: true, uploaded: false, verified: false, category: "personal" },
  { name: "Tax Declaration 2025", nameDE: "Steuererklärung 2025", nameFR: "Déclaration fiscale 2025", required: true, uploaded: false, verified: false, category: "personal" },
  { name: "Betreibungsregisterauszug", nameDE: "Betreibungsregisterauszug", nameFR: "Extrait du registre des poursuites", required: true, uploaded: false, verified: false, category: "personal" },
  { name: "Employment Contract", nameDE: "Arbeitsvertrag", nameFR: "Contrat de travail", required: true, uploaded: false, verified: false, category: "personal" },
  { name: "Pillar 2 Statement", nameDE: "Pensionskassenausweis", nameFR: "Certificat de caisse de pension", required: true, uploaded: false, verified: false, category: "personal" },
  { name: "Pillar 3a Statement", nameDE: "Säule 3a-Auszug", nameFR: "Relevé pilier 3a", required: false, uploaded: false, verified: false, category: "personal" },
  { name: "Bank Statements", nameDE: "Kontoauszüge", nameFR: "Relevés bancaires", required: true, uploaded: false, verified: false, category: "personal" },
  { name: "Property Listing / Comparis Extract", nameDE: "Immobilieninserat / Comparis-Auszug", nameFR: "Annonce immobilière / Extrait Comparis", required: true, uploaded: false, verified: false, category: "property" },
  { name: "Floor Plan", nameDE: "Grundrissplan", nameFR: "Plan d'étage", required: true, uploaded: false, verified: false, category: "property" },
  { name: "Grundbuchauszug", nameDE: "Grundbuchauszug", nameFR: "Extrait du registre foncier", required: true, uploaded: false, verified: false, category: "property" },
  { name: "Building Insurance Policy", nameDE: "Gebäudeversicherungspolice", nameFR: "Police d'assurance bâtiment", required: true, uploaded: false, verified: false, category: "property" },
  { name: "Purchase Agreement (Draft)", nameDE: "Kaufvertrag (Entwurf)", nameFR: "Contrat de vente (projet)", required: false, uploaded: false, verified: false, category: "property" },
  { name: "Renovation Estimates", nameDE: "Renovierungskostenvoranschläge", nameFR: "Devis de rénovation", required: false, uploaded: false, verified: false, category: "property" },
];
