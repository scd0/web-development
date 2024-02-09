import { IoLogoPinterest } from "react-icons/io";

import { ModeToggle } from "./ui/mode-toggle";
import { Link } from "react-router-dom";

function NavigationBar() {
  return (
    <section className="h-[57px] flex items-center border-b border-border/40 justify-between px-[10%]">
      <Link to="/" className="flex items-center">
        <IoLogoPinterest size={22} />
        <p style={{ fontFamily: "Oleo Script" }} className="ml-2 text-xl mt-1">Parallel</p>
      </Link>

      <div>
        <ModeToggle />
      </div>
    </section>
  );
}

export default NavigationBar;