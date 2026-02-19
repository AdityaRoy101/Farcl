import { Building2, ChevronsUpDown, CheckCircle2, Plus } from "lucide-react";
import { useOrg } from "../../contexts/workspace";
import type { Tenant } from "../../contexts/workspace";

interface OrgSwitcherProps {
  showOrgsDropdown: boolean;
  setShowOrgsDropdown: (show: boolean) => void;
  closeAllDropdowns: () => void;
  onCreateTenant: () => void;
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function OrgSwitcher({
  showOrgsDropdown,
  setShowOrgsDropdown,
  closeAllDropdowns,
  onCreateTenant,
}: OrgSwitcherProps) {
  const {
    tenants,
    selectedOrgId,
    selectedOrg,
    isSwitchingTenant,
    selectOrg,
  } = useOrg();

  return (
    <div className="relative">
      <button
        onClick={() => {
          closeAllDropdowns();
          setShowOrgsDropdown(!showOrgsDropdown);
        }}
        className="flex items-center gap-1.5 px-3 py-2 font-medium rounded-lg transition-all duration-200 text-gray-800 hover:text-gray-900 hover:bg-white/50 backdrop-blur-sm"
      >
        {selectedOrg ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Building2 className="w-3 h-3 text-white" />
            </div>
            <span className="max-w-[160px] truncate font-semibold">{selectedOrg.name}</span>
          </div>
        ) : (
          <span className="font-semibold">Organizations</span>
        )}
        <ChevronsUpDown
          className={classNames(
            "w-3.5 h-3.5 text-gray-600 transition-transform",
            showOrgsDropdown && "rotate-180"
          )}
        />
      </button>

      {showOrgsDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowOrgsDropdown(false)} />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Switch Organization
              </div>

              {tenants.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">No organizations found</div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {tenants.map((tenant: Tenant) => (
                    <button
                      key={tenant.id}
                      disabled={isSwitchingTenant}
                      onClick={async () => {
                        await selectOrg(tenant.id);
                        setShowOrgsDropdown(false);
                      }}
                      className={classNames(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                        selectedOrgId === tenant.id ? "bg-blue-50" : "hover:bg-gray-50",
                        isSwitchingTenant && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div
                          className={classNames(
                            "font-medium transition-colors text-sm",
                            selectedOrgId === tenant.id
                              ? "text-blue-600"
                              : "text-gray-900 group-hover:text-blue-600"
                          )}
                        >
                          {tenant.name}
                        </div>
                      </div>
                      {selectedOrgId === tenant.id && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-2 border-t border-gray-100 mt-1">
                <button
                  onClick={onCreateTenant}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Organization
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
