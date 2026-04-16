import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "./theme";

// -------------------- Background --------------------
// Dark canvas with a soft emerald radial glow that subtly drifts over time.
export const BrandBackground: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const drift = interpolate(frame, [0, durationInFrames], [0, 80]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontFamily: theme.fontFamily }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(600px 600px at ${50 + drift * 0.1}% ${
            45 + drift * 0.05
          }%, ${theme.accentGlow}, transparent 60%)`,
        }}
      />
      {/* grid overlay for texture */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.6,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

// -------------------- Muqabla Logo --------------------
export const MuqablaLogo: React.FC<{ size?: number }> = ({ size = 56 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: size * 0.3,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.22,
          background: theme.accent,
          boxShadow: `0 0 ${size * 0.6}px ${theme.accentGlow}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Play-triangle mark */}
        <svg
          width={size * 0.5}
          height={size * 0.5}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M8 5v14l11-7L8 5z" fill="white" />
        </svg>
      </div>
      <span
        style={{
          fontSize: size * 0.75,
          fontWeight: 700,
          color: theme.text,
          letterSpacing: "-0.03em",
        }}
      >
        Muqabla
      </span>
    </div>
  );
};

// -------------------- Animated Text --------------------
// Slides up + fades in. Optional delay in frames.
export const AnimatedText: React.FC<{
  children: React.ReactNode;
  delay?: number;
  fontSize?: number;
  color?: string;
  weight?: number;
  align?: "left" | "center";
}> = ({
  children,
  delay = 0,
  fontSize = 80,
  color = theme.text,
  weight = 700,
  align = "center",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 100 },
  });
  const translateY = interpolate(progress, [0, 1], [40, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        fontSize,
        fontWeight: weight,
        color,
        letterSpacing: "-0.025em",
        lineHeight: 1.05,
        textAlign: align,
        transform: `translateY(${translateY}px)`,
        opacity,
      }}
    >
      {children}
    </div>
  );
};

// -------------------- Eyebrow pill (e.g. "FOR RECRUITERS") --------------------
export const Eyebrow: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.9, 1]);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 24px",
        borderRadius: 999,
        background: theme.accentGlow,
        border: `1px solid rgba(16,185,129,0.35)`,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: theme.accentLight,
          boxShadow: `0 0 12px ${theme.accentLight}`,
        }}
      />
      <span
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: theme.accentLight,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {children}
      </span>
    </div>
  );
};

// -------------------- Card (used to fake UI mockups) --------------------
export const Card: React.FC<{
  children: React.ReactNode;
  delay?: number;
  width?: number | string;
  padding?: number;
}> = ({ children, delay = 0, width = "86%", padding = 48 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 120 },
  });
  const translateY = interpolate(progress, [0, 1], [60, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        width,
        padding,
        borderRadius: 32,
        background: theme.surface,
        border: `1px solid ${theme.borderStrong}`,
        boxShadow: `0 40px 120px rgba(0,0,0,0.5), 0 0 0 1px ${theme.border}`,
        transform: `translateY(${translateY}px)`,
        opacity,
      }}
    >
      {children}
    </div>
  );
};

// -------------------- Counter (animates number up) --------------------
export const AnimatedCounter: React.FC<{
  to: number;
  delay?: number;
  duration?: number; // in frames
  suffix?: string;
  prefix?: string;
  fontSize?: number;
}> = ({ to, delay = 0, duration = 45, suffix = "", prefix = "", fontSize = 120 }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame - delay,
    [0, duration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  // easeOutCubic
  const eased = 1 - Math.pow(1 - progress, 3);
  const value = Math.round(to * eased);
  return (
    <span
      style={{
        fontSize,
        fontWeight: 800,
        color: theme.accentLight,
        letterSpacing: "-0.04em",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {prefix}
      {value}
      {suffix}
    </span>
  );
};

// -------------------- CTA Button --------------------
export const CTAButton: React.FC<{ label: string; delay?: number }> = ({
  label,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 130 },
  });
  const scale = interpolate(progress, [0, 1], [0.85, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  // Subtle pulse after entry
  const pulse = interpolate(
    Math.sin((frame - delay - 20) * 0.1),
    [-1, 1],
    [1, 1.03]
  );

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 16,
        padding: "28px 56px",
        borderRadius: 999,
        background: theme.accent,
        boxShadow: `0 20px 60px ${theme.accentGlow}, 0 0 0 6px rgba(16,185,129,0.08)`,
        transform: `scale(${scale * (progress > 0.95 ? pulse : 1)})`,
        opacity,
      }}
    >
      <span
        style={{
          fontSize: 44,
          fontWeight: 700,
          color: "#042f1f",
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </span>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12h14M13 5l7 7-7 7"
          stroke="#042f1f"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
