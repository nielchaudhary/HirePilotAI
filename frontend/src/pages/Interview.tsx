import { useState, useEffect } from "react";
import { MultiStepLoader } from "../components/MultiStepLoader";
import { Helmet } from "react-helmet";
import { Chat } from "../components/Chat";

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
      <div className="w-full flex justify-center items-start pt-10 pb-4 px-4 min-h-screen bg-black">
        {multistepLoader ? (
          <MultiStepLoader
            loadingStates={loadingStates}
            loading={multistepLoader}
          />
        ) : (
          <Chat />
        )}
      </div>
    </>
  );
};
