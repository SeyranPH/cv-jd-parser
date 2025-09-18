import { NavLink } from "react-router-dom";

export default function Navbar() {
  const baseClasses =
    "px-4 py-2 rounded-md font-medium transition-colors cursor-pointer";
  const activeClasses = "bg-blue-600 text-white";
  const inactiveClasses =
    "bg-gray-100 text-gray-700 hover:bg-gray-200";

  return (
    <nav className="bg-white shadow mb-4 px-6 py-3 flex gap-4 border-b">
      <NavLink
        to="/cv"
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
        }
      >
        CV Parser
      </NavLink>
      <NavLink
        to="/jd"
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
        }
      >
        JD Parser
      </NavLink>
    </nav>
  );
}
