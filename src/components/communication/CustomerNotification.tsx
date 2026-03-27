"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Language } from "@/lib/types";
import { t, formatCHF } from "@/lib/i18n";
import { mockLtv, mockApplicant, mockProperty } from "@/lib/mock-data";

interface CustomerNotificationProps {
  language: Language;
  onComplete: () => void;
}

function getSubject(lang: Language): string {
  switch (lang) {
    case "de":
      return "Ihr Hypothekenantrag — Genehmigt";
    case "fr":
      return "Votre demande hypothécaire — Approuvée";
    default:
      return "Your Mortgage Application — Approved";
  }
}

function getEmailBody(lang: Language) {
  const name = mockApplicant.name;
  const amount = formatCHF(mockLtv.totalMortgage);
  const property = mockProperty.address;
  const ref = mockApplicant.referenceNumber;

  if (lang === "de") {
    return {
      greeting: `Sehr geehrter Herr ${name},`,
      confirmation: `Wir freuen uns, Ihnen mitteilen zu können, dass Ihr Hypothekenantrag (Ref: ${ref}) geprüft und genehmigt wurde. Nach sorgfältiger Analyse Ihrer finanziellen Unterlagen und der Liegenschaftsbewertung können wir Ihnen ein Hypothekarangebot in Höhe von ${amount} unterbreiten.`,
      detailsTitle: "Zusammenfassung",
      details: [
        ["Liegenschaft", property],
        ["Hypothekarbetrag", amount],
        ["Referenznummer", ref],
      ] as [string, string][],
      stepsTitle: "Nächste Schritte",
      steps: [
        "Vereinbarung eines Notartermins zur Beurkundung des Kaufvertrags",
        "Unterzeichnung der Hypothekarvereinbarung in unserer Filiale",
        "Bereitstellung der Mittel innerhalb von 5 Bankwerktagen nach Vertragsunterzeichnung",
        "Einreichung der Gebäudeversicherungspolice vor Auszahlung",
      ],
      closing: "Für Fragen stehen wir Ihnen jederzeit gerne zur Verfügung.",
      signoff: "Freundliche Grüsse",
      bank: "Swiss National Bank AG\nHypothekarabteilung",
    };
  }

  if (lang === "fr") {
    return {
      greeting: `Cher ${name},`,
      confirmation: `Nous avons le plaisir de vous informer que votre demande hypothécaire (Réf: ${ref}) a été examinée et approuvée. Après analyse approfondie de vos documents financiers et de l'évaluation du bien immobilier, nous sommes en mesure de vous proposer une hypothèque d'un montant de ${amount}.`,
      detailsTitle: "Résumé",
      details: [
        ["Bien immobilier", property],
        ["Montant hypothécaire", amount],
        ["Numéro de référence", ref],
      ] as [string, string][],
      stepsTitle: "Prochaines étapes",
      steps: [
        "Prise de rendez-vous chez le notaire pour l'acte de vente",
        "Signature du contrat hypothécaire dans notre agence",
        "Mise à disposition des fonds dans les 5 jours ouvrables suivant la signature",
        "Remise de la police d'assurance bâtiment avant le versement",
      ],
      closing:
        "N'hésitez pas à nous contacter pour toute question complémentaire.",
      signoff: "Avec nos meilleures salutations",
      bank: "Swiss National Bank AG\nDépartement hypothécaire",
    };
  }

  // English
  return {
    greeting: `Dear ${name},`,
    confirmation: `We are pleased to inform you that your mortgage application (Ref: ${ref}) has been reviewed and approved. Following a thorough analysis of your financial documentation and property valuation, we are delighted to offer you a mortgage of ${amount}.`,
    detailsTitle: "Key Details",
    details: [
      ["Property", property],
      ["Mortgage Amount", amount],
      ["Reference Number", ref],
    ] as [string, string][],
    stepsTitle: "Next Steps",
    steps: [
      "Schedule a notary appointment for the property transfer deed",
      "Sign the mortgage agreement at our branch office",
      "Fund disbursement within 5 business days following contract execution",
      "Submit building insurance policy prior to disbursement",
    ],
    closing:
      "Should you have any questions, please do not hesitate to contact your relationship manager.",
    signoff: "Kind regards",
    bank: "Swiss National Bank AG\nMortgage Department",
  };
}

const langLabel: Record<Language, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
};

export default function CustomerNotification({
  language,
  onComplete,
}: CustomerNotificationProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [sent, setSent] = useState(false);

  const body = getEmailBody(language);

  const handleSend = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    setSent(true);
    setTimeout(() => onComplete(), 1000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative">
      {/* Email client frame */}
      <div className="rounded-lg border border-bank-border-light bg-bank-surface overflow-hidden shadow-xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-bank-elevated/60 border-b border-bank-border-light">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-bank-steel/40" />
            <span className="w-3 h-3 rounded-full bg-bank-steel/40" />
            <span className="w-3 h-3 rounded-full bg-bank-steel/40" />
          </div>
          <span className="ml-3 text-xs text-bank-text-secondary font-medium">
            {t("comm.title", language)}
          </span>
        </div>

        {/* Email header fields */}
        <div className="px-6 py-4 space-y-2 border-b border-bank-border-light text-sm">
          <div className="flex gap-2">
            <span className="text-bank-text-secondary w-16 flex-shrink-0">To:</span>
            <span className="text-bank-text">andreas.meier@credit-suisse.com</span>
          </div>
          <div className="flex gap-2">
            <span className="text-bank-text-secondary w-16 flex-shrink-0">From:</span>
            <span className="text-bank-text">mortgages@swissnational.ch</span>
          </div>
          <div className="flex gap-2">
            <span className="text-bank-text-secondary w-16 flex-shrink-0">Subject:</span>
            <span className="text-bank-text font-medium">{getSubject(language)}</span>
          </div>
        </div>

        {/* Email body */}
        <div className="px-6 py-6 max-h-[480px] overflow-y-auto bg-[#151d2b]">
          <div className="space-y-5 text-sm text-bank-text leading-relaxed">
            <p>{body.greeting}</p>
            <p>{body.confirmation}</p>

            {/* Details summary */}
            <div className="rounded-md border border-bank-border-light bg-bank-surface/50 p-4">
              <p className="text-bank-gold text-xs font-semibold uppercase tracking-wider mb-3">
                {body.detailsTitle}
              </p>
              <div className="space-y-2">
                {body.details.map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-bank-text-secondary">{label}</span>
                    <span className="text-bank-text font-medium font-mono">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next steps */}
            <div>
              <p className="text-bank-gold text-xs font-semibold uppercase tracking-wider mb-2">
                {body.stepsTitle}
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-bank-text pl-1">
                {body.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            <p>{body.closing}</p>

            <div className="pt-2 border-t border-bank-border-light/50">
              <p className="text-bank-text-secondary">{body.signoff}</p>
              <p className="text-bank-text-secondary whitespace-pre-line mt-1">
                {body.bank}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Language indicator */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-bank-text-secondary">
          Preview language:{" "}
          <span className="text-bank-text font-medium">{langLabel[language]}</span>
        </p>

        {/* Send button */}
        {!sent ? (
          <button
            onClick={handleSend}
            className="px-6 py-2.5 rounded-md border border-bank-gold text-bank-gold hover:bg-bank-gold hover:text-bank-bg font-medium text-sm transition-all duration-200"
          >
            {t("comm.send", language)}
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.8, ease: "easeIn" }}
            className="relative"
          >
            {/* Envelope icon */}
            <svg
              width="40"
              height="28"
              viewBox="0 0 40 28"
              fill="none"
              className="text-bank-gold"
            >
              <rect
                x="1"
                y="1"
                width="38"
                height="26"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M1 1L20 16L39 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            {/* Gold trailing line */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 40 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="absolute left-1/2 -translate-x-1/2 top-full w-px bg-gradient-to-b from-bank-gold to-transparent"
            />
          </motion.div>
        )}
      </div>

      {/* Confirmation dialog overlay */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-bank-surface border border-bank-border-light rounded-lg p-6 max-w-sm mx-4 shadow-2xl"
            >
              <p className="text-bank-text text-sm mb-1 font-medium">
                Confirm Notification
              </p>
              <p className="text-bank-text-secondary text-sm mb-6">
                This will notify the applicant in{" "}
                <span className="text-bank-text font-medium">{langLabel[language]}</span>.
                Confirm?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-md border border-bank-steel text-bank-steel hover:bg-bank-steel/10 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 rounded-md border border-bank-gold text-bank-gold hover:bg-bank-gold hover:text-bank-bg text-sm font-medium transition-all duration-200"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
