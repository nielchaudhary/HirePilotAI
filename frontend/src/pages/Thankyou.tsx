import { Spotlight } from "../components/Spotlight";
import { motion } from "framer-motion";

export const Thankyou = () => {
  return (
    <div className="relative bg-black flex flex-col items-center justify-center min-h-screen w-screen overflow-x-hidden overflow-y-hidden py-10 max-width-7xl">
      <Spotlight />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeIn" }}
        className="flex flex-col space-y-4 mt-10 justify-center items-center z-10"
      >
        <h1 className="text-white text-4xl font-bold font-serif">
          Thank you for using{" "}
          <span className="text-[#ACFFAC] font-mono">HirePilot AI</span>
        </h1>
        <p className="text-white text-2xl mt-4 font-serif">
          We will get back to you shortly.
        </p>
      </motion.div>
    </div>
  );
};
