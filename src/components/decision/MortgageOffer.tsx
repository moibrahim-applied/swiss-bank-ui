"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Language } from "@/lib/types";
import { t, formatCHF } from "@/lib/i18n";
import { mockLtv, mockApplicant } from "@/lib/mock-data";

interface MortgageOfferProps {
  language: Language;
  onComplete: () => void;
}

const rateOptions = [
  { key: "saron", rate: 1.45, recommended: false },
  { key: "fixed5", rate: 1.85, recommended: true },
  { key: "fixed10", rate: 2.15, recommended: false },
] as const;

const conditions = [
  "Notary confirmation of property transfer",
  "Building insurance proof (Gebäudeversicherung)",
  "Signed purchase agreement",
  "Confirmation of equity source documentation",
];

export default function MortgageOffer({ language, onComplete }: MortgageOfferProps) {
  const [approved, setApproved] = useState(false);
  const [, setButtonsVisible] = useState(false);

  const handleApprove = () => {
    setApproved(true);
    setTimeout(() => onComplete(), 500);
  };

  const today = new Date();
  const todayStr = `${today.getDate().toString().padStart(2, "0")}.${(today.getMonth() + 1).toString().padStart(2, "0")}.${today.getFullYear()}`;
  const validUntil = "27.06.2026";

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Document container */}
      <div
        className="relative rounded-lg border border-bank-border-light overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #161f2e 0%, #1a2435 50%, #161f2e 100%)",
          boxShadow: "0 0 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* Faint texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative p-8 md:p-12 space-y-6">
          {/* 1. Bank Letterhead */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex justify-between items-start"
          >
            <div className="flex items-start gap-3">
              {/* Gold Swiss cross logo */}
              <div className="w-10 h-10 flex items-center justify-center rounded border border-bank-gold/40 bg-bank-gold/10 flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="8" y="3" width="4" height="14" rx="0.5" fill="#C9A84C" />
                  <rect x="3" y="8" width="14" height="4" rx="0.5" fill="#C9A84C" />
                </svg>
              </div>
              <div>
                <p className="text-bank-text font-semibold text-sm tracking-wide">
                  Swiss National Bank AG
                </p>
                <p className="text-bank-text-secondary text-xs mt-0.5">
                  Bahnhofstrasse 45, 8001 Zürich
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-bank-text-secondary text-xs font-mono">{todayStr}</p>
              <p className="text-bank-text-secondary text-xs font-mono mt-1">
                {mockApplicant.referenceNumber}
              </p>
            </div>
          </motion.div>

          {/* 2. Applicant address */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="pt-4"
          >
            <p className="text-bank-text text-sm">Dr. Andreas Meier</p>
            <p className="text-bank-text text-sm">Seefeldstrasse 42</p>
            <p className="text-bank-text text-sm">8008 Zürich</p>
          </motion.div>

          {/* 3. Subject line */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.3 }}
            className="pt-2"
          >
            <h2 className="text-bank-text font-bold text-base tracking-wide">
              {t("offer.title", language)}
            </h2>
          </motion.div>

          {/* 4. Gold divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.0, duration: 0.6, ease: "easeOut" }}
            style={{ transformOrigin: "left" }}
            className="h-px bg-gradient-to-r from-bank-gold via-bank-gold/60 to-transparent"
          />

          {/* 5. Offer details */}
          <div className="space-y-4 pt-2">
            {/* Property */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.15, duration: 0.3 }}
              className="flex flex-col sm:flex-row sm:justify-between text-sm border-b border-bank-border-light/50 pb-3"
            >
              <span className="text-bank-text-secondary">Property</span>
              <span className="text-bank-text text-right">
                Seefeldstrasse 42, 8008 Zürich — Eigentumswohnung
                <br />
                <span className="text-bank-text-secondary text-xs">
                  {formatCHF(mockLtv.benchmarkValuation)} (benchmark valuation)
                </span>
              </span>
            </motion.div>

            {/* Mortgage Amount */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.3 }}
              className="flex flex-col sm:flex-row sm:justify-between items-baseline border-b border-bank-border-light/50 pb-3"
            >
              <span className="text-bank-text-secondary text-sm">
                {t("offer.mortgage", language)}
              </span>
              <span className="text-bank-gold font-bold text-2xl tracking-tight">
                {formatCHF(mockLtv.totalMortgage)}
              </span>
            </motion.div>

            {/* Tranche 1 */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.25, duration: 0.3 }}
              className="border-b border-bank-border-light/50 pb-4"
            >
              <div className="flex justify-between text-sm mb-3">
                <span className="text-bank-text-secondary">
                  {t("offer.tranche1", language)}
                </span>
                <span className="text-bank-text font-medium">
                  {formatCHF(mockLtv.firstMortgage)}
                </span>
              </div>

              {/* Rate option cards */}
              <div className="grid grid-cols-3 gap-3">
                {rateOptions.map((opt) => (
                  <div
                    key={opt.key}
                    className={`relative rounded-md border p-3 text-center transition-colors ${
                      opt.recommended
                        ? "border-bank-gold/50 bg-bank-gold/5"
                        : "border-bank-border-light bg-bank-surface/40"
                    }`}
                  >
                    {opt.recommended && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-bank-gold bg-bank-gold/15 px-2 py-0.5 rounded-full border border-bank-gold/30">
                        {t("offer.recommended", language)}
                      </span>
                    )}
                    <p className="text-bank-text-secondary text-xs mt-1">
                      {t(`offer.${opt.key}` as string, language)}
                    </p>
                    <p className="text-bank-text font-bold text-lg mt-1">
                      {opt.rate.toFixed(2)}%
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tranche 2 */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3, duration: 0.3 }}
              className="flex flex-col sm:flex-row sm:justify-between text-sm border-b border-bank-border-light/50 pb-3"
            >
              <span className="text-bank-text-secondary">
                {t("offer.tranche2", language)}
              </span>
              <div className="text-right">
                <span className="text-bank-text font-medium">
                  {formatCHF(mockLtv.secondMortgage)}
                </span>
                <p className="text-bank-text-secondary text-xs mt-1">
                  Mandatory amortisation within 15 years
                </p>
              </div>
            </motion.div>

            {/* Conditions Precedent */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.35, duration: 0.3 }}
              className="pb-2"
            >
              <p className="text-bank-text-secondary text-sm mb-2">
                {t("offer.conditions", language)}
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-bank-text pl-1">
                {conditions.map((c, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 + i * 0.05, duration: 0.2 }}
                  >
                    {c}
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          </div>

          {/* Gold divider before footer */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.6, duration: 0.4, ease: "easeOut" }}
            style={{ transformOrigin: "left" }}
            className="h-px bg-gradient-to-r from-bank-gold via-bank-gold/60 to-transparent"
          />

          {/* 6. Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7, duration: 0.3 }}
            className="flex flex-col sm:flex-row sm:justify-between items-start gap-6 pt-2"
          >
            <div className="text-xs text-bank-text-secondary">
              <p>
                {t("offer.validity", language)}: <span className="text-bank-text">{validUntil}</span>
              </p>
            </div>
            <div className="flex gap-8 text-xs text-bank-text-secondary">
              <div className="text-center">
                <div className="w-32 border-b border-bank-text-secondary/40 mb-1" />
                <p>Relationship Manager</p>
              </div>
              <div className="text-center">
                <div className="w-32 border-b border-bank-text-secondary/40 mb-1" />
                <p>Credit Officer</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 7. Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0, duration: 0.4 }}
        onAnimationComplete={() => setButtonsVisible(true)}
        className="flex flex-wrap gap-3 justify-center mt-8"
      >
        <button
          onClick={handleApprove}
          disabled={approved}
          className={`relative overflow-hidden px-6 py-2.5 rounded-md border font-medium text-sm transition-all duration-300 ${
            approved
              ? "bg-bank-gold border-bank-gold text-bank-bg"
              : "border-bank-gold text-bank-gold hover:bg-bank-gold hover:text-bank-bg"
          }`}
        >
          {approved && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-bank-gold"
            />
          )}
          <span className="relative z-10">
            {t("offer.approve", language)}
          </span>
        </button>
        <button className="px-6 py-2.5 rounded-md border border-bank-steel text-bank-steel hover:bg-bank-steel/10 font-medium text-sm transition-colors">
          {t("offer.edit", language)}
        </button>
        <button className="px-6 py-2.5 rounded-md border border-bank-steel text-bank-steel hover:bg-bank-steel/10 font-medium text-sm transition-colors">
          {t("offer.modify", language)}
        </button>
      </motion.div>
    </div>
  );
}
