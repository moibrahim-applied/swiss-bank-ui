"use client";

import { useState, useEffect, useCallback, useRef, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Language } from "@/lib/types";
import { t } from "@/lib/i18n";
import { mockDocuments } from "@/lib/mock-data";

interface DocumentUploadProps {
  language: Language;
  onComplete: () => void;
}

type DocStatus = "pending" | "uploading" | "done";

function getDocName(doc: (typeof mockDocuments)[0], language: Language): string {
  if (language === "de") return doc.nameDE;
  if (language === "fr") return doc.nameFR;
  return doc.name;
}

export default function DocumentUpload({ language, onComplete }: DocumentUploadProps) {
  const [docStatuses, setDocStatuses] = useState<DocStatus[]>(
    () => mockDocuments.map(() => "pending")
  );
  const [uploading, setUploading] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [submitActive, setSubmitActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<"personal" | "property" | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const personalDocs = mockDocuments.filter((d) => d.category === "personal");
  const propertyDocs = mockDocuments.filter((d) => d.category === "property");

  const getOriginalIndex = useCallback(
    (doc: (typeof mockDocuments)[0]) => mockDocuments.indexOf(doc),
    []
  );

  const completedCount = docStatuses.filter((s) => s === "done").length;
  const totalCount = mockDocuments.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Check if all done after status changes
  useEffect(() => {
    if (docStatuses.every((s) => s === "done") && !allDone) {
      setAllDone(true);
      setShowShimmer(true);
      const shimmerTimer = setTimeout(() => setShowShimmer(false), 1500);
      const activateTimer = setTimeout(() => setSubmitActive(true), 500);
      timeoutsRef.current.push(shimmerTimer, activateTimer);
    }
  }, [docStatuses, allDone]);

  // Upload a single document by index
  const uploadSingleDoc = useCallback((idx: number) => {
    setDocStatuses((prev) => {
      if (prev[idx] !== "pending") return prev;
      const next = [...prev];
      next[idx] = "uploading";
      return next;
    });
    const doneTimer = setTimeout(() => {
      setDocStatuses((prev) => {
        const next = [...prev];
        next[idx] = "done";
        return next;
      });
    }, 600);
    timeoutsRef.current.push(doneTimer);
  }, []);

  // Handle drop on a specific document row
  const handleDropOnRow = useCallback(
    (e: DragEvent<HTMLDivElement>, doc: (typeof mockDocuments)[0]) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverIndex(null);
      setDragOverColumn(null);
      const idx = getOriginalIndex(doc);
      if (docStatuses[idx] === "pending") {
        setUploading(true);
        uploadSingleDoc(idx);
      }
    },
    [docStatuses, getOriginalIndex, uploadSingleDoc]
  );

  // Handle drop on a column (batch upload all pending docs in that category)
  const handleDropOnColumn = useCallback(
    (e: DragEvent<HTMLDivElement>, category: "personal" | "property") => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverColumn(null);
      setDragOverIndex(null);
      setUploading(true);
      const docs = category === "personal" ? personalDocs : propertyDocs;
      docs.forEach((doc, i) => {
        const idx = getOriginalIndex(doc);
        if (docStatuses[idx] === "pending") {
          const timer = setTimeout(() => uploadSingleDoc(idx), i * 250);
          timeoutsRef.current.push(timer);
        }
      });
    },
    [personalDocs, propertyDocs, docStatuses, getOriginalIndex, uploadSingleDoc]
  );

  const handleAutoUpload = useCallback(() => {
    if (uploading && allDone) return;
    setUploading(true);

    mockDocuments.forEach((_, i) => {
      const uploadTimer = setTimeout(() => {
        setDocStatuses((prev) => {
          if (prev[i] !== "pending") return prev;
          const next = [...prev];
          next[i] = "uploading";
          return next;
        });
      }, i * 300);

      const doneTimer = setTimeout(() => {
        setDocStatuses((prev) => {
          if (prev[i] === "done") return prev;
          const next = [...prev];
          next[i] = "done";
          return next;
        });
      }, i * 300 + 500);

      timeoutsRef.current.push(uploadTimer, doneTimer);
    });
  }, [uploading, allDone]);

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const handleSubmit = useCallback(() => {
    if (!submitActive || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      onComplete();
    }, 800);
  }, [submitActive, submitting, onComplete]);

  const preventDefaults = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const renderDocRow = (doc: (typeof mockDocuments)[0]) => {
    const idx = getOriginalIndex(doc);
    const status = docStatuses[idx];
    const isDragTarget = dragOverIndex === idx;

    return (
      <motion.div
        key={doc.name}
        layout
        onDragOver={(e) => {
          preventDefaults(e as unknown as DragEvent<HTMLDivElement>);
          setDragOverIndex(idx);
        }}
        onDragLeave={() => setDragOverIndex(null)}
        onDrop={(e) => handleDropOnRow(e as unknown as DragEvent<HTMLDivElement>, doc)}
        className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-all duration-200 ${
          isDragTarget && status === "pending"
            ? "bg-bank-gold/10 border border-bank-gold/40 gold-border-glow"
            : "hover:bg-bank-surface/50 border border-transparent"
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Status Circle */}
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {status === "pending" && (
              <div className={`w-4 h-4 rounded-full border transition-colors ${
                isDragTarget ? "border-bank-gold" : "border-bank-border-light"
              }`} />
            )}
            {status === "uploading" && (
              <motion.div
                className="w-4 h-4 rounded-full border-2 border-bank-gold border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
              />
            )}
            {status === "done" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25, duration: 0.2 }}
                className="w-4 h-4 rounded-full bg-bank-gold flex items-center justify-center"
              >
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="#111827"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            )}
          </div>

          {/* Document Name */}
          <span className="text-sm text-bank-text truncate">
            {getDocName(doc, language)}
          </span>
        </div>

        {/* Right side: upload hint or badge */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {status === "pending" && isDragTarget && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[10px] text-bank-gold font-medium"
            >
              Drop here
            </motion.span>
          )}
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded ${
              doc.required
                ? "bg-bank-crimson/15 text-bank-crimson"
                : "bg-bank-steel/15 text-bank-steel"
            }`}
          >
            {doc.required ? t("docs.required", language) : t("docs.ifApplicable", language)}
          </span>
        </div>
      </motion.div>
    );
  };

  const renderColumn = (
    docs: typeof mockDocuments,
    category: "personal" | "property",
    titleKey: string
  ) => {
    const isColumnDragTarget = dragOverColumn === category;
    const hasPending = docs.some((doc) => docStatuses[getOriginalIndex(doc)] === "pending");

    return (
      <div
        className={`surface-card p-4 border relative overflow-hidden transition-all duration-200 ${
          showShimmer ? "gold-shimmer" : ""
        } ${
          isColumnDragTarget && hasPending
            ? "border-bank-gold/50 gold-border-glow"
            : "border-bank-border-light/20"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOverColumn(category);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverColumn(null);
          }
        }}
        onDrop={(e) => handleDropOnColumn(e, category)}
      >
        <h3 className="text-sm font-semibold text-bank-text-secondary mb-3 tracking-wide uppercase">
          {t(titleKey, language)}
        </h3>

        {/* Batch dropzone banner */}
        <AnimatePresence>
          {isColumnDragTarget && hasPending && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-3 overflow-hidden"
            >
              <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-dashed border-bank-gold/40 bg-bank-gold/5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <span className="text-xs text-bank-gold font-medium">
                  {t("docs.batchDrop", language)}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-0.5">
          {docs.map(renderDocRow)}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Title */}
      <h2 className="text-xl font-institutional text-bank-text mb-4">
        {t("docs.title", language)}
      </h2>

      {/* Encryption Badge + Drag hint */}
      <div className="flex items-center gap-4 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-bank-surface rounded text-xs text-bank-text-secondary border border-bank-border-light/30">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span>{t("docs.encrypted", language)}</span>
        </div>
        {!allDone && (
          <div className="inline-flex items-center gap-1.5 text-xs text-bank-text-secondary/60">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <span>Drag & drop files onto documents, or use auto-upload</span>
          </div>
        )}
      </div>

      {/* Auto-Upload Button */}
      {!allDone && (
        <div className="mb-6">
          <button
            onClick={handleAutoUpload}
            className="px-5 py-2.5 surface-button border border-bank-gold/40 text-bank-gold text-sm font-medium tracking-wide hover:border-bank-gold transition-all"
          >
            {uploading ? "Uploading..." : "Demo: Auto-Upload All"}
          </button>
        </div>
      )}

      <div className="relative flex gap-6">
        {/* Vertical Progress Bar */}
        <div className="flex-shrink-0 w-1 rounded-full bg-bank-surface overflow-hidden relative">
          <motion.div
            className="absolute top-0 left-0 w-full rounded-full"
            style={{
              background: "linear-gradient(180deg, #C9A84C, #A68A3E)",
            }}
            initial={{ height: "0%" }}
            animate={{ height: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: [0, 0, 0.58, 1] }}
          />
        </div>

        {/* Two Columns */}
        <div className="flex-1 grid grid-cols-2 gap-6">
          {renderColumn(personalDocs, "personal", "docs.personal")}
          {renderColumn(propertyDocs, "property", "docs.property")}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <button
                onClick={handleSubmit}
                disabled={!submitActive || submitting}
                className={`relative px-8 py-3 text-sm font-medium tracking-wide rounded-md overflow-hidden transition-all duration-500 ${
                  submitActive
                    ? "border border-bank-gold text-bank-gold shadow-[inset_0_0_12px_rgba(201,168,76,0.15)] hover:shadow-[inset_0_0_20px_rgba(201,168,76,0.25)]"
                    : "border border-bank-border-light text-bank-text-secondary/50 cursor-not-allowed"
                }`}
                style={{
                  background: submitActive
                    ? "linear-gradient(145deg, #252f3f, #1e2838)"
                    : "linear-gradient(145deg, #1a2332, #172030)",
                }}
              >
                {submitting && (
                  <motion.div
                    className="absolute inset-0 bg-bank-gold/20"
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 0.7, ease: [0.42, 0, 0.58, 1] }}
                  />
                )}
                <span className="relative z-10 uppercase">
                  {t("submit.button", language)}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
