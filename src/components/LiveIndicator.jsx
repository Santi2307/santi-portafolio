/**
 * LiveIndicator
 * -----------------------------------------------------------------------------
 * A polished, accessible status pill with a pulsing dot — designed to feel
 * at home in a production dashboard.
 *
 * Features:
 *   • Real network detection via `navigator.onLine` + window events
 *   • Optional latency probe against a lightweight endpoint
 *   • Controlled mode — pass `status` to drive it from a WebSocket, store, etc.
 *   • Four states: online · reconnecting · offline · idle
 *   • Hover/focus tooltip with latency + last-checked time
 *   • Respects `prefers-reduced-motion`
 *   • Size variants (sm/md/lg), full a11y, keyboard focus ring
 *
 * Usage:
 *   <LiveIndicator />
 *   <LiveIndicator pingUrl="/api/ping" size="lg" />
 *   <LiveIndicator status="reconnecting" label="Syncing…" />
 *
 * @author  Santiago Delgado
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Status & theme definitions                                                */
/* ────────────────────────────────────────────────────────────────────────── */

export const LIVE_STATUS = Object.freeze({
  ONLINE: "online",
  OFFLINE: "offline",
  RECONNECTING: "reconnecting",
  IDLE: "idle",
});

const STATUS_THEME = {
  online: {
    label: "Live",
    dot: "bg-emerald-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    ring: "focus-visible:ring-emerald-500/40",
    glow: "shadow-emerald-500/40",
  },
  offline: {
    label: "Offline",
    dot: "bg-rose-500",
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    ring: "focus-visible:ring-rose-500/40",
    glow: "shadow-rose-500/40",
  },
  reconnecting: {
    label: "Reconnecting",
    dot: "bg-amber-500",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    ring: "focus-visible:ring-amber-500/40",
    glow: "shadow-amber-500/40",
  },
  idle: {
    label: "Idle",
    dot: "bg-slate-400",
    bg: "bg-slate-400/10",
    text: "text-slate-400",
    ring: "focus-visible:ring-slate-400/40",
    glow: "shadow-slate-400/30",
  },
};

const SIZE_THEME = {
  sm: { container: "px-1.5 py-0.5 gap-1",   dot: "w-1.5 h-1.5", text: "text-[10px]" },
  md: { container: "px-2 py-1 gap-1.5",      dot: "w-2 h-2",     text: "text-xs"     },
  lg: { container: "px-3 py-1.5 gap-2",      dot: "w-2.5 h-2.5", text: "text-sm"     },
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Hook — real network status (+ optional latency probe)                     */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Tracks browser online/offline state and (optionally) pings a URL to
 * measure round-trip latency.
 */
function useNetworkStatus({ pingUrl, interval = 15000, enabled = true } = {}) {
  const getInitial = () =>
    typeof navigator !== "undefined" && navigator.onLine === false
      ? LIVE_STATUS.OFFLINE
      : LIVE_STATUS.ONLINE;

  const [status, setStatus]           = useState(getInitial);
  const [latency, setLatency]         = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const abortRef                      = useRef(null);

  const ping = useCallback(async () => {
    if (!pingUrl) return;
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;
    const started    = performance.now();

    try {
      await fetch(pingUrl, {
        method: "HEAD",
        cache: "no-store",
        signal: controller.signal,
      });
      setLatency(Math.round(performance.now() - started));
      setLastChecked(new Date());
      setStatus(LIVE_STATUS.ONLINE);
    } catch (err) {
      if (err.name === "AbortError") return;
      setLatency(null);
      setStatus(LIVE_STATUS.OFFLINE);
    }
  }, [pingUrl]);

  // Native online/offline events
  useEffect(() => {
    if (!enabled) return;

    const handleOnline = () => {
      setStatus(LIVE_STATUS.RECONNECTING);
      // Give the network a beat before we validate
      setTimeout(() => {
        if (pingUrl) ping();
        else setStatus(LIVE_STATUS.ONLINE);
      }, 600);
    };
    const handleOffline = () => setStatus(LIVE_STATUS.OFFLINE);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [enabled, ping, pingUrl]);

  // Optional polling loop
  useEffect(() => {
    if (!enabled || !pingUrl) return;
    ping();
    const id = setInterval(ping, interval);
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [enabled, interval, ping, pingUrl]);

  return { status, latency, lastChecked, refresh: ping };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Hook — prefers-reduced-motion                                             */
/* ────────────────────────────────────────────────────────────────────────── */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Subcomponent — Tooltip                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

const Tooltip = ({ status, latency, lastChecked }) => {
  const theme = STATUS_THEME[status] ?? STATUS_THEME.idle;

  return (
    <motion.div
      role="tooltip"
      initial={{ opacity: 0, y: -4, scale: 0.96 }}
      animate={{ opacity: 1, y:  0, scale: 1    }}
      exit={{    opacity: 0, y: -4, scale: 0.96 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50
                 px-3 py-2 rounded-lg bg-slate-900/95 backdrop-blur
                 border border-white/10 shadow-xl whitespace-nowrap
                 pointer-events-none"
    >
      <div className="flex flex-col gap-0.5 text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
          <span className="font-medium text-white">{theme.label}</span>
        </div>
        {latency != null && (
          <span className="text-slate-400">Latency · {latency} ms</span>
        )}
        {lastChecked && (
          <span className="text-slate-500">
            Updated {timeAgo(lastChecked)}
          </span>
        )}
      </div>
    </motion.div>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Main component                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * @param {Object} props
 * @param {"online"|"offline"|"reconnecting"|"idle"} [props.status]
 *        Controlled status. Omit to use the built-in network detector.
 * @param {string}   [props.label]        Override the visible label.
 * @param {string}   [props.pingUrl]      Optional URL to ping for latency.
 * @param {number}   [props.pingInterval] Ping interval in ms (default 15000).
 * @param {"sm"|"md"|"lg"} [props.size]   Default "md".
 * @param {boolean}  [props.showLabel]    Default true.
 * @param {boolean}  [props.showTooltip]  Default true.
 * @param {string}   [props.className]    Extra Tailwind classes.
 * @param {() => void} [props.onClick]    Optional handler (e.g. retry).
 */
export const LiveIndicator = ({
  status: controlledStatus,
  label,
  pingUrl,
  pingInterval = 15000,
  size = "md",
  showLabel = true,
  showTooltip = true,
  className = "",
  onClick,
}) => {
  const reducedMotion = usePrefersReducedMotion();
  const isControlled  = controlledStatus !== undefined;

  const network = useNetworkStatus({
    pingUrl,
    interval: pingInterval,
    enabled: !isControlled,
  });

  const status        = isControlled ? controlledStatus : network.status;
  const theme         = STATUS_THEME[status] ?? STATUS_THEME.idle;
  const sizing        = SIZE_THEME[size]     ?? SIZE_THEME.md;
  const displayLabel  = label ?? theme.label;

  const [hovered, setHovered] = useState(false);

  const isOnline       = status === LIVE_STATUS.ONLINE;
  const isReconnecting = status === LIVE_STATUS.RECONNECTING;
  const shouldPulse    = isOnline && !reducedMotion;
  const isInteractive  = typeof onClick === "function";

  /* ── Animation configs ──────────────────────────────────────────────── */
  const dotAnimation = isReconnecting && !reducedMotion
    ? { rotate: 360 }
    : { scale: shouldPulse ? [1, 1.15, 1] : 1 };

  const dotTransition = isReconnecting
    ? { duration: 1,   repeat: Infinity, ease: "linear" }
    : { duration: 1.6, repeat: Infinity, ease: "easeInOut" };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={()      => setHovered(true)}
      onBlur={()       => setHovered(false)}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={!isInteractive}
        aria-live="polite"
        aria-atomic="true"
        aria-label={
          `Connection status: ${displayLabel}` +
          (network.latency != null ? `, ${network.latency} milliseconds` : "")
        }
        className={`
          inline-flex items-center rounded-full select-none
          transition-all duration-300
          ${sizing.container} ${theme.bg}
          ${isInteractive
            ? "cursor-pointer hover:scale-[1.04] active:scale-95"
            : "cursor-default"}
          focus:outline-none focus-visible:ring-2 ${theme.ring}
        `}
      >
        {/* Dot + pulse ring */}
        <span className={`relative inline-flex ${sizing.dot}`}>
          {shouldPulse && (
            <motion.span
              aria-hidden
              className={`absolute inset-0 rounded-full ${theme.dot}`}
              initial={{ scale: 1, opacity: 0.55 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}
          <motion.span
            aria-hidden
            className={`relative w-full h-full rounded-full ${theme.dot} shadow-sm ${theme.glow}`}
            animate={dotAnimation}
            transition={dotTransition}
          />
        </span>

        {showLabel && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={status + displayLabel}
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x:  0 }}
              exit={{    opacity: 0, x:  3 }}
              transition={{ duration: 0.18 }}
              className={`font-medium tracking-wide ${sizing.text} ${theme.text}`}
            >
              {displayLabel}
            </motion.span>
          </AnimatePresence>
        )}
      </button>

      <AnimatePresence>
        {showTooltip && hovered && (
          <Tooltip
            status={status}
            latency={network.latency}
            lastChecked={network.lastChecked}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5)    return "just now";
  if (seconds < 60)   return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default LiveIndicator;
