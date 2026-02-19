import { Link } from "react-router-dom";

export default function Home() {
  const suites = [
    { name: "Farcl Explore", path: "/explore" },
    { name: "Farcl Deploy", path: "/deploy" },
    { name: "Farcl IAM", path: "/iam" },
    { name: "Farcl COM", path: "/com" },
    { name: "Farcl RM", path: "/rm" },
    { name: "Farcl Logs", path: "/logs" },
    { name: "Farcl CI/CD", path: "/ci" },
    { name: "Farcl Admin", path: "/admin" },
    { name: "Farcl Studio", path: "/studio" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-3xl font-bold mb-6">Farcl Platform — Suites</h1>

      <div className="flex flex-col gap-3">
        {suites.map((suite) => (
          <Link
            key={suite.path}
            to={suite.path}
            className="
              w-fit px-5 py-3 
              border border-gray-300 rounded-lg 
              bg-white text-gray-800 
              hover:bg-gray-100 hover:border-gray-400 
              transition-all duration-200
              shadow-sm hover:shadow
            "
          >
            {suite.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
