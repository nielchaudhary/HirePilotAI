// Landing.tsx
import { useRef } from "react";
import { Spotlight } from "../components/Spotlight";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { AuroraText } from "../components/AuroraText";
import { MultiStepLoader } from "../components/MultiStepLoader";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BASE_URL, isNullOrUndefined } from "../utils";
import axios from "axios";
import { resumeParsingLoadingStates, type IUserInfo } from "../lib/data";
import { useState } from "react";

export const Landing = () => {
  const navigate = useNavigate();
  const [fetchingResponse, setFetchingResponse] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!isNullOrUndefined(file) && file.size > 5 * 1024 * 1024) {
      toast.error("Please attach a file smaller than 5MB");
      return;
    }
    if (!isNullOrUndefined(file) && file.type === "application/pdf") {
      toast.success(`${file.name} Uploaded Successfully`);

      const pdfUrl = URL.createObjectURL(file);

      const formData = new FormData();
      formData.append("resume", file);

      setFetchingResponse(true);

      try {
        const response = (await axios.post(BASE_URL + "/parse", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })) as { data: IUserInfo };

        navigate("/interview", {
          state: {
            pdfUrl,
            userInfo: response.data, //passing the userInfo
          },
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to process resume. Please try again.");
        setFetchingResponse(false);
      }
    } else {
      toast.error("Please Select a Valid PDF File");
    }
    e.target.value = "";
  };

  return (
    <>
      <Helmet>
        <title>HirePilot • Home</title>
      </Helmet>
      <div className="relative bg-black flex flex-col items-center justify-center min-h-screen w-screen overflow-x-hidden overflow-y-hidden py-10 max-width-7xl">
        <Spotlight />
        {fetchingResponse ? (
          <MultiStepLoader
            loadingStates={resumeParsingLoadingStates}
            loading={fetchingResponse}
          />
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, ease: "easeIn" }}
              className="text-[#ACFFAC] font-bold text-3xl sm:text-3xl md:text-3xl font-mono"
            >
              Welcome to HirePilot AI
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, ease: "easeIn" }}
              className="text-5xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-center text-[#F7F7F7] mt-4 leading-tight max-w-5xl mx-auto px-4"
            >
              <span className="block">Unlock the Power of AI</span>
              <span className="block mt-2">
                For Your{" "}
                <AuroraText speed={2}>Initial Screening Process</AuroraText>
              </span>
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, ease: "easeIn" }}
              className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 mt-10"
            >
              <button
                className="group/btn relative flex items-center justify-center shadow-input w-40 h-10 rounded-xl font-bold bg-black border-transparent text-white text-sm  dark:bg-zinc-900  dark:shadow-[0px_0px_1px_1px_#262626] cursor-pointer"
                onClick={handleFileUpload}
              >
                Upload Resume
              </button>
              <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};
