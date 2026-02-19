import { User, Settings, LogOut } from "lucide-react";
import {
  useAuthStore,
  selectUser,
  selectAssociationsLoading,
} from "../../stores/auth";
import { AppAvatar } from "../ui/AppAvatar";

interface ProfileMenuProps {
  showProfileDropdown: boolean;
  setShowProfileDropdown: (show: boolean) => void;
  closeAllDropdowns: () => void;
}

export function ProfileMenu({
  showProfileDropdown,
  setShowProfileDropdown,
  closeAllDropdowns,
}: ProfileMenuProps) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore(selectUser);
  const associationsLoading = useAuthStore(selectAssociationsLoading);

  const displayName =
    user?.name?.trim()
      ? user.name
      : associationsLoading
      ? "Loading..."
      : "User";

  const displayEmail =
    user?.email?.trim()
      ? user.email
      : associationsLoading
      ? "Loading..."
      : "";

  const handleLogout = async () => {
    await logout();
  };

  const menuItemBase =
    "flex items-center gap-3 w-full px-4 py-2.5 text-sm rounded-lg transition-colors focus:outline-none";

  return (
    <div className="relative">
      {/* Avatar trigger */}
      <button
        type="button"
        onClick={() => {
          closeAllDropdowns();
          setShowProfileDropdown(!showProfileDropdown);
        }}
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 hover:ring-2 hover:ring-cyan-300 transition"
        title="Open profile menu"
      >
        <AppAvatar src={user?.profileImage} alt={displayName} />
      </button>

      {showProfileDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowProfileDropdown(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-3 w-64 z-50 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
            {/* User info */}
            <div className="px-4 py-3 bg-linear-to-r from-cyan-50 to-white border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {displayName}
              </p>
              {displayEmail && (
                <p className="text-xs text-gray-600 truncate">
                  {displayEmail}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                className={`${menuItemBase} text-gray-700 hover:bg-gray-100`}
                onClick={() => setShowProfileDropdown(false)}
              >
                <User className="w-4 h-4 text-gray-500" />
                Profile
              </button>

              <button
                className={`${menuItemBase} text-gray-700 hover:bg-gray-100`}
                onClick={() => setShowProfileDropdown(false)}
              >
                <Settings className="w-4 h-4 text-gray-500" />
                Settings
              </button>

              <div className="my-2 border-t border-gray-100" />

              <button
                className={`${menuItemBase} text-red-600 hover:bg-red-50`}
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
