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
  Card,
  Eyebrow,
  MuqablaLogo,
} from "./components";
import { theme } from "./theme";

export const recruiterDemoSchema = z.object({
  companyName: z.string(),
  candidateName: z.string(),
  candidateRole: z.string(),
});

export type RecruiterDemoProps = z.infer<typeof recruiterDemoSchema>;

// ----- Real footage -----
// 14.1s of trimmed speech at 30fps = 423 frames.
const FOOTAGE_FILE = "footage/recruiter-raw.mp4";
const FOOTAGE_FRAMES = 423;

// --------------- Scene 1: Intro (0-75) ---------------
const IntroScene: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 48 }}>
    <MuqablaLogo size={90} />
    <div style={{ marginTop: 24 }}>
      <Eyebrow delay={12}>For Recruiters</Eyebrow>
    </div>
    <AnimatedText delay={20} fontSize={72} color={theme.textMuted} weight={500}>
      See how it works.
    </AnimatedText>
  </AbsoluteFill>
);

// --------------- Scene 2: Real candidate video (75-498) ---------------
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
          Candidate Pitch
        </span>
      </div>

      {/* The actual footage as the profile card body */}
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

        {/* Overlayed candidate identity chip (bottom) */}
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
            85% match
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --------------- Scene 3: Dashboard stats ---------------
const DashboardScene: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 160 }}>
    <AnimatedText fontSize={96}>Hiring in</AnimatedText>
    <div style={{ marginTop: 8 }}>
      <AnimatedText delay={10} fontSize={96} color={theme.accentLight}>
        real time.
      </AnimatedText>
    </div>

    <div
      style={{
        marginTop: 80,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 24,
        width: "86%",
      }}
    >
      <Card delay={20} padding={40}>
        <div style={{ fontSize: 22, color: theme.textMuted, fontWeight: 500 }}>
          Applicants
        </div>
        <div style={{ marginTop: 16 }}>
          <AnimatedCounter to={247} delay={28} fontSize={140} />
        </div>
        <div style={{ fontSize: 22, color: theme.accentLight, marginTop: 8 }}>
          +18 today
        </div>
      </Card>
      <Card delay={26} padding={40}>
        <div style={{ fontSize: 22, color: theme.textMuted, fontWeight: 500 }}>
          Time to hire
        </div>
        <div style={{ marginTop: 16 }}>
          <AnimatedCounter to={4} delay={34} fontSize={140} suffix=" days" />
        </div>
        <div style={{ fontSize: 22, color: theme.accentLight, marginTop: 8 }}>
          3x faster
        </div>
      </Card>
    </div>
  </AbsoluteFill>
);

// --------------- Scene 4: CTA ---------------
const CTAScene: React.FC<{ companyName: string }> = ({ companyName }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 40, padding: 60 }}>
    <MuqablaLogo size={80} />
    <AnimatedText delay={10} fontSize={120}>
      Hire 3x faster.
    </AnimatedText>
    <div style={{ marginTop: -10, maxWidth: 900, textAlign: "center" }}>
      <AnimatedText delay={22} fontSize={48} color={theme.textMuted} weight={500}>
        Trusted across the GCC by {companyName}.
      </AnimatedText>
    </div>
    <div style={{ marginTop: 60 }}>
      <CTAButton label="Post your first job" delay={36} />
    </div>
    <div style={{ marginTop: 40 }}>
      <AnimatedText delay={52} fontSize={32} color={theme.textDim} weight={500}>
        muqabla.com
      </AnimatedText>
    </div>
  </AbsoluteFill>
);

// --------------- Root ---------------
// Totals: 75 (intro) + FOOTAGE_FRAMES + 150 (dashboard) + 150 (CTA)
export const RECRUITER_TOTAL_FRAMES = 75 + FOOTAGE_FRAMES + 150 + 150; // 798

export const RecruiterDemo: React.FC<RecruiterDemoProps> = ({
  companyName,
  candidateName,
  candidateRole,
}) => {
  let cursor = 0;
  const introLen = 75;
  const footageLen = FOOTAGE_FRAMES;
  const dashLen = 150;
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
      <Sequence from={cursor} durationInFrames={dashLen} name="Dashboard">
        <DashboardScene />
      </Sequence>
      {(cursor += dashLen) || null}
      <Sequence from={cursor} durationInFrames={ctaLen} name="CTA">
        <CTAScene companyName={companyName} />
      </Sequence>
    </BrandBackground>
  );
};
