import { useRef } from "react";
import { Spotlight } from "../components/Spotlight";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { AuroraText } from "../components/AuroraText";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { isNullOrUndefined } from "../utils";

export const Landing = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!isNullOrUndefined(file) && file.type === "application/pdf") {
      toast.success(`${file.name} Uploaded Successfully`);

      navigate("/interview", {
        state: {
          file,
          loading: true,
        },
      });
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
        <div className="relative z-10 flex flex-col items-center justify-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeIn" }}
            className="bg-gradient-to-r from-[#0070F3] to-[#38bdf8] text-transparent bg-clip-text text-3xl sm:text-4xl md:text-4xl font-bold font-serif"
          >
            Meet HirePilot AI
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
      </div>
    </>
  );
};
