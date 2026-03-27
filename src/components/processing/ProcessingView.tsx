"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Language, ProcessingStep, StepStatus, DecisionType } from "@/lib/types";
import { t, formatCHF, formatPercent } from "@/lib/i18n";
import {
  mockApplicant,
  mockAffordability,
  mockLtv,
  mockRiskScores,
  compositeScore,
  mockAuditLog,
} from "@/lib/mock-data";

/* ─────────────────────── Types ─────────────────────── */

interface ProcessingViewProps {
  language: Language;
  onComplete: (decision: DecisionType) => void;
}

type Stage = "extraction" | "analysis" | "risk" | "decision";

interface StepDef {
  key: ProcessingStep;
  i18nKey: string;
}

const STEPS: StepDef[] = [
  { key: "extraction", i18nKey: "processing.step.extraction" },
  { key: "verification", i18nKey: "processing.step.verification" },
  { key: "affordability", i18nKey: "processing.step.affordability" },
  { key: "ltv", i18nKey: "processing.step.ltv" },
  { key: "compliance", i18nKey: "processing.step.compliance" },
  { key: "legal", i18nKey: "processing.step.legal" },
  { key: "risk", i18nKey: "processing.step.risk" },
  { key: "communication", i18nKey: "processing.step.communication" },
];

const DOC_LABELS = ["Passport", "Salary 1", "Salary 2", "Tax", "Betreibung", "Employment"];

const CATEGORY_COLORS: Record<string, string> = {
  EXTRACT: "text-bank-steel",
  VERIFY: "text-bank-text-secondary",
  AFFORD: "text-bank-gold",
  LTV: "text-bank-gold",
  COMPLY: "text-bank-amber",
  RISK: "text-bank-emerald",
  DECIDE: "text-bank-gold",
  COMM: "text-bank-gold",
};

const COLOR_MAP = {
  emerald: "bg-bank-emerald",
  amber: "bg-bank-amber",
  crimson: "bg-bank-crimson",
} as const;

/* ────────────────── Utility Helpers ────────────────── */

function now(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ──────────────── Animated Number (rolls digits) ──────────────── */

function AnimatedNumber({ value, duration = 800, prefix = "" }: { value: string; duration?: number; prefix?: string }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let cancelled = false;
    const chars = value.split("");
    chars.forEach((char, i) => {
      setTimeout(() => {
        if (!cancelled) setDisplayed(value.slice(0, i + 1));
      }, (duration / chars.length) * i);
    });
    return () => { cancelled = true; };
  }, [value, duration]);
  return <span>{prefix}{displayed}</span>;
}

/* ──────────────── Pulsing Dots ──────────────── */

function PulsingDots() {
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-bank-gold"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  );
}

/* ────────────── Spinning Ring (gold) ────────────── */

function SpinningRing() {
  return (
    <motion.div
      className="w-5 h-5 rounded-full border-2 border-transparent"
      style={{ borderTopColor: "#C9A84C", borderRightColor: "rgba(201,168,76,0.3)" }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
    />
  );
}

/* ────────────────── Step Tracker ────────────────── */

function StepTracker({ steps, statuses, lang }: { steps: StepDef[]; statuses: Record<ProcessingStep, StepStatus>; lang: Language }) {
  return (
    <div className="flex flex-col gap-0 mt-4">
      {steps.map((step, idx) => {
        const status = statuses[step.key];
        const isLast = idx === steps.length - 1;
        return (
          <div key={step.key} className="flex items-start gap-3">
            {/* Circle + connecting line */}
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                {status === "pending" && (
                  <div className="w-4 h-4 rounded-full border border-bank-elevated" />
                )}
                {status === "active" && <SpinningRing />}
                {status === "completed" && (
                  <div className="w-5 h-5 rounded-full bg-bank-gold/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-bank-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {status === "failed" && (
                  <div className="w-5 h-5 rounded-full bg-bank-crimson/20 flex items-center justify-center">
                    <span className="text-bank-crimson text-xs font-bold">!</span>
                  </div>
                )}
              </div>
              {/* Connecting line */}
              {!isLast && (
                <div className="w-px h-5 mt-0.5">
                  {status === "completed" ? (
                    <div className="w-full h-full bg-bank-gold" />
                  ) : status === "active" ? (
                    <motion.div
                      className="w-full h-full bg-bank-gold"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  ) : (
                    <div className="w-full h-full bg-bank-elevated/50" />
                  )}
                </div>
              )}
            </div>
            {/* Label */}
            <span
              className={`text-xs leading-5 transition-all duration-300 ${
                status === "completed" || status === "active"
                  ? "text-bank-gold"
                  : "text-bank-text-secondary opacity-50"
              }`}
            >
              {t(step.i18nKey, lang)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────── Left Panel ────────────────── */

function LeftPanel({ statuses, lang }: { statuses: Record<ProcessingStep, StepStatus>; lang: Language }) {
  return (
    <div className="w-1/4 border-r border-bank-border-light p-5 flex flex-col overflow-y-auto">
      <h2 className="text-sm font-institutional text-bank-gold uppercase tracking-wider mb-4">
        {t("processing.title", lang)}
      </h2>

      {/* Application Summary */}
      <div className="surface-card p-4 mb-5">
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-bank-text-secondary">Applicant</span>
            <p className="text-bank-text font-medium">{mockApplicant.name}</p>
          </div>
          <div>
            <span className="text-bank-text-secondary">Property</span>
            <p className="text-bank-text font-medium">Seefeldstrasse 42, 8008 Zürich</p>
          </div>
          <div>
            <span className="text-bank-text-secondary">Reference</span>
            <p className="font-mono-data text-bank-gold text-xs">{mockApplicant.referenceNumber}</p>
          </div>
          <div>
            <span className="text-bank-text-secondary">Submitted</span>
            <p className="font-mono-data text-bank-text-secondary text-xs">{now()}</p>
          </div>
        </div>
      </div>

      {/* Step Tracker */}
      <StepTracker steps={STEPS} statuses={statuses} lang={lang} />
    </div>
  );
}

/* ────────────── Right Panel — Audit Log ────────────── */

function RightPanel({ visibleCount, lang }: { visibleCount: number; lang: Language }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const entries = mockAuditLog.slice(0, visibleCount);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleCount]);

  return (
    <div className="w-1/4 border-l border-bank-border-light p-5 flex flex-col overflow-hidden">
      <h2 className="text-sm font-institutional text-bank-gold uppercase tracking-wider mb-4">
        {t("audit.title", lang)}
      </h2>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        <AnimatePresence>
          {entries.map((entry, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="audit-entry"
            >
              <motion.span
                className="text-bank-gold font-mono-data"
                initial={{ backgroundColor: "rgba(201,168,76,0.2)" }}
                animate={{ backgroundColor: "rgba(201,168,76,0)" }}
                transition={{ duration: 1 }}
              >
                {entry.timestamp}
              </motion.span>
              <span className={`ml-1.5 ${CATEGORY_COLORS[entry.category] || "text-bank-text-secondary"}`}>
                [{entry.category}]
              </span>
              <span className="ml-1.5 text-bank-text-secondary">{entry.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button className="mt-3 text-xs text-bank-gold hover:text-bank-gold-dim transition font-mono-data border border-bank-border-light rounded px-3 py-1.5 self-start">
        {t("audit.export", lang)}
      </button>
    </div>
  );
}

/* ─────────── Stage 1: Document Extraction ─────────── */

function DocumentExtraction({ onDone }: { onDone: () => void }) {
  const [scannedIdx, setScannedIdx] = useState(-1);
  const [showTable, setShowTable] = useState(false);
  const [tableRows, setTableRows] = useState(0);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Scan documents one by one
    DOC_LABELS.forEach((_, i) => {
      timers.push(setTimeout(() => setScannedIdx(i), 400 * i));
    });
    // Show table after all scanned
    timers.push(setTimeout(() => setShowTable(true), 400 * DOC_LABELS.length + 200));
    // Populate rows
    const tableDelay = 400 * DOC_LABELS.length + 400;
    for (let r = 0; r < 5; r++) {
      timers.push(setTimeout(() => setTableRows(r + 1), tableDelay + r * 200));
    }
    // Show validation lines
    timers.push(setTimeout(() => setShowValidation(true), tableDelay + 1200));
    // Done
    timers.push(setTimeout(onDone, 3800));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const personalFields = [
    ["Name", mockApplicant.name],
    ["DOB", mockApplicant.dateOfBirth],
    ["Employer", mockApplicant.employer],
    ["Gross Income", formatCHF(mockApplicant.grossIncome)],
    ["Liquid Assets", formatCHF(mockApplicant.liquidAssets)],
  ];

  const propertyFields = [
    ["Address", "Seefeldstrasse 42, Zürich"],
    ["Type", "Eigentumswohnung"],
    ["Asking Price", formatCHF(1850000)],
    ["NWF", "142 m²"],
    ["Canton", "ZH"],
  ];

  return (
    <div className="flex flex-col items-center gap-4 px-4">
      {/* Document Icons Row */}
      <div className="flex gap-3 justify-center">
        {DOC_LABELS.map((label, idx) => (
          <motion.div
            key={label}
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0.4, scale: 0.9 }}
            animate={
              idx <= scannedIdx
                ? { opacity: 1, scale: 1 }
                : { opacity: 0.4, scale: 0.9 }
            }
            transition={{ duration: 0.3 }}
          >
            <div className="relative w-10 h-12 rounded bg-bank-surface border border-bank-border-light flex items-center justify-center overflow-hidden">
              <svg className="w-5 h-5 text-bank-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              {idx === scannedIdx && (
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-bank-gold"
                  initial={{ top: 0 }}
                  animate={{ top: "100%" }}
                  transition={{ duration: 0.35, ease: "linear" }}
                />
              )}
              {idx < scannedIdx && (
                <div className="absolute inset-0 bg-bank-gold/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-bank-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            <span className="text-[9px] text-bank-text-secondary whitespace-nowrap">{label}</span>
          </motion.div>
        ))}
      </div>

      {/* Data Table */}
      <AnimatePresence>
        {showTable && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full grid grid-cols-2 gap-4 mt-2"
          >
            {/* Personal Profile */}
            <div className="surface-card p-3">
              <h4 className="text-xs font-institutional text-bank-gold mb-2">Personal Profile</h4>
              <div className="space-y-1.5">
                {personalFields.slice(0, tableRows).map(([label, val]) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between text-xs"
                  >
                    <span className="text-bank-text-secondary">{label}</span>
                    <span className="font-mono-data text-bank-text">
                      <AnimatedNumber value={val} duration={500} />
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Property Profile */}
            <div className="surface-card p-3">
              <h4 className="text-xs font-institutional text-bank-gold mb-2">Property Profile</h4>
              <div className="space-y-1.5">
                {propertyFields.slice(0, tableRows).map(([label, val]) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between text-xs"
                  >
                    <span className="text-bank-text-secondary">{label}</span>
                    <span className="font-mono-data text-bank-text">
                      <AnimatedNumber value={val} duration={500} />
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cross-validation */}
      <AnimatePresence>
        {showValidation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            {["Income", "Identity", "Employment"].map((field) => (
              <motion.span
                key={field}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[10px] bg-bank-emerald/20 text-bank-emerald px-2 py-0.5 rounded font-mono-data"
              >
                {field} Match ✓
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────── Stage 2: Parallel Analysis — Affordability ──────── */

function AffordabilityColumn({ lang, active }: { lang: Language; active: boolean }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showBar, setShowBar] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const lines = 7;
    for (let i = 0; i < lines; i++) {
      timers.push(setTimeout(() => setVisibleLines(i + 1), 300 * i));
    }
    timers.push(setTimeout(() => setShowBar(true), 300 * lines + 200));
    timers.push(setTimeout(() => setShowBadge(true), 300 * lines + 800));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const calcLines = [
    { label: t("afford.theoreticalInterest", lang), value: formatCHF(mockAffordability.theoreticalInterest), highlight: false },
    { label: t("afford.amortisation", lang), value: formatCHF(mockAffordability.annualAmortisation), highlight: false },
    { label: t("afford.maintenance", lang), value: formatCHF(mockAffordability.maintenanceCost), highlight: false },
    { label: "divider", value: "", highlight: false },
    { label: t("afford.totalCost", lang), value: formatCHF(mockAffordability.totalAnnualCost), highlight: true },
    { label: t("afford.grossIncome", lang), value: formatCHF(mockAffordability.grossAnnualIncome), highlight: false },
    { label: t("afford.ratio", lang), value: formatPercent(mockAffordability.housingCostRatio), highlight: true },
  ];

  return (
    <div className="flex-1 surface-card p-3 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">⚖️</span>
        <h4 className="text-xs font-institutional text-bank-gold">{t("afford.title", lang)}</h4>
      </div>

      <div className="space-y-1.5 flex-1">
        {calcLines.slice(0, visibleLines).map((line, idx) => {
          if (line.label === "divider") {
            return (
              <motion.div
                key="divider"
                className="h-px bg-bank-gold/40"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4 }}
                style={{ transformOrigin: "left" }}
              />
            );
          }
          const isRatio = idx === 6;
          return (
            <motion.div
              key={line.label}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex justify-between text-[11px] ${line.highlight ? "font-semibold" : ""}`}
            >
              <span className="text-bank-text-secondary">{line.label}</span>
              <span
                className={`font-mono-data ${
                  isRatio ? "text-bank-emerald" : "text-bank-text"
                } ${isRatio ? "text-xs" : ""}`}
                style={isRatio ? { textShadow: "0 0 8px rgba(5,150,105,0.4)" } : undefined}
              >
                <AnimatedNumber value={line.value} duration={400} />
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Threshold bar */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 relative h-5 bg-bank-surface rounded-sm overflow-hidden"
          >
            <motion.div
              className="absolute top-0 left-0 h-full bg-bank-emerald/60 rounded-sm"
              initial={{ width: "0%" }}
              animate={{ width: `${(28.1 / 50) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <div
              className="absolute top-0 h-full w-px bg-bank-gold"
              style={{ left: `${(33.3 / 50) * 100}%` }}
            />
            <span
              className="absolute top-0 text-[8px] text-bank-gold font-mono-data"
              style={{ left: `${(33.3 / 50) * 100}%`, transform: "translateX(-50%)", top: "-12px" }}
            >
              33.3%
            </span>
            <span
              className="absolute text-[8px] text-bank-emerald font-mono-data top-1"
              style={{ left: `${(28.1 / 50) * 50}%`, transform: "translateX(-50%)" }}
            >
              28.1%
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PASS badge */}
      <AnimatePresence>
        {showBadge && (
          <motion.div
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="mt-2 self-center bg-bank-emerald text-white text-[10px] font-bold px-3 py-0.5 rounded tracking-widest"
          >
            PASS
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────── Stage 2: Parallel Analysis — LTV ──────── */

function LtvColumn({ lang, active }: { lang: Language; active: boolean }) {
  const [showBars, setShowBars] = useState(false);
  const [showGauge, setShowGauge] = useState(false);
  const [showTranche, setShowTranche] = useState(false);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    if (!active) return;
    const t1 = setTimeout(() => setShowBars(true), 300);
    const t2 = setTimeout(() => setShowGauge(true), 1200);
    const t3 = setTimeout(() => setShowTranche(true), 2400);
    const t4 = setTimeout(() => setShowChart(true), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [active]);

  // Semicircular gauge
  const gaugeRadius = 50;
  const gaugeStroke = 8;
  const gaugeCx = 60;
  const gaugeCy = 55;
  const ltvAngle = (mockLtv.ltv / 100) * 180;

  function arcPath(startAngle: number, endAngle: number, r: number): string {
    const startRad = ((180 + startAngle) * Math.PI) / 180;
    const endRad = ((180 + endAngle) * Math.PI) / 180;
    const x1 = gaugeCx + r * Math.cos(startRad);
    const y1 = gaugeCy + r * Math.sin(startRad);
    const x2 = gaugeCx + r * Math.cos(endRad);
    const y2 = gaugeCy + r * Math.sin(endRad);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }

  const chartData = mockLtv.amortisationYears.map((d) => ({
    year: d.year,
    balance: d.balance,
    ltvLine: mockLtv.purchasePrice * 0.65,
  }));

  return (
    <div className="flex-1 surface-card p-3 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🏢</span>
        <h4 className="text-xs font-institutional text-bank-gold">{t("ltv.title", lang)}</h4>
      </div>

      {/* Price comparison bars */}
      {showBars && (
        <div className="flex gap-3 justify-center mb-3 h-20">
          {[
            { label: t("ltv.purchasePrice", lang), value: mockLtv.purchasePrice, pct: 96 },
            { label: t("ltv.benchmark", lang), value: mockLtv.benchmarkValuation, pct: 100 },
          ].map((bar) => (
            <div key={bar.label} className="flex flex-col items-center justify-end w-16">
              <motion.div
                className="w-8 bg-bank-gold/60 rounded-t"
                initial={{ height: 0 }}
                animate={{ height: `${bar.pct * 0.6}px` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <span className="text-[8px] font-mono-data text-bank-text mt-1">{formatCHF(bar.value)}</span>
              <span className="text-[7px] text-bank-text-secondary">{bar.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* LTV Gauge */}
      {showGauge && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mb-2">
          <svg width="120" height="70" viewBox="0 0 120 70">
            {/* Emerald zone 0-65% */}
            <path d={arcPath(0, 117, gaugeRadius)} fill="none" stroke="#059669" strokeWidth={gaugeStroke} strokeLinecap="round" opacity={0.5} />
            {/* Amber zone 65-80% */}
            <path d={arcPath(117, 144, gaugeRadius)} fill="none" stroke="#D97706" strokeWidth={gaugeStroke} strokeLinecap="round" opacity={0.5} />
            {/* Crimson zone 80-100% */}
            <path d={arcPath(144, 180, gaugeRadius)} fill="none" stroke="#DC2626" strokeWidth={gaugeStroke} strokeLinecap="round" opacity={0.5} />
            {/* Needle */}
            <motion.line
              x1={gaugeCx}
              y1={gaugeCy}
              x2={gaugeCx + (gaugeRadius - 12) * Math.cos(((180 + ltvAngle) * Math.PI) / 180)}
              y2={gaugeCy + (gaugeRadius - 12) * Math.sin(((180 + ltvAngle) * Math.PI) / 180)}
              stroke="#C9A84C"
              strokeWidth={2}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
            <circle cx={gaugeCx} cy={gaugeCy} r={3} fill="#C9A84C" />
            <text x={gaugeCx} y={gaugeCy - 8} textAnchor="middle" fill="#C9A84C" fontSize="11" fontFamily="JetBrains Mono" fontWeight="600">
              {mockLtv.ltv}%
            </text>
          </svg>
        </motion.div>
      )}

      {/* Tranche bar */}
      {showTranche && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
          <div className="flex h-4 rounded-sm overflow-hidden">
            <motion.div
              className="bg-bank-emerald/70 flex items-center justify-center"
              initial={{ width: "0%" }}
              animate={{ width: "65%" }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[7px] text-white font-mono-data">65%</span>
            </motion.div>
            <motion.div
              className="bg-bank-amber/70 flex items-center justify-center"
              initial={{ width: "0%" }}
              animate={{ width: "13%" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="text-[7px] text-white font-mono-data">13%</span>
            </motion.div>
          </div>
          <div className="flex justify-between mt-0.5 text-[7px] text-bank-text-secondary">
            <span>{t("ltv.firstMortgage", lang)}</span>
            <span>{t("ltv.secondMortgage", lang)}</span>
          </div>
        </motion.div>
      )}

      {/* Amortisation chart */}
      {showChart && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-h-0" style={{ height: 80 }}>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={chartData} margin={{ top: 2, right: 4, bottom: 2, left: 4 }}>
              <XAxis dataKey="year" tick={{ fontSize: 8, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, "auto"]} />
              <Tooltip
                contentStyle={{ background: "#1F2937", border: "1px solid #374151", fontSize: 10 }}
                labelStyle={{ color: "#C9A84C" }}
                formatter={(val) => formatCHF(Number(val ?? 0))}
              />
              <ReferenceLine y={mockLtv.purchasePrice * 0.65} stroke="#C9A84C" strokeDasharray="4 4" strokeWidth={1} />
              <Line type="monotone" dataKey="balance" stroke="#C9A84C" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}

/* ──────── Stage 2: Parallel Analysis — Compliance ──────── */

function ComplianceColumn({ lang, active }: { lang: Language; active: boolean }) {
  const [checkStates, setCheckStates] = useState<Record<string, "pending" | "scanning" | "clear">>({
    zek: "pending",
    betreibung: "pending",
    income: "pending",
    seco: "pending",
    eu: "pending",
    ofac: "pending",
    pep: "pending",
  });
  const [showRisk, setShowRisk] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const sequence: [string, number][] = [
      ["zek", 200],
      ["zek_done", 1000],
      ["betreibung", 1200],
      ["betreibung_done", 2000],
      ["income", 2200],
      ["income_done", 3000],
      ["seco", 3200],
      ["seco_done", 3600],
      ["eu", 3400],
      ["eu_done", 3800],
      ["ofac", 3600],
      ["ofac_done", 4000],
      ["pep", 3800],
      ["pep_done", 4200],
      ["risk", 4800],
    ];

    sequence.forEach(([action, delay]) => {
      timers.push(
        setTimeout(() => {
          if (action === "risk") {
            setShowRisk(true);
            return;
          }
          const isDone = action.endsWith("_done");
          const key = isDone ? action.replace("_done", "") : action;
          setCheckStates((prev) => ({
            ...prev,
            [key]: isDone ? "clear" : "scanning",
          }));
        }, delay)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [active]);

  const mainChecks = [
    { key: "zek", label: t("comply.zek", lang), detail: "Clear" },
    { key: "betreibung", label: t("comply.betreibung", lang), detail: "Clear" },
    { key: "income", label: t("comply.income", lang), detail: "2.3% variance — PASS" },
  ];

  const amlChecks = [
    { key: "seco", label: t("comply.seco", lang) },
    { key: "eu", label: t("comply.eu", lang) },
    { key: "ofac", label: t("comply.ofac", lang) },
    { key: "pep", label: t("comply.pep", lang) },
  ];

  return (
    <div className="flex-1 surface-card p-3 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🛡️</span>
        <h4 className="text-xs font-institutional text-bank-gold">{t("comply.title", lang)}</h4>
      </div>

      <div className="space-y-2 flex-1">
        {mainChecks.map((check) => (
          <div key={check.key} className="flex items-center justify-between text-[11px]">
            <span className="text-bank-text-secondary">{check.label}</span>
            <span className="font-mono-data">
              {checkStates[check.key] === "pending" && <span className="text-bank-text-secondary">--</span>}
              {checkStates[check.key] === "scanning" && <PulsingDots />}
              {checkStates[check.key] === "clear" && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-bank-emerald"
                >
                  {check.detail}
                </motion.span>
              )}
            </span>
          </div>
        ))}

        {/* AML/KYC */}
        <div className="border-t border-bank-border-light pt-2 mt-2">
          <span className="text-[11px] text-bank-text-secondary">{t("comply.aml", lang)}</span>
          <div className="grid grid-cols-2 gap-1 mt-1">
            {amlChecks.map((check) => (
              <div key={check.key} className="flex items-center gap-1 text-[10px]">
                {checkStates[check.key] === "pending" && (
                  <div className="w-2 h-2 rounded-full border border-bank-elevated" />
                )}
                {checkStates[check.key] === "scanning" && <PulsingDots />}
                {checkStates[check.key] === "clear" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-bank-emerald"
                  />
                )}
                <span className="text-bank-text-secondary">{check.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk badge */}
      <AnimatePresence>
        {showRisk && (
          <motion.div
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="mt-2 self-center bg-bank-emerald text-white text-[10px] font-bold px-3 py-0.5 rounded tracking-widest"
          >
            LOW
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────── Stage 2: Combined Parallel Analysis ──────── */

function ParallelAnalysis({ lang, onDone }: { lang: Language; onDone: () => void }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setActive(true), 100);
    const t2 = setTimeout(onDone, 5800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className="flex flex-col gap-3 px-2 h-full">
      {/* Parallel label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <span className="text-[10px] text-bank-steel font-mono-data">
          3 {t("processing.parallel", lang)}
        </span>
        <motion.div
          className="h-px bg-bank-gold/30 mx-auto mt-1"
          style={{ width: "60%" }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Three columns */}
      <div className="flex gap-3 flex-1 min-h-0">
        <AffordabilityColumn lang={lang} active={active} />
        <LtvColumn lang={lang} active={active} />
        <ComplianceColumn lang={lang} active={active} />
      </div>
    </div>
  );
}

/* ──────── Stage 3: Risk Aggregation ──────── */

function RiskAggregation({ lang, onDone }: { lang: Language; onDone: () => void }) {
  const [visibleBars, setVisibleBars] = useState(0);
  const [showComposite, setShowComposite] = useState(false);
  const [compositeValue, setCompositeValue] = useState(0);
  const [showDecision, setShowDecision] = useState(false);

  const dimensionKeys: Record<string, string> = {
    Affordability: "risk.affordability",
    "LTV Ratio": "risk.ltv",
    "Credit History": "risk.credit",
    "Employment Stability": "risk.employment",
    "Property Quality": "risk.property",
  };

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Show bars one by one
    mockRiskScores.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleBars(i + 1), 400 * i));
    });

    // Show composite
    timers.push(setTimeout(() => setShowComposite(true), 400 * mockRiskScores.length + 400));

    // Count up composite
    const countStart = 400 * mockRiskScores.length + 600;
    for (let v = 0; v <= compositeScore; v++) {
      timers.push(setTimeout(() => setCompositeValue(v), countStart + (v * 600) / compositeScore));
    }

    // Dramatic pause then decision
    timers.push(setTimeout(() => setShowDecision(true), countStart + 1600));

    // Done
    timers.push(setTimeout(onDone, countStart + 3600));

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 h-full">
      <h3 className="text-xs font-institutional text-bank-gold uppercase tracking-wider">
        {t("risk.title", lang)}
      </h3>

      {/* Score bars */}
      <div className="w-full max-w-lg space-y-2">
        {mockRiskScores.slice(0, visibleBars).map((rs) => (
          <motion.div
            key={rs.dimension}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-[10px] text-bank-text-secondary w-24 text-right">
              {t(dimensionKeys[rs.dimension] || rs.dimension, lang)}
            </span>
            <span className="text-[9px] font-mono-data text-bank-text-secondary w-8">({rs.weight}%)</span>
            <div className="flex-1 h-3 bg-bank-surface rounded-sm overflow-hidden">
              <motion.div
                className={`h-full rounded-sm ${COLOR_MAP[rs.color]}`}
                initial={{ width: "0%" }}
                animate={{ width: `${rs.score}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ opacity: 0.7 }}
              />
            </div>
            <span className="text-[10px] font-mono-data text-bank-text w-6 text-right">{rs.score}</span>
          </motion.div>
        ))}
      </div>

      {/* Composite */}
      <AnimatePresence>
        {showComposite && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-1 mt-2"
          >
            <span className="text-[10px] text-bank-text-secondary uppercase tracking-wider">
              {t("risk.composite", lang)}
            </span>
            <div className="w-64 h-4 bg-bank-surface rounded-sm overflow-hidden mb-1">
              <motion.div
                className="h-full bg-bank-emerald/70 rounded-sm"
                initial={{ width: "0%" }}
                animate={{ width: `${compositeScore}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className="text-2xl font-mono-data text-bank-gold font-bold">
              {compositeValue} <span className="text-sm text-bank-text-secondary font-normal">/ 100</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decision card */}
      <AnimatePresence>
        {showDecision && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative mt-2 p-4 rounded-xl border border-bank-gold w-full max-w-md text-center overflow-hidden"
            style={{
              background: "linear-gradient(145deg, rgba(5,150,105,0.1), rgba(5,150,105,0.05))",
            }}
          >
            {/* Gold pulse */}
            <motion.div
              className="absolute inset-0 border border-bank-gold/40 rounded-xl"
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ boxShadow: "0 0 20px rgba(201,168,76,0.2)" }}
            />
            <p className="text-base font-institutional text-bank-gold tracking-wider">
              {t("decision.green.title", lang)}
            </p>
            <p className="text-xs text-bank-text-secondary mt-1">
              {t("decision.green.subtitle", lang)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════ MAIN COMPONENT ══════════════════════ */

export default function ProcessingView({ language, onComplete }: ProcessingViewProps) {
  const [stage, setStage] = useState<Stage>("extraction");
  const [auditCount, setAuditCount] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<Record<ProcessingStep, StepStatus>>(() => {
    const initial: Record<string, StepStatus> = {};
    STEPS.forEach((s) => (initial[s.key] = "pending"));
    return initial as Record<ProcessingStep, StepStatus>;
  });

  const completedRef = useRef(false);

  // Helper to update step statuses
  const setSteps = useCallback((updates: Partial<Record<ProcessingStep, StepStatus>>) => {
    setStepStatuses((prev) => ({ ...prev, ...updates }));
  }, []);

  // Audit log timing - drip entries in sync with stages
  useEffect(() => {
    const schedule: [number, number][] = [
      // Stage 1: entries 0-5 over 0-4s
      [0, 300],
      [1, 800],
      [2, 1500],
      [3, 2200],
      [4, 2800],
      [5, 3500],
      // Stage 1->2 transition entries 6-9
      [6, 4200],
      [7, 4600],
      [8, 5000],
      [9, 5400],
      // Stage 2: entries 10-15 over 4-10s
      [10, 5800],
      [11, 6200],
      [12, 6600],
      [13, 7200],
      [14, 7800],
      [15, 8400],
      [16, 9000],
      [17, 9400],
      [18, 9800],
      [19, 10200],
      // Stage 2->3 entries
      [20, 10600],
      [21, 11000],
      [22, 11400],
      // Stage 3: entries 23-27
      [23, 11800],
      [24, 12200],
      [25, 12600],
      [26, 13000],
      [27, 13400],
      // Decision entries
      [28, 14000],
      [29, 14600],
      [30, 15200],
    ];

    const timers = schedule
      .filter(([idx]) => idx < mockAuditLog.length)
      .map(([idx, delay]) => setTimeout(() => setAuditCount(idx + 1), delay));

    return () => timers.forEach(clearTimeout);
  }, []);

  // Step status timing
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Stage 1: Steps 1-2
    timers.push(setTimeout(() => setSteps({ extraction: "active" }), 0));
    timers.push(setTimeout(() => setSteps({ extraction: "completed", verification: "active" }), 2000));
    timers.push(setTimeout(() => setSteps({ verification: "completed" }), 3800));

    // Stage 2: Steps 3-5 active simultaneously
    timers.push(setTimeout(() => setSteps({ affordability: "active", ltv: "active", compliance: "active" }), 4000));
    timers.push(setTimeout(() => setSteps({ affordability: "completed", ltv: "completed", compliance: "completed" }), 9800));

    // Stage 3: Steps 6-7
    timers.push(setTimeout(() => setSteps({ legal: "active" }), 10000));
    timers.push(setTimeout(() => setSteps({ legal: "completed", risk: "active" }), 11000));
    timers.push(setTimeout(() => setSteps({ risk: "completed" }), 13500));

    // Step 8
    timers.push(setTimeout(() => setSteps({ communication: "active" }), 14000));
    timers.push(setTimeout(() => setSteps({ communication: "completed" }), 15500));

    return () => timers.forEach(clearTimeout);
  }, [setSteps]);

  // Stage transitions
  useEffect(() => {
    const t1 = setTimeout(() => setStage("analysis"), 4000);
    const t2 = setTimeout(() => setStage("risk"), 10000);
    const t3 = setTimeout(() => setStage("decision"), 14000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // onComplete call
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete("GREEN");
      }
    }, 16000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Memoized stage callbacks (no-ops since timing is global)
  const noop = useCallback(() => {}, []);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left Panel */}
      <LeftPanel statuses={stepStatuses} lang={language} />

      {/* Center Panel */}
      <div className="w-1/2 p-5 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {stage === "extraction" && (
            <motion.div
              key="extraction"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col justify-center"
            >
              <DocumentExtraction onDone={noop} />
            </motion.div>
          )}

          {stage === "analysis" && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <ParallelAnalysis lang={language} onDone={noop} />
            </motion.div>
          )}

          {(stage === "risk" || stage === "decision") && (
            <motion.div
              key="risk"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <RiskAggregation lang={language} onDone={noop} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Panel */}
      <RightPanel visibleCount={auditCount} lang={language} />
    </div>
  );
}
