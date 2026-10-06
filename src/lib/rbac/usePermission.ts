import { useTenant } from "../tenant/TenantContext";

export function usePermission() {
  const { currentSociety } = useTenant();

  const permissions = currentSociety?.permissions || [];
  const roles = currentSociety?.roles || [];
  const isPlatformAdmin = !!currentSociety?.isPlatformAdmin;

  const hasPermission = (permission: string): boolean => {
    if (isPlatformAdmin) return true;
    return permissions.includes(permission) || permissions.includes("*");
  };

  const hasRole = (role: string | string[]): boolean => {
    if (isPlatformAdmin) return true;
    const targetRoles = Array.isArray(role) ? role : [role];
    return targetRoles.some((r) => roles.includes(r));
  };

  const canAccessModule = (moduleKey: string): boolean => {
    if (isPlatformAdmin) return true;
    switch (moduleKey) {
      case "dashboard":
        return true;
      case "buildings":
      case "units":
        return hasPermission("structure.view") || hasRole(["SOCIETY_ADMIN", "COMMITTEE_MEMBER", "FACILITY_MANAGER"]);
      case "residents":
        return hasPermission("resident.view") || hasRole(["SOCIETY_ADMIN", "COMMITTEE_MEMBER", "ACCOUNTANT"]);
      case "billing":
        return hasPermission("billing.view") || hasRole(["SOCIETY_ADMIN", "ACCOUNTANT", "COMMITTEE_MEMBER"]);
      case "payments":
        return hasPermission("payment.view") || hasRole(["SOCIETY_ADMIN", "ACCOUNTANT", "COMMITTEE_MEMBER"]);
      case "complaints":
        return hasPermission("complaint.view") || hasRole(["SOCIETY_ADMIN", "FACILITY_MANAGER", "COMMITTEE_MEMBER", "RESIDENT"]);
      case "visitors":
        return hasPermission("visitor.view") || hasRole(["SOCIETY_ADMIN", "SECURITY_GUARD", "FACILITY_MANAGER"]);
      case "notices":
        return hasPermission("notice.view") || true;
      case "amenities":
        return hasPermission("amenity.view") || true;
      case "events":
      case "polls":
        return true;
      case "documents":
        return hasPermission("document.view") || true;
      case "staff":
        return hasPermission("staff.view") || hasRole(["SOCIETY_ADMIN", "FACILITY_MANAGER", "COMMITTEE_MEMBER"]);
      case "vendors":
        return hasPermission("vendor.view") || hasRole(["SOCIETY_ADMIN", "FACILITY_MANAGER", "COMMITTEE_MEMBER"]);
      case "parking":
        return hasPermission("parking.view") || hasRole(["SOCIETY_ADMIN", "FACILITY_MANAGER", "COMMITTEE_MEMBER"]);
      case "reports":
        return hasPermission("report.view") || hasRole(["SOCIETY_ADMIN", "ACCOUNTANT", "COMMITTEE_MEMBER"]);
      case "audit":
        return hasPermission("audit.view") || hasRole(["SOCIETY_ADMIN", "PLATFORM_SUPER_ADMIN"]);
      case "settings":
        return hasPermission("society.configure") || hasRole(["SOCIETY_ADMIN"]);
      default:
        return true;
    }
  };

  return {
    permissions,
    roles,
    isPlatformAdmin,
    hasPermission,
    hasRole,
    canAccessModule,
  };
}
