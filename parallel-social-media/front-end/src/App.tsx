import { Route, Routes } from "react-router-dom";

import { SignUp } from "./pages/authentication/SignUp";
import { SignIn } from "./pages/authentication/SignIn";

function App() {
  return (
    <section className="min-h-screen h-screen">
      <Routes>
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
      </Routes>
    </section>
  );
}

export default App;
