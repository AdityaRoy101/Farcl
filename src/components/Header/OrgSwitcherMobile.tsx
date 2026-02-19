import { ChevronDown, Building2, CheckCircle2 } from "lucide-react";
import { useOrg } from "../../contexts/workspace";
import type { Tenant } from "../../contexts/workspace";

interface OrgSwitcherMobileProps {
  showOrgsDropdown: boolean;
  setShowOrgsDropdown: (show: boolean) => void;
  onSelectOrg: (orgId: string) => Promise<void>;
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function OrgSwitcherMobile({
  showOrgsDropdown,
  setShowOrgsDropdown,
  onSelectOrg,
}: OrgSwitcherMobileProps) {
  const {
    tenants,
    selectedOrgId,
    selectedOrg,
    isSwitchingTenant,
  } = useOrg();

  return (
    <div className="space-y-1">
      <button
        onClick={() => setShowOrgsDropdown(!showOrgsDropdown)}
        className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-gray-900 font-medium rounded-xl hover:bg-cyan-50 transition-all"
      >
        <div className="flex items-center gap-2">
          {selectedOrg && (
            <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Building2 className="w-3 h-3 text-white" />
            </div>
          )}
          <span>{selectedOrg?.name || "Organizations"}</span>
        </div>
        <ChevronDown className={classNames("w-4 h-4 transition-transform", showOrgsDropdown && "rotate-180")} />
      </button>

      {showOrgsDropdown && (
        <div className="ml-4 space-y-1">
          {tenants.map((tenant: Tenant) => (
            <button
              key={tenant.id}
              disabled={isSwitchingTenant}
              onClick={async () => {
                await onSelectOrg(tenant.id);
                setShowOrgsDropdown(false);
              }}
              className={classNames(
                "w-full flex items-center gap-3 px-4 py-2 rounded-lg",
                selectedOrgId === tenant.id
                  ? "bg-cyan-50 text-blue-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                isSwitchingTenant && "opacity-60 cursor-not-allowed"
              )}
            >
              <Building2 className="w-4 h-4" />
              <span className="text-sm">{tenant.name}</span>
              {selectedOrgId === tenant.id && <CheckCircle2 className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
