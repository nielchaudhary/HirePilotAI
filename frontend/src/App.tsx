import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { Landing } from "./pages/Landing";
import { Interview } from "./pages/Interview";
import { Thankyou } from "./pages/Thankyou";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        className="toaster group"
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:!bg-black group-[.toaster]:!text-white group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-gray-300",
          },
        }}
        theme="dark"
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/thank-you" element={<Thankyou />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
