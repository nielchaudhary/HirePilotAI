import { useState, useEffect } from "react";
import { MultiStepLoader } from "../components/MultiStepLoader";
import { Helmet } from "react-helmet";
import { Chat } from "../components/Chat";
import { useLocation } from "react-router-dom";

export const Interview = () => {
  const loadingStates = [
    {
      text: "Parsing Resume",
    },
    {
      text: "Analyzing Your Resume",
    },
    {
      text: "Extracting Information",
    },
    {
      text: "Generating Interview Questions",
    },
    {
      text: "Analyzing Your Interview",
    },
  ];

  const [multistepLoader, setMultiStepLoader] = useState<boolean>(true);

  const pdfUrl = useLocation().state?.pdfUrl;

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
          <Chat pdfUrl={pdfUrl} />
        )}
      </div>
    </>
  );
};
