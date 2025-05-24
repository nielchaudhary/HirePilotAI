import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { Landing } from "./pages/Landing";

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" />
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
