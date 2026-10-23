"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import styles from "./MadeByWDP365.module.css";

/**
 * WDP365 Makers Mark v1.0.0
 * A self-contained interactive maker's signature for client website footers.
 * No animation, tracking, icon, or 3D package dependency.
 */
export type MadeByWDP365Props = {
  /** Optional anonymous, non-sensitive project code: e.g. alpine-demo-01. */
  projectCode?: string;
  /** Optional CSS color values. In most cases set only accent and accentAlt. */
  accent?: string;
  accentAlt?: string;
  /** Dark footer vs. light footer. */
  theme?: "dark" | "light";
  /** Two responsive size presets. */
  size?: "standard" | "compact";
  /** Disable all decorative animation explicitly. */
  motion?: "on" | "off";
  /** Default verified public destination; override for an approved campaign page. */
  destination?: string;
  className?: string;
};

const DEFAULT_DESTINATION = "https://www.webdesignpros365.com/";

/**
 * Keep the external link usable even if a project code is omitted or malformed.
 * Attribution codes are public URLs, NOT credentials or personal identifiers.
 */
export function makeWDP365ReferralUrl(
  destination: string = DEFAULT_DESTINATION,
  projectCode?: string,
): string {
  const normalizedCode = projectCode?.trim().toLowerCase();
  const safeCode = normalizedCode && /^[a-z0-9][a-z0-9_-]{0,63}$/.test(normalizedCode)
    ? normalizedCode
    : undefined;

  let url: URL;
  try {
    url = new URL(destination);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("Unsupported URL protocol");
    }
  } catch {
    url = new URL(DEFAULT_DESTINATION);
  }

  url.searchParams.set("utm_source", "client_footer");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "wdp365_makers_mark");
  if (safeCode) {
    url.searchParams.set("utm_content", safeCode);
  } else {
    url.searchParams.delete("utm_content");
  }
  return url.toString();
}

type BadgeCssVars = CSSProperties & {
  "--wdp-accent"?: string;
  "--wdp-accent-alt"?: string;
};

export default function MadeByWDP365({
  projectCode,
  accent = "#62e6ff",
  accentAlt = "#367aff",
  theme = "dark",
  size = "standard",
  motion = "on",
  destination = DEFAULT_DESTINATION,
  className = "",
}: MadeByWDP365Props) {
  const id = useId().replace(/:/g, "");
  const gradientId = `${id}-wdp-gradient`;
  const glowId = `${id}-wdp-glow`;
  const logoRef = useRef<HTMLAnchorElement>(null);
  const [entered, setEntered] = useState(false);
  const href = makeWDP365ReferralUrl(destination, projectCode);
  const cssVars: BadgeCssVars = {
    "--wdp-accent": accent,
    "--wdp-accent-alt": accentAlt,
  };

  useEffect(() => {
    if (motion === "off" || typeof IntersectionObserver === "undefined") {
      return;
    }
    const node = logoRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [motion]);

  function handleClick(_event: MouseEvent<HTMLAnchorElement>) {
    // Zero network requests: site owners can optionally listen for this event
    // and forward it to their own consent-aware analytics installation.
    if (typeof window === "undefined") return;
    const code = projectCode?.trim().toLowerCase();
    const safeCode = code && /^[a-z0-9][a-z0-9_-]{0,63}$/.test(code) ? code : null;
    window.dispatchEvent(new CustomEvent("wdp365:badge-click", {
      detail: { projectCode: safeCode, placement: "footer" },
    }));
  }

  const rootClasses = [
    styles.badge,
    theme === "light" ? styles.light : styles.dark,
    size === "compact" ? styles.compact : "",
    motion === "off" ? styles.noMotion : "",
    entered ? styles.entered : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <a
      ref={logoRef}
      className={rootClasses}
      style={cssVars}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label="Website crafted by Web Design Pros 365 (opens in a new tab)"
      data-wdp365-mark="1.0.0"
    >
      <span className={styles.glare} aria-hidden="true" />
      <span className={styles.emblemWrap} aria-hidden="true">
        <svg
          className={styles.emblem}
          viewBox="0 0 116 116"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
        >
          <defs>
            <linearGradient id={gradientId} x1="17" y1="13" x2="94" y2="103" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--wdp-accent)" />
              <stop offset=".55" stopColor="var(--wdp-accent-alt)" />
              <stop offset="1" stopColor="var(--wdp-accent)" />
            </linearGradient>
            <radialGradient id={glowId} cx="0" cy="0" r="1" gradientTransform="translate(58 58) rotate(90) scale(55)">
              <stop stopColor="var(--wdp-accent-alt)" stopOpacity=".16" />
              <stop offset="1" stopColor="var(--wdp-accent-alt)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="58" cy="58" r="53" fill={`url(#${glowId})`} />
          <circle cx="58" cy="58" r="49" stroke="currentColor" strokeOpacity=".10" strokeWidth="1" />
          <g className={styles.outerOrbit}>
            <circle cx="58" cy="58" r="50" stroke={`url(#${gradientId})`} strokeWidth="2.4"
              strokeDasharray="58 21 19 33 38 45 15 85" strokeLinecap="round" />
            <circle cx="58" cy="8" r="2.7" fill="var(--wdp-accent)" />
          </g>
          <g className={styles.innerOrbit}>
            <circle cx="58" cy="58" r="42.5" stroke="var(--wdp-accent)" strokeOpacity=".29"
              strokeWidth=".9" strokeDasharray="2 7" />
          </g>
          <circle cx="58" cy="58" r="35" stroke="currentColor" strokeOpacity=".14" strokeWidth=".7" />

          {/* Interwoven ribbon W: dark underlay creates a carved, optical overlap. */}
          <g className={styles.ribbonMark}>
            <path d="M28 45 L39 74 L52 50 L64 74 L78 45" stroke="currentColor"
              strokeOpacity=".18" strokeWidth="11" strokeLinecap="square" strokeLinejoin="bevel" />
            <path d="M28 45 L39 74 L52 50 L64 74 L78 45" stroke={`url(#${gradientId})`}
              strokeWidth="7.5" strokeLinecap="square" strokeLinejoin="bevel" />
            <path d="M38.5 53 L45 66" stroke="var(--wdp-cut)" strokeWidth="10" opacity=".93" />
            <path d="M38.5 53 L45 66" stroke="var(--wdp-accent)" strokeWidth="3.3" opacity=".86" />
            <path d="M60 66 L68 53" stroke="var(--wdp-cut)" strokeWidth="10" opacity=".9" />
            <path d="M60 66 L68 53" stroke="var(--wdp-accent-alt)" strokeWidth="3.3" opacity=".9" />
            <path d="M77 45 L85 45" stroke="var(--wdp-accent)" strokeWidth="3.5" strokeLinecap="round" />
          </g>
          <circle cx="86" cy="35" r="1.8" fill="var(--wdp-accent)" className={styles.spark} />
        </svg>
      </span>

      <span className={styles.wordmark}>
        <span className={styles.eyebrow}>CRAFTED BY</span>
        <span className={styles.company}>WEB DESIGN</span>
        <span className={styles.lastLine}>
          <span className={styles.pros}>PROS</span>
          <span className={styles.number}>365</span>
        </span>
        <span className={styles.bottomRule} />
        <span className={styles.tagline}>DIGITAL EXPERIENCES. REIMAGINED.</span>
      </span>
      <span className={styles.arrow} aria-hidden="true">↗</span>
    </a>
  );
}
