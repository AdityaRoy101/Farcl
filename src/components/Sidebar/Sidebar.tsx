// import { useState, useMemo } from "react";
// import {
//   ArrowRight,
//   ChevronDown
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// type AppItem = {
//   id: string;
//   name: string;
//   desc: string;
//   color: string;
// };

// export function Sidebar() {
//   const [showMainDropdown, setShowMainDropdown] = useState(false);
//   const navigate = useNavigate();

//   const handleClick = (appId:string) => {
//     setShowMainDropdown(false)
//     navigate(`/${appId}`)
//   }

//   const farclApps = useMemo(
//     () => [
//       { id: "deploy", name: "Deploy", desc: "Deployment management",  color: "from-blue-500 to-blue-600" },
//       { id: "iam", name: "IAM", desc: "Identity & access", color: "from-blue-400 to-blue-500" },
//       { id: "com", name: "COM", desc: "Communication tools",  color: "from-blue-500 to-blue-600" },
//       { id: "rm", name: "RM", desc: "Resource management",  color: "from-blue-400 to-blue-500" },
//       { id: "logs", name: "Logs", desc: "Log monitoring", color: "from-blue-500 to-blue-600" },
//       { id: "ci", name: "CI/CD", desc: "Continuous integration",  color: "from-blue-400 to-blue-500" },
//       { id: "explore", name: "Explore", desc: "Explore resources",  color: "from-blue-500 to-blue-600" },
//       { id: "admin", name: "Admin", desc: "Admin controls", color: "from-blue-400 to-blue-500" },
//       { id: "studio", name: "Studio", desc: "Build & iterate",  color: "from-blue-500 to-blue-600" },
//     ],
//     []
//   );

//   const AppIcon = ({ name }: { name: string }) => (
//   <div className="relative w-7 h-7 md:w-8 md:h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
//     <span className="text-white font-bold text-base md:text-lg">
//       {name.charAt(0).toUpperCase()}
//     </span>
//   </div>
// );

//   return (
//     <div className="relative">
//       {/* Toggle Button */}
//       <button
//       onClick={() => setShowMainDropdown(!showMainDropdown)}
//         className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-xl hover:bg-blue-100 transition-all duration-300 group"
//       >
//         <div className="relative w-8 h-8 md:w-9 md:h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
//           <span className="text-white font-bold text-base md:text-lg">E</span>
//         </div>
//         <span className="font-bold text-lg md:text-xl text-gray-900 hidden sm:block">
//           Explore
//         </span>
//         <ChevronDown
//           className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
//             showMainDropdown ? 'rotate-180' : ''
//           }`}
//         />
//       </button>

//       {/* Dropdown */}
//       {showMainDropdown && (
//         <>
//           <div 
//             className="fixed inset-0 z-40" 
//             onClick={() => setShowMainDropdown(false)} 
//           />
//           <div className="absolute top-full left-0 mt-2 w-72 md:w-80 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
//             <div className="p-2">
//               {farclApps.map((app) => (
//                 <button
//                   key={app.id}
//                   onClick={()=> handleClick(app.id)}
//                   className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
//                 >
//                   <AppIcon name={app.name} />
//                   <div className="flex-1 text-left">
//                     <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
//                       {app.name}
//                     </div>
//                     <div className="text-xs text-gray-500">{app.desc}</div>
//                   </div>
//                   <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
//                 </button>
//               ))}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }




// src/components/Sidebar/Sidebar.tsx

import { useMemo, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type AppItem = {
  id: string;
  name: string;
  desc: string;
  color: string;
};

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function getActiveApp(pathname: string, apps: AppItem[]): AppItem {
  
  const match = apps
    .filter((a) => pathname === `/${a.id}` || pathname.startsWith(`/${a.id}/`))
    .sort((a, b) => b.id.length - a.id.length)[0];

  return match ?? apps.find((a) => a.id === "explore") ?? apps[0];
}

export function Sidebar() {
  const [showMainDropdown, setShowMainDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const farclApps = useMemo<AppItem[]>(
    () => [
      { id: "deploy", name: "Deploy", desc: "Deployment management", color: "from-blue-500 to-blue-600" },
      { id: "iam", name: "IAM", desc: "Identity & access", color: "from-blue-400 to-blue-500" },
      { id: "com", name: "COM", desc: "Communication tools", color: "from-blue-500 to-blue-600" },
      { id: "rm", name: "RM", desc: "Resource management", color: "from-blue-400 to-blue-500" },
      { id: "logs", name: "Logs", desc: "Log monitoring", color: "from-blue-500 to-blue-600" },
      { id: "ci", name: "CI/CD", desc: "Continuous integration", color: "from-blue-400 to-blue-500" },
      { id: "explore", name: "Explore", desc: "Explore resources", color: "from-blue-500 to-blue-600" },
      { id: "admin", name: "Admin", desc: "Admin controls", color: "from-blue-400 to-blue-500" },
      { id: "studio", name: "Studio", desc: "Build & iterate", color: "from-blue-500 to-blue-600" },
    ],
    []
  );

  const activeApp = useMemo(
    () => getActiveApp(location.pathname, farclApps),
    [location.pathname, farclApps]
  );

  const handleClick = (appId: string) => {
    setShowMainDropdown(false);
    navigate(`/${appId}`);
  };

  const AppIcon = ({ name, color }: { name: string; color: string }) => (
    <div
      className={cx(
        "relative w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center shadow-lg",
        "bg-gradient-to-r",
        color
      )}
    >
      <span className="text-white font-bold text-base md:text-lg">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setShowMainDropdown((v) => !v)}
        className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-xl hover:bg-blue-100 transition-all duration-300 group"
      >
        <AppIcon name={activeApp.name} color={activeApp.color} />

        <span className="font-bold text-lg md:text-xl text-gray-900 hidden sm:block">
          {activeApp.name}
        </span>

        <ChevronDown
          className={cx(
            "w-4 h-4 text-gray-500 transition-transform duration-300",
            showMainDropdown && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {showMainDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMainDropdown(false)} />

          <div className="absolute top-full left-0 mt-2 w-72 md:w-80 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
            <div className="p-2">
              {farclApps.map((app) => {
                const isActive =
                  location.pathname === `/${app.id}` || location.pathname.startsWith(`/${app.id}/`);

                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => handleClick(app.id)}
                    className={cx(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
                      isActive ? "bg-blue-50" : "hover:bg-blue-50"
                    )}
                  >
                    <AppIcon name={app.name} color={app.color} />

                    <div className="flex-1 text-left">
                      <div
                        className={cx(
                          "font-semibold transition-colors",
                          isActive ? "text-blue-700" : "text-gray-900 group-hover:text-blue-600"
                        )}
                      >
                        {app.name}
                      </div>
                      <div className="text-xs text-gray-500">{app.desc}</div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}