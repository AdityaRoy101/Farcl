import { Search } from "lucide-react";

interface HeaderSearchProps {
  className?: string;
}

export function HeaderSearch({ className = "" }: HeaderSearchProps) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder="Search anything..."
        className="w-40 md:w-64 lg:w-80 px-4 py-2.5 pl-10 bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all text-sm text-gray-900 placeholder-gray-500 shadow-sm"
      />
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      <kbd className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-medium text-gray-500 bg-white/80 rounded border border-gray-200">
        ⌘K
      </kbd>
    </div>
  );
}
