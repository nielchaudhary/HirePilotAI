import { Spotlight } from "../components/Spotlight";
import { useState, useEffect } from "react";
import { MultiStepLoader } from "../components/MultiStepLoader";
import { Helmet } from "react-helmet";

export const Interview = () => {
  const loadingStates = [
    {
      text: "Parsing Resume",
    },
    {
      text: "Analyzing Your Resume",
    },
    {
      text: "Transcribing Your Interview",
    },
    {
      text: "Analyzing Your Interview",
    },
    {
      text: "Generating Interview Questions",
    },
  ];

  const [multistepLoader, setMultiStepLoader] = useState<boolean>(true);

  useEffect(() => {
    if (multistepLoader) {
      const timer = setTimeout(() => {
        setMultiStepLoader(false);
        clearTimeout(timer);
      }, 5000);
    }
  }, [multistepLoader]);

  return (
    <>
      <Helmet>
        <title>HirePilot • Interview</title>
      </Helmet>
      <div className="relative bg-black flex flex-col items-center justify-center min-h-screen w-screen overflow-x-hidden overflow-y-hidden py-10 max-width-7xl">
        <Spotlight />
        {multistepLoader && (
          <MultiStepLoader
            loadingStates={loadingStates}
            loading={multistepLoader}
          />
        )}
      </div>
    </>
  );
};
