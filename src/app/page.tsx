"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Language, DemoPhase, DecisionType } from "@/lib/types";
import SplashScreen from "@/components/splash/SplashScreen";
import TopNav from "@/components/ui/TopNav";
import PropertyDiscovery from "@/components/property/PropertyDiscovery";
import DocumentUpload from "@/components/documents/DocumentUpload";
import ProcessingView from "@/components/processing/ProcessingView";
import MortgageOffer from "@/components/decision/MortgageOffer";
import CustomerNotification from "@/components/communication/CustomerNotification";
import CaseFile from "@/components/decision/CaseFile";
import { t } from "@/lib/i18n";

const phaseTransition = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0, 0, 0.58, 1] as const } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.3, ease: [0.42, 0, 1, 1] as const } },
};

export default function Home() {
  const [phase, setPhase] = useState<DemoPhase>("splash");
  const [language, setLanguage] = useState<Language>("en");
  const [, setDecision] = useState<DecisionType>("GREEN");
  const [sessionStart] = useState<Date>(new Date());

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);

  const goToPhase = useCallback((nextPhase: DemoPhase) => {
    setPhase(nextPhase);
  }, []);

  const handleProcessingComplete = useCallback((d: DecisionType) => {
    setDecision(d);
    goToPhase("decision");
  }, [goToPhase]);

  const showNav = phase !== "splash";

  return (
    <main className="min-h-screen bg-bank-bg relative">
      {/* Confidential Watermark */}
      <div className="watermark">{t("nav.confidential", language)}</div>

      {/* Top Navigation */}
      {showNav && (
        <motion.div
          initial={{ opacity: 0, y: -48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <TopNav
            language={language}
            onLanguageChange={handleLanguageChange}
            referenceNumber="REF-2026-4817"
            sessionStart={sessionStart}
          />
        </motion.div>
      )}

      {/* Phase Content */}
      <div className={showNav ? "pt-12" : ""}>
        <AnimatePresence mode="wait">
          {phase === "splash" && (
            <motion.div key="splash" {...phaseTransition}>
              <SplashScreen
                language={language}
                onBegin={() => goToPhase("property")}
              />
            </motion.div>
          )}

          {phase === "property" && (
            <motion.div key="property" {...phaseTransition}>
              <div className="max-w-5xl mx-auto px-8 py-12">
                <PropertyDiscovery
                  language={language}
                  onComplete={() => goToPhase("documents")}
                />
              </div>
            </motion.div>
          )}

          {phase === "documents" && (
            <motion.div key="documents" {...phaseTransition}>
              <div className="max-w-6xl mx-auto px-8 py-12">
                <DocumentUpload
                  language={language}
                  onComplete={() => goToPhase("processing")}
                />
              </div>
            </motion.div>
          )}

          {phase === "processing" && (
            <motion.div key="processing" {...phaseTransition}>
              <ProcessingView
                language={language}
                onComplete={handleProcessingComplete}
              />
            </motion.div>
          )}

          {phase === "decision" && (
            <motion.div key="decision" {...phaseTransition}>
              <div className="max-w-5xl mx-auto px-8 py-12">
                <MortgageOffer
                  language={language}
                  onComplete={() => goToPhase("communication")}
                />
              </div>
            </motion.div>
          )}

          {phase === "communication" && (
            <motion.div key="communication" {...phaseTransition}>
              <div className="max-w-4xl mx-auto px-8 py-12">
                <CustomerNotification
                  language={language}
                  onComplete={() => goToPhase("casefile")}
                />
              </div>
            </motion.div>
          )}

          {phase === "casefile" && (
            <motion.div key="casefile" {...phaseTransition}>
              <div className="max-w-6xl mx-auto px-8 py-12">
                <CaseFile
                  language={language}
                  onComplete={() => goToPhase("splash")}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Demo Phase Indicator - presenter shortcut at bottom-right */}
      {showNav && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2"
        >
          <div className="surface-button px-3 py-1.5 text-xs font-mono text-bank-text-secondary">
            Phase: {phase.toUpperCase()}
          </div>
          {phase !== "processing" && (
            <button
              onClick={() => {
                const phases: DemoPhase[] = [
                  "splash", "property", "documents", "processing",
                  "decision", "communication", "casefile"
                ];
                const idx = phases.indexOf(phase);
                if (idx < phases.length - 1) {
                  goToPhase(phases[idx + 1]);
                }
              }}
              className="surface-button px-3 py-1.5 text-xs text-bank-gold hover:text-bank-text transition-colors"
              title="Skip to next phase (presenter shortcut)"
            >
              Skip →
            </button>
          )}
        </motion.div>
      )}
    </main>
  );
}
