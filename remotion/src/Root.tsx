import { Composition } from "remotion";
import {
  RecruiterDemo,
  recruiterDemoSchema,
  RECRUITER_TOTAL_FRAMES,
} from "./muqabla/RecruiterDemo";
import {
  JobSeekerDemo,
  jobSeekerDemoSchema,
  JOBSEEKER_TOTAL_FRAMES,
} from "./muqabla/JobSeekerDemo";

// Vertical 1080x1920 @ 30fps so the demos work on the landing page modal AND mobile/social.
const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RecruiterDemo"
        component={RecruiterDemo}
        durationInFrames={RECRUITER_TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        schema={recruiterDemoSchema}
        defaultProps={{
          companyName: "leading teams",
          candidateName: "Real candidate",
          candidateRole: "Speaking to their future employer",
        }}
      />

      <Composition
        id="JobSeekerDemo"
        component={JobSeekerDemo}
        durationInFrames={JOBSEEKER_TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        schema={jobSeekerDemoSchema}
        defaultProps={{
          firstName: "you",
          candidateName: "Real candidate",
          candidateRole: "Applying the Muqabla way",
        }}
      />
    </>
  );
};
