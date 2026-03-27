"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Language } from "@/lib/types";
import { t, formatCHF, formatPercent } from "@/lib/i18n";
import {
  mockApplicant,
  mockAffordability,
  mockComplianceChecks,
  mockRiskScores,
  compositeScore,
  mockLtv,
  mockAuditLog,
} from "@/lib/mock-data";

interface CaseFileProps {
  language: Language;
  onComplete: () => void;
}

const tabKeys = [
  "casefile.kyc",
  "casefile.affordability",
  "casefile.credit",
  "casefile.title_check",
  "casefile.risk",
  "casefile.offer",
  "casefile.audit",
] as const;

const riskBarColors: Record<string, string> = {
  emerald: "bg-bank-emerald",
  amber: "bg-bank-amber",
  crimson: "bg-bank-crimson",
};

// ─── Tab content components ───

function KycSummary() {
  const fields = [
    { label: "Full Name", value: mockApplicant.name },
    { label: "Date of Birth", value: mockApplicant.dateOfBirth },
    { label: "Nationality", value: mockApplicant.nationality },
    { label: "Residence Permit", value: mockApplicant.residencePermit },
    { label: "Employer", value: mockApplicant.employer },
    { label: "Position", value: mockApplicant.position },
    { label: "Gross Income", value: formatCHF(mockApplicant.grossIncome) },
    { label: "Reference", value: mockApplicant.referenceNumber },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
      {fields.map((f) => (
        <div key={f.label} className="flex justify-between items-center py-2 border-b border-bank-border-light/40">
          <span className="text-bank-steel text-sm">{f.label}</span>
          <span className="text-bank-text text-sm font-medium flex items-center gap-2">
            {f.value}
            <span className="text-bank-emerald text-xs font-semibold">Verified</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function AffordabilityWorkbook({ language }: { language: Language }) {
  const rows = [
    { key: "afford.theoreticalInterest", value: mockAffordability.theoreticalInterest },
    { key: "afford.amortisation", value: mockAffordability.annualAmortisation },
    { key: "afford.maintenance", value: mockAffordability.maintenanceCost },
    { key: "afford.totalCost", value: mockAffordability.totalAnnualCost, bold: true },
    { key: "afford.grossIncome", value: mockAffordability.grossAnnualIncome },
  ];

  const ratio = mockAffordability.housingCostRatio;
  const threshold = 33.3;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {rows.map((r) => (
          <div
            key={r.key}
            className={`flex justify-between py-2 border-b border-bank-border-light/40 text-sm ${
              r.bold ? "font-semibold" : ""
            }`}
          >
            <span className="text-bank-steel">{t(r.key, language)}</span>
            <span className="text-bank-text font-mono">{formatCHF(r.value)}</span>
          </div>
        ))}
      </div>

      {/* Ratio bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-bank-steel">{t("afford.ratio", language)}</span>
          <span className="text-bank-emerald font-bold text-lg">{formatPercent(ratio)}</span>
        </div>
        <div className="relative h-4 bg-bank-elevated rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-bank-emerald/60 rounded-full"
            style={{ width: `${(ratio / 50) * 100}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-px bg-bank-gold"
            style={{ left: `${(threshold / 50) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-bank-text-secondary">
          <span>0%</span>
          <span className="text-bank-gold">{t("afford.threshold", language)}</span>
          <span>50%</span>
        </div>
      </div>

      {/* Equity */}
      <div className="space-y-2">
        <p className="text-bank-steel text-sm font-medium">{t("afford.equity", language)}</p>
        <div className="flex justify-between text-sm border-b border-bank-border-light/40 py-1">
          <span className="text-bank-steel">{t("afford.liquid", language)}</span>
          <span className="text-bank-text font-mono">{formatCHF(mockAffordability.equityLiquid)}</span>
        </div>
        <div className="flex justify-between text-sm border-b border-bank-border-light/40 py-1">
          <span className="text-bank-steel">{t("afford.pillar2", language)}</span>
          <span className="text-bank-text font-mono">{formatCHF(mockAffordability.equityPillar2)}</span>
        </div>
        <div className="flex justify-between text-sm py-1 font-semibold">
          <span className="text-bank-steel">Total</span>
          <span className="text-bank-text font-mono">{formatCHF(mockAffordability.equityTotal)}</span>
        </div>
      </div>
    </div>
  );
}

function CreditCheckLog({ language }: { language: Language }) {
  const timestamps = [
    "14:23:10.891",
    "14:23:11.234",
    "14:23:11.445",
    "14:23:12.445",
  ];

  const allChecks = mockComplianceChecks.flatMap((check, i) => {
    const mainRow = {
      name: t(`comply.${check.name}`, language),
      status: check.status,
      timestamp: timestamps[i] || "14:23:12.000",
      indent: false,
    };
    const subRows = (check.subChecks || []).map((sc) => ({
      name: t(`comply.${sc.name}`, language),
      status: sc.status,
      timestamp: timestamps[i] || "14:23:12.000",
      indent: true,
    }));
    return [mainRow, ...subRows];
  });

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid grid-cols-3 text-xs text-bank-text-secondary uppercase tracking-wider pb-2 border-b border-bank-border-light">
        <span>Check</span>
        <span className="text-center">Result</span>
        <span className="text-right">Timestamp</span>
      </div>
      {allChecks.map((c, i) => (
        <div
          key={i}
          className={`grid grid-cols-3 text-sm py-2 border-b border-bank-border-light/30 ${
            c.indent ? "pl-6" : ""
          }`}
        >
          <span className="text-bank-text">{c.name}</span>
          <span className="text-center">
            <span className="inline-flex items-center gap-1.5 text-bank-emerald text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-bank-emerald" />
              CLEAR
            </span>
          </span>
          <span className="text-right text-bank-text-secondary font-mono text-xs">
            {c.timestamp}
          </span>
        </div>
      ))}
    </div>
  );
}

function TitleCheckReport() {
  const sections = [
    { label: "Property Description", value: "Eigentumswohnung, 4.5 rooms, 142m² NWF, Seefeldstrasse 42, 8008 Zürich" },
    { label: "Registered Owner", value: "Immobilien Seefeldstrasse AG (current) — Transfer pending to Dr. Andreas Meier" },
    { label: "Encumbrances (Lasten)", value: "None", status: "CLEAR" },
    { label: "Easements (Dienstbarkeiten)", value: "None", status: "CLEAR" },
    { label: "Existing Mortgage Liens (Grundpfandrechte)", value: "None existing", status: "CLEAR" },
    { label: "Pre-emption Rights (Vorkaufsrechte)", value: "None registered", status: "CLEAR" },
    { label: "Public Law Restrictions", value: "Standard cantonal building regulations apply", status: "CLEAR" },
  ];

  return (
    <div className="space-y-1">
      <div className="text-xs text-bank-gold uppercase tracking-wider font-semibold mb-4">
        Grundbuch — Canton Zürich — Land Registry Extract
      </div>
      {sections.map((s) => (
        <div
          key={s.label}
          className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-bank-border-light/40 gap-1"
        >
          <span className="text-bank-steel text-sm">{s.label}</span>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-bank-text">{s.value}</span>
            {s.status && (
              <span className="text-bank-emerald text-xs font-bold px-2 py-0.5 bg-bank-emerald/10 rounded">
                {s.status}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function RiskMatrix({ language }: { language: Language }) {
  return (
    <div className="space-y-5">
      {mockRiskScores.map((rs) => (
        <div key={rs.dimension} className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-bank-text">{rs.dimension}</span>
            <span className="text-bank-text-secondary text-xs">
              Weight: {rs.weight}% | Score: {rs.score}/100 | Weighted: {rs.weighted.toFixed(1)}
            </span>
          </div>
          <div className="h-3 bg-bank-elevated rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${riskBarColors[rs.color]}`}
              style={{ width: `${rs.score}%` }}
            />
          </div>
        </div>
      ))}
      <div className="flex justify-between items-center pt-4 border-t border-bank-border-light">
        <span className="text-bank-text font-semibold text-sm">
          {t("risk.composite", language)}
        </span>
        <span className="text-bank-emerald font-bold text-xl">{compositeScore}/100</span>
      </div>
    </div>
  );
}

function OfferSummary({ language }: { language: Language }) {
  const rows = [
    { label: t("offer.mortgage", language), value: formatCHF(mockLtv.totalMortgage), highlight: true },
    { label: t("offer.tranche1", language), value: formatCHF(mockLtv.firstMortgage) },
    { label: `  ${t("offer.saron", language)}`, value: "1.45%" },
    { label: `  ${t("offer.fixed5", language)}`, value: "1.85%", badge: t("offer.recommended", language) },
    { label: `  ${t("offer.fixed10", language)}`, value: "2.15%" },
    { label: t("offer.tranche2", language), value: formatCHF(mockLtv.secondMortgage) },
    { label: t("offer.validity", language), value: "27.06.2026" },
  ];

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div
          key={r.label}
          className={`flex justify-between py-2 border-b border-bank-border-light/40 text-sm ${
            r.highlight ? "font-bold" : ""
          }`}
        >
          <span className="text-bank-steel">{r.label}</span>
          <span className="flex items-center gap-2">
            <span className={r.highlight ? "text-bank-gold text-lg" : "text-bank-text font-mono"}>
              {r.value}
            </span>
            {r.badge && (
              <span className="text-[10px] text-bank-gold bg-bank-gold/10 border border-bank-gold/30 px-1.5 py-0.5 rounded-full">
                {r.badge}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

function AuditTrail() {
  const categoryColors: Record<string, string> = {
    EXTRACT: "text-blue-400",
    VERIFY: "text-cyan-400",
    AFFORD: "text-emerald-400",
    LTV: "text-amber-400",
    COMPLY: "text-purple-400",
    RISK: "text-orange-400",
    DECIDE: "text-bank-gold",
    COMM: "text-pink-400",
  };

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="grid grid-cols-[100px_80px_1fr] text-xs text-bank-text-secondary uppercase tracking-wider pb-2 border-b border-bank-border-light font-mono">
        <span>Timestamp</span>
        <span>Category</span>
        <span>Message</span>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {mockAuditLog.map((entry, i) => (
          <div
            key={i}
            className="grid grid-cols-[100px_80px_1fr] text-xs py-1.5 border-b border-bank-border-light/20 font-mono"
          >
            <span className="text-bank-text-secondary">{entry.timestamp}</span>
            <span className={categoryColors[entry.category] || "text-bank-text"}>
              {entry.category}
            </span>
            <span className="text-bank-text">{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Download PDF button ───

function DownloadPdfButton({ language }: { language: Language }) {
  return (
    <button className="absolute top-3 right-3 flex items-center gap-1.5 text-bank-gold text-xs hover:text-bank-gold-dim transition-colors">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 1v9M3.5 7L7 10.5 10.5 7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1 12h12" strokeLinecap="round" />
      </svg>
      {t("casefile.download", language)}
    </button>
  );
}

// ─── Main component ───

export default function CaseFile({ language, onComplete }: CaseFileProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [storing, setStoring] = useState(false);
  const [storeProgress, setStoreProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [direction, setDirection] = useState(0);

  const handleTabChange = useCallback(
    (index: number) => {
      setDirection(index > activeTab ? 1 : -1);
      setActiveTab(index);
    },
    [activeTab]
  );

  const handleStore = () => {
    if (storing) return;
    setStoring(true);
    setStoreProgress(0);

    const interval = setInterval(() => {
      setStoreProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
            onComplete();
          }, 2000);
          return 100;
        }
        return prev + 100 / 30; // 30 steps over 1.5s (50ms each)
      });
    }, 50);
  };

  const tabContent = [
    <KycSummary key="kyc" />,
    <AffordabilityWorkbook key="afford" language={language} />,
    <CreditCheckLog key="credit" language={language} />,
    <TitleCheckReport key="title" />,
    <RiskMatrix key="risk" language={language} />,
    <OfferSummary key="offer" language={language} />,
    <AuditTrail key="audit" />,
  ];

  return (
    <div className="w-full max-w-5xl mx-auto relative">
      {/* Toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.3 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-bank-surface border border-bank-gold/40 rounded-lg px-5 py-3 shadow-2xl"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="#C9A84C" strokeWidth="1.5" />
              <path d="M6 10l3 3 5-6" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm text-bank-text">
              Case {mockApplicant.referenceNumber} {t("casefile.stored", language)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <h2 className="text-bank-text text-lg font-semibold mb-6">
        {t("casefile.title", language)}
      </h2>

      {/* Card container */}
      <div className="rounded-lg border border-bank-border-light bg-bank-surface overflow-hidden shadow-xl">
        {/* Tab bar */}
        <div className="relative flex overflow-x-auto border-b border-bank-border-light bg-bank-surface">
          {tabKeys.map((key, i) => (
            <button
              key={key}
              onClick={() => handleTabChange(i)}
              className={`relative px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                activeTab === i
                  ? "text-bank-gold"
                  : "text-bank-text-secondary hover:text-bank-text"
              }`}
            >
              {t(key, language)}
              {activeTab === i && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-bank-gold"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab panel */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ x: direction > 0 ? 80 : -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -80 : 80, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative p-6 bg-bank-elevated/30 min-h-[360px]"
            >
              <DownloadPdfButton language={language} />
              {tabContent[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex flex-wrap gap-3 justify-center mt-8">
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-md border border-bank-gold text-bank-gold hover:bg-bank-gold hover:text-bank-bg font-medium text-sm transition-all duration-200">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 1v10M4 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 14h14" strokeLinecap="round" />
          </svg>
          {t("casefile.downloadAll", language)}
        </button>

        <button
          onClick={handleStore}
          disabled={storing}
          className="relative flex items-center gap-2 px-6 py-2.5 rounded-md border border-bank-gold text-bank-gold hover:bg-bank-gold hover:text-bank-bg font-medium text-sm transition-all duration-200 overflow-hidden min-w-[180px]"
        >
          {storing && (
            <div
              className="absolute inset-y-0 left-0 bg-bank-gold/20 transition-all duration-100"
              style={{ width: `${Math.min(storeProgress, 100)}%` }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="12" height="12" rx="1.5" />
              <path d="M5 2v4h6V2" />
              <path d="M5 10h6" />
            </svg>
            {t("casefile.store", language)}
          </span>
        </button>
      </div>
    </div>
  );
}
