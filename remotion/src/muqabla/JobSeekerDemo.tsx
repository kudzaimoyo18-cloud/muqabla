import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import {
  AnimatedCounter,
  AnimatedText,
  BrandBackground,
  CTAButton,
  Eyebrow,
  MuqablaLogo,
} from "./components";
import { theme } from "./theme";

export const jobSeekerDemoSchema = z.object({
  firstName: z.string(),
  candidateName: z.string(),
  candidateRole: z.string(),
});

export type JobSeekerDemoProps = z.infer<typeof jobSeekerDemoSchema>;

// ----- Real footage -----
// 38.8s of trimmed speech at 30fps = 1164 frames.
const FOOTAGE_FILE = "footage/jobseeker-raw.mp4";
const FOOTAGE_FRAMES = 1164;

// --------------- Scene 1: Intro ---------------
const IntroScene: React.FC = () => (
  <AbsoluteFill
    style={{ alignItems: "center", justifyContent: "center", gap: 48 }}
  >
    <MuqablaLogo size={90} />
    <div style={{ marginTop: 24 }}>
      <Eyebrow delay={12}>For Job Seekers</Eyebrow>
    </div>
    <AnimatedText
      delay={20}
      fontSize={72}
      color={theme.textMuted}
      weight={500}
    >
      Your video is your resume.
    </AnimatedText>
  </AbsoluteFill>
);

// --------------- Scene 2: The real candidate video ---------------
const FootageScene: React.FC<{
  candidateName: string;
  candidateRole: string;
}> = ({ candidateName, candidateRole }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = interpolate(Math.sin(frame * 0.3), [-1, 1], [0.55, 1]);
  const entry = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 120 },
  });
  const translateY = interpolate(entry, [0, 1], [80, 0]);
  const opacity = interpolate(entry, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ padding: 48 }}>
      {/* Floating label above the card */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          marginTop: 32,
          marginBottom: 32,
          opacity,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            background: "#ef4444",
            opacity: pulse,
            boxShadow: `0 0 16px #ef4444`,
          }}
        />
        <span
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: theme.text,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Your Profile
        </span>
      </div>

      {/* Video framed as a profile card */}
      <div
        style={{
          flex: 1,
          borderRadius: 44,
          overflow: "hidden",
          border: `2px solid ${theme.borderStrong}`,
          boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px ${theme.border}`,
          transform: `translateY(${translateY}px)`,
          opacity,
          position: "relative",
        }}
      >
        <OffthreadVideo
          src={staticFile(FOOTAGE_FILE)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Identity chip */}
        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 24,
            padding: "20px 24px",
            borderRadius: 20,
            background: "rgba(10,10,10,0.72)",
            backdropFilter: "blur(24px)",
            border: `1px solid ${theme.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 30, fontWeight: 700, color: theme.text }}>
              {candidateName}
            </div>
            <div style={{ fontSize: 22, color: theme.textMuted, marginTop: 6 }}>
              {candidateRole}
            </div>
          </div>
          <div
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              background: theme.accentGlow,
              border: "1px solid rgba(16,185,129,0.4)",
              color: theme.accentLight,
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            Shortlist me
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --------------- Scene 3: Match stat ---------------
const MatchScene: React.FC = () => (
  <AbsoluteFill
    style={{ alignItems: "center", justifyContent: "center", gap: 20 }}
  >
    <AnimatedText fontSize={60} color={theme.textMuted} weight={500}>
      Average match rate
    </AnimatedText>
    <div style={{ marginTop: 20 }}>
      <AnimatedCounter to={85} delay={8} fontSize={260} suffix="%" duration={50} />
    </div>
    <div style={{ marginTop: 40 }}>
      <AnimatedText delay={60} fontSize={52}>
        Get hired,
      </AnimatedText>
    </div>
    <AnimatedText delay={72} fontSize={52} color={theme.accentLight}>
      on your terms.
    </AnimatedText>
  </AbsoluteFill>
);

// --------------- Scene 4: CTA ---------------
const CTAScene: React.FC<{ firstName: string }> = ({ firstName }) => (
  <AbsoluteFill
    style={{ alignItems: "center", justifyContent: "center", gap: 40, padding: 60 }}
  >
    <MuqablaLogo size={80} />
    <AnimatedText delay={10} fontSize={120}>
      Ready, {firstName}?
    </AnimatedText>
    <div style={{ marginTop: -10, maxWidth: 900, textAlign: "center" }}>
      <AnimatedText
        delay={22}
        fontSize={48}
        color={theme.textMuted}
        weight={500}
      >
        Record once. Apply everywhere.
      </AnimatedText>
    </div>
    <div style={{ marginTop: 60 }}>
      <CTAButton label="Start free" delay={36} />
    </div>
    <div style={{ marginTop: 40 }}>
      <AnimatedText delay={52} fontSize={32} color={theme.textDim} weight={500}>
        muqabla.com
      </AnimatedText>
    </div>
  </AbsoluteFill>
);

// --------------- Root ---------------
// Totals: 75 (intro) + FOOTAGE_FRAMES + 90 (match) + 150 (CTA)
export const JOBSEEKER_TOTAL_FRAMES = 75 + FOOTAGE_FRAMES + 90 + 150; // 1479

export const JobSeekerDemo: React.FC<JobSeekerDemoProps> = ({
  firstName,
  candidateName,
  candidateRole,
}) => {
  let cursor = 0;
  const introLen = 75;
  const footageLen = FOOTAGE_FRAMES;
  const matchLen = 90;
  const ctaLen = 150;

  return (
    <BrandBackground>
      <Sequence from={cursor} durationInFrames={introLen} name="Intro">
        <IntroScene />
      </Sequence>
      {(cursor += introLen) || null}
      <Sequence from={cursor} durationInFrames={footageLen} name="Footage">
        <FootageScene
          candidateName={candidateName}
          candidateRole={candidateRole}
        />
      </Sequence>
      {(cursor += footageLen) || null}
      <Sequence from={cursor} durationInFrames={matchLen} name="Match">
        <MatchScene />
      </Sequence>
      {(cursor += matchLen) || null}
      <Sequence from={cursor} durationInFrames={ctaLen} name="CTA">
        <CTAScene firstName={firstName} />
      </Sequence>
    </BrandBackground>
  );
};
