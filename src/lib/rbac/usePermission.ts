import { useCallback, useMemo } from "react";
import { useTenant } from "../tenant/TenantContext";

export function usePermission() {
  const { currentSociety } = useTenant();

  const permissions = useMemo(() => currentSociety?.permissions || [], [currentSociety?.permissions]);
  const roles = useMemo(() => currentSociety?.roles || [], [currentSociety?.roles]);
  const isPlatformAdmin = !!currentSociety?.isPlatformAdmin;

  const isPlatformSuperAdmin = isPlatformAdmin || roles.includes("PLATFORM_SUPER_ADMIN");
  const isSocietyAdmin = isPlatformAdmin || roles.some((r) => ["SOCIETY_ADMIN", "COMMITTEE_MEMBER", "FACILITY_MANAGER"].includes(r));
  const isAccountant = isPlatformAdmin || roles.includes("ACCOUNTANT");
  const isWebAuthorized = isPlatformSuperAdmin || isSocietyAdmin || isAccountant;

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (isPlatformAdmin) return true;
      return permissions.includes(permission) || permissions.includes("*");
    },
    [isPlatformAdmin, permissions]
  );

  const hasRole = useCallback(
    (role: string | string[]): boolean => {
      if (isPlatformAdmin) return true;
      const targetRoles = Array.isArray(role) ? role : [role];
      return targetRoles.some((r) => roles.includes(r));
    },
    [isPlatformAdmin, roles]
  );

  const canAccessModule = useCallback(
    (moduleKey: string): boolean => {
      // 1. If not authorized for web administration at all, deny all modules
      if (!isWebAuthorized) return false;

      // 2. Platform Super Admin / Developer has unrestricted platform & tenant access
      if (isPlatformAdmin || isPlatformSuperAdmin) return true;

      // 3. Module-by-module evaluation for Society Admin & Accountant
      switch (moduleKey) {
        // Universal dashboard for authorized web users
        case "dashboard":
          return isWebAuthorized;

        // Society Operations & Governance (Society Admin / Secretary ONLY)
        case "buildings":
          return isSocietyAdmin;
        case "complaints":
          return isSocietyAdmin;
        case "visitors":
          return isSocietyAdmin;
        case "amenities":
          return isSocietyAdmin;
        case "parking":
          return isSocietyAdmin;
        case "notices":
          return isSocietyAdmin;
        case "events":
        case "polls":
          return isSocietyAdmin;
        case "staff":
        case "vendors":
          return isSocietyAdmin;
        case "settings":
          return isSocietyAdmin;

        // Units & Residents: Admin manages full lifecycle; Accountant accesses for billing/ledger dispatch
        case "units":
        case "residents":
          return isSocietyAdmin || isAccountant;

        // Finance & Billing workstation (Accountant & Society Admin)
        case "billing":
        case "payments":
        case "reports":
          return isSocietyAdmin || isAccountant;

        // Documents: Legal/society circulars (Admin) and financial/audit records (Accountant)
        case "documents":
          return isSocietyAdmin || isAccountant;

        // Audit Trail: Society Admin and Statutory Auditors
        case "audit":
          return isSocietyAdmin;

        // Platform Watch: STRICTLY Super Admin / Developer (never regular society admin/accountant)
        case "platform_watch":
          return false;

        // Default-deny for any unspecified or new module
        default:
          return false;
      }
    },
    [isWebAuthorized, isPlatformAdmin, isPlatformSuperAdmin, isSocietyAdmin, isAccountant]
  );

  return {
    permissions,
    roles,
    isPlatformAdmin,
    isPlatformSuperAdmin,
    isSocietyAdmin,
    isAccountant,
    isWebAuthorized,
    hasPermission,
    hasRole,
    canAccessModule,
  };
}

