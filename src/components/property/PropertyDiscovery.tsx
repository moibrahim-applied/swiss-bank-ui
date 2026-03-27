"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Language } from "@/lib/types";
import { t, formatCHF } from "@/lib/i18n";
import { mockProperty } from "@/lib/mock-data";

interface PropertyDiscoveryProps {
  language: Language;
  onComplete: () => void;
}

const DEMO_URL = "https://www.comparis.ch/immobilien/marktplatz/details/48172956";

interface PropertyField {
  labelKey: string;
  value: string;
  verified: boolean;
  isPrice?: boolean;
}

export default function PropertyDiscovery({ language, onComplete }: PropertyDiscoveryProps) {
  const [url, setUrl] = useState(DEMO_URL);
  const [phase, setPhase] = useState<"input" | "loading" | "revealing" | "complete">("input");
  const [borderProgress, setBorderProgress] = useState(0);
  const [showAddress, setShowAddress] = useState(false);
  const [showDivider, setShowDivider] = useState(false);
  const [visibleFields, setVisibleFields] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  const fields: PropertyField[] = [
    { labelKey: "property.askingPrice", value: formatCHF(mockProperty.askingPrice), verified: true, isPrice: true },
    { labelKey: "property.type", value: mockProperty.propertyType, verified: true },
    { labelKey: "property.nwf", value: `${mockProperty.nwf} m²`, verified: true },
    { labelKey: "property.rooms", value: String(mockProperty.rooms), verified: true },
    { labelKey: "property.year", value: String(mockProperty.constructionYear), verified: true },
    { labelKey: "property.agent", value: mockProperty.listingAgent, verified: false },
  ];

  const handleFetch = useCallback(() => {
    setPhase("loading");
    setBorderProgress(0);

    // Animate border progress over 2 seconds
    const start = performance.now();
    const duration = 2000;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setBorderProgress(progress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setPhase("revealing");
      }
    };
    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (phase !== "revealing") return;

    // Step 1: Show address after 100ms
    const t1 = setTimeout(() => setShowAddress(true), 100);
    // Step 2: Show divider after address fades in (400ms)
    const t2 = setTimeout(() => setShowDivider(true), 500);
    // Step 3: Stagger fields by 50ms, starting at 900ms
    const fieldTimers = fields.map((_, i) =>
      setTimeout(() => setVisibleFields(i + 1), 900 + i * 50)
    );
    // Step 4: Show map after fields
    const t3 = setTimeout(() => setShowMap(true), 900 + fields.length * 50 + 200);
    // Step 5: Show continue button
    const t4 = setTimeout(() => {
      setShowContinue(true);
      setPhase("complete");
    }, 900 + fields.length * 50 + 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      fieldTimers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Compute clip-path for the gold border trace animation
  // The border traces the full perimeter: top → right → bottom → left
  const getBorderClipPath = (progress: number): string => {
    // perimeter segments: top (0-0.25), right (0.25-0.5), bottom (0.5-0.75), left (0.75-1)
    if (progress <= 0) return "inset(0 100% 100% 0)";
    if (progress >= 1) return "inset(0 0 0 0)";

    const p = progress * 4; // 0 to 4

    if (p <= 1) {
      // Drawing top edge left to right
      return `polygon(0% 0%, ${p * 100}% 0%, ${p * 100}% 2px, 0% 2px)`;
    } else if (p <= 2) {
      // Top done, drawing right edge top to bottom
      const rp = p - 1;
      return `polygon(0% 0%, 100% 0%, 100% ${rp * 100}%, calc(100% - 2px) ${rp * 100}%, calc(100% - 2px) 2px, 0% 2px)`;
    } else if (p <= 3) {
      // Top + right done, drawing bottom edge right to left
      const bp = p - 2;
      return `polygon(0% 0%, 100% 0%, 100% 100%, ${(1 - bp) * 100}% 100%, ${(1 - bp) * 100}% calc(100% - 2px), calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) 2px, 0% 2px)`;
    } else {
      // Top + right + bottom done, drawing left edge bottom to top
      const lp = p - 3;
      return `polygon(0% ${(1 - lp) * 100}%, 2px ${(1 - lp) * 100}%, 2px calc(100% - 2px), calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) 2px, 0% 2px, 0% 0%, 100% 0%, 100% 100%, 0% 100%)`;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-bank-text-secondary mb-2">
          {t("property.input.label", language)}
        </label>
        <div className="relative">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t("property.input.placeholder", language)}
                disabled={phase !== "input"}
                className="w-full px-4 py-3 bg-bank-surface border border-bank-border-light rounded-lg text-bank-text text-sm gold-focus-ring disabled:opacity-70 transition-all"
              />
              {/* Gold border trace animation */}
              {phase === "loading" && (
                <div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{
                    border: "2px solid var(--bank-gold)",
                    clipPath: getBorderClipPath(borderProgress),
                    transition: "none",
                  }}
                />
              )}
              {phase !== "input" && phase !== "loading" && (
                <div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{
                    border: "2px solid var(--bank-gold)",
                    opacity: 0.6,
                  }}
                />
              )}
            </div>
            <button
              onClick={handleFetch}
              disabled={phase !== "input"}
              className="px-6 py-3 surface-button text-bank-gold border border-bank-gold/30 text-sm font-medium tracking-wide hover:border-bank-gold/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            >
              Fetch Property
            </button>
          </div>
        </div>
      </div>

      {/* Property Card */}
      <AnimatePresence>
        {phase !== "input" && phase !== "loading" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="surface-card p-6 border border-bank-border-light/30">
              {/* Address and Canton */}
              <AnimatePresence>
                {showAddress && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between mb-4"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-bank-text">
                        {mockProperty.address}
                      </h3>
                    </div>
                    <span className="px-3 py-1 bg-bank-surface border border-bank-border-light rounded text-sm text-bank-text-secondary font-mono">
                      {t("property.canton", language)}: {mockProperty.canton}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Gold Divider */}
              {showDivider && (
                <div className="mb-5 h-px bg-bank-surface overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-full bg-bank-gold/60"
                  />
                </div>
              )}

              {/* Property Details Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-5">
                {fields.map((field, i) => (
                  <AnimatePresence key={field.labelKey}>
                    {i < visibleFields && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-bank-text-secondary">
                            {t(field.labelKey, language)}
                          </span>
                          {field.verified ? (
                            <span className="text-bank-gold text-[10px]" title={t("property.verified", language)}>
                              &#10003; {t("property.verified", language)}
                            </span>
                          ) : (
                            <span className="text-bank-steel text-[10px]" title={t("property.unverified", language)}>
                              &#9675; {t("property.unverified", language)}
                            </span>
                          )}
                        </div>
                        <div
                          className={
                            field.isPrice
                              ? "text-lg font-bold text-bank-gold font-mono-data"
                              : "text-sm text-bank-text"
                          }
                        >
                          {field.value}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>

              {/* Map Placeholder */}
              <AnimatePresence>
                {showMap && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative h-40 rounded-lg bg-bank-bg border border-bank-border-light/40 flex items-center justify-center overflow-hidden"
                  >
                    {/* Subtle grid pattern */}
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                      }}
                    />
                    {/* Pin icon */}
                    <div className="flex flex-col items-center gap-2 z-10">
                      <svg
                        width="24"
                        height="32"
                        viewBox="0 0 24 32"
                        fill="none"
                        className="text-bank-gold opacity-60"
                      >
                        <path
                          d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12zm0 16a4 4 0 110-8 4 4 0 010 8z"
                          fill="currentColor"
                        />
                      </svg>
                      <span className="text-sm text-bank-text-secondary">
                        Map — Zürich Seefeld
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Continue Button */}
              <AnimatePresence>
                {showContinue && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-6 flex justify-end"
                  >
                    <button
                      onClick={onComplete}
                      className="px-8 py-3 surface-button border border-bank-gold/40 text-bank-gold font-medium text-sm tracking-wide hover:border-bank-gold hover:shadow-[0_0_12px_rgba(201,168,76,0.2)] transition-all"
                    >
                      {t("demo.next", language)}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
