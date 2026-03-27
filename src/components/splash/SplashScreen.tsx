"use client";

import { motion } from "framer-motion";
import { Language } from "@/lib/types";
import { t } from "@/lib/i18n";

interface SplashScreenProps {
  language: Language;
  onBegin: () => void;
}

export default function SplashScreen({ language, onBegin }: SplashScreenProps) {
  // Swiss cross: two overlapping rectangles
  // Cross dimensions: 80x80, bar width ~24, bar length ~56
  const barWidth = 24;
  const barLength = 56;
  const crossSize = 80;
  const cx = crossSize / 2;
  const cy = crossSize / 2;

  // Horizontal rect
  const hx = cx - barLength / 2;
  const hy = cy - barWidth / 2;
  // Vertical rect
  const vx = cx - barWidth / 2;
  const vy = cy - barLength / 2;

  const hPerimeter = 2 * (barLength + barWidth);
  const vPerimeter = 2 * (barLength + barWidth);

  return (
    <div className="topo-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#111827]">
      {/* Confidential watermark */}
      <div className="watermark" />

      {/* Swiss cross motif */}
      <svg
        width={crossSize}
        height={crossSize}
        viewBox={`0 0 ${crossSize} ${crossSize}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Horizontal bar */}
        <motion.rect
          x={hx}
          y={hy}
          width={barLength}
          height={barWidth}
          stroke="#C9A84C"
          strokeWidth={2}
          fill="none"
          initial={{ strokeDasharray: `0 ${hPerimeter}` }}
          animate={{ strokeDasharray: `${hPerimeter} 0` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        {/* Vertical bar */}
        <motion.rect
          x={vx}
          y={vy}
          width={barWidth}
          height={barLength}
          stroke="#C9A84C"
          strokeWidth={2}
          fill="none"
          initial={{ strokeDasharray: `0 ${vPerimeter}` }}
          animate={{ strokeDasharray: `${vPerimeter} 0` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>

      {/* MortgageForge title */}
      <motion.h1
        className="mt-8 text-2xl font-semibold uppercase tracking-[0.15em] text-[#C9A84C]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        {t("app.title", language)}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="mt-3 text-sm text-bank-text-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
      >
        {t("app.subtitle", language)}
      </motion.p>

      {/* Begin Application button */}
      <motion.button
        onClick={onBegin}
        className="mt-10 border border-[#C9A84C] bg-transparent px-8 py-3 text-sm uppercase tracking-wider text-[#C9A84C] transition-colors duration-300 hover:bg-[#C9A84C] hover:text-[#111827]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        {t("splash.begin", language)}
      </motion.button>

      {/* Resume Existing Application link */}
      <motion.button
        className="mt-4 text-xs text-[#64748B] transition-colors hover:text-[#94a3b8]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.5 }}
      >
        {t("splash.resume", language)}
      </motion.button>

      {/* Powered by OPUS */}
      <motion.div
        className="absolute bottom-8 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.8 }}
      >
        <span className="text-xs text-bank-text-secondary/50 tracking-wide">Powered by</span>
        <a
          href="https://opus.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold tracking-[0.08em] text-[#C9A84C] transition-opacity hover:opacity-80"
        >
          OPUS
        </a>
      </motion.div>
    </div>
  );
}
