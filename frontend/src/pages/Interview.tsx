import { Helmet } from "react-helmet";
import { Chat } from "../components/Chat";
import { useLocation } from "react-router-dom";
import type { IUserInfo } from "../lib/data";

export const Interview = () => {
  const { pdfUrl, userInfo } = useLocation().state as {
    pdfUrl: string;
    userInfo: IUserInfo;
  };

  return (
    <>
      <Helmet>
        <title>HirePilot • Interview</title>
      </Helmet>
      <div className="w-full flex justify-center items-start pt-10 pb-4 px-4 min-h-screen bg-black">
        <Chat pdfUrl={pdfUrl} userInfo={userInfo} />
      </div>
    </>
  );
};
