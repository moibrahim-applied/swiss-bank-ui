"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Language } from "@/lib/types";
import { t } from "@/lib/i18n";

interface TopNavProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  referenceNumber: string;
  sessionStart: Date;
}

const languages: Language[] = ["de", "fr", "en"];

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function TopNav({
  language,
  onLanguageChange,
  referenceNumber,
  sessionStart,
}: TopNavProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setElapsed(Math.floor((now.getTime() - sessionStart.getTime()) / 1000));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [sessionStart]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-[48px] items-center justify-between border-b border-bank-border-light bg-bank-bg px-4">
      {/* Left: Logo + brand */}
      <div className="flex items-center gap-2">
        {/* Small Swiss cross icon 16px */}
        <svg
          width={16}
          height={16}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x={2} y={6} width={12} height={4} fill="#C9A84C" />
          <rect x={6} y={2} width={4} height={12} fill="#C9A84C" />
        </svg>
        <span className="font-institutional text-sm font-semibold text-[#C9A84C]">
          MortgageForge
        </span>
      </div>

      {/* Center: Reference number */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <span
          className="text-xs text-bank-text-secondary"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {referenceNumber}
        </span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-5">
        {/* Language toggle */}
        <div className="relative flex items-center gap-0">
          {languages.map((lang, i) => (
            <span key={lang} className="flex items-center">
              {i > 0 && (
                <span className="mx-1 text-xs text-bank-text-secondary/40">
                  |
                </span>
              )}
              <button
                onClick={() => onLanguageChange(lang)}
                className={`relative px-1.5 py-1 text-xs font-medium uppercase transition-colors ${
                  language === lang
                    ? "text-[#C9A84C]"
                    : "text-bank-text-secondary hover:text-bank-text-primary"
                }`}
              >
                {lang}
                {language === lang && (
                  <motion.div
                    layoutId="lang-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9A84C]"
                    transition={{ type: "spring", stiffness: 500, damping: 30, duration: 0.2 }}
                  />
                )}
              </button>
            </span>
          ))}
        </div>

        {/* Session timer */}
        <span
          className="text-xs text-bank-text-secondary"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {formatElapsed(elapsed)}
        </span>

        {/* User avatar */}
        <div className="flex flex-col items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bank-elevated text-xs font-medium text-bank-text-secondary">
            AM
          </div>
          <span className="mt-0.5 text-[9px] leading-none text-bank-text-secondary">
            {t("nav.role", language)}
          </span>
        </div>
      </div>
    </nav>
  );
}
