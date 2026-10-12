export interface BusinessMetrics {
  totalSocieties: number;
  activeSocieties: number;
  trialingSocieties: number;
  paidSocieties: number;
  totalUnitsManaged: number;
  totalBuildingsManaged: number;
  estimatedMonthlyRevenuePaise: number;
  currency: string;
}

export interface UserBreakdownMetrics {
  totalRegisteredUsers: number;
  totalWebUsers: number;
  totalAppUsers: number;
  activePast24Hours: number;
  roleDistribution: Record<string, number>;
}

export interface SystemHealthMetrics {
  status: string;
  uptimeSeconds: number;
  jvmMemoryUsedMb: number;
  jvmMemoryMaxMb: number;
  cpuCores: number;
  activeThreads: number;
  dbPoolActiveConnections: number;
  dbPoolMaxConnections: number;
  virtualThreadsEnabled: boolean;
  timestamp: string;
}

export interface SocietyWatchItem {
  societyId: string;
  societyCode: string;
  societyName: string;
  city: string;
  state: string;
  societyStatus: string;
  planCode: string;
  planName: string;
  subscriptionStatus: string;
  totalUnits: number;
  totalMembers: number;
  adminMobile: string;
  createdAt: string;
}

export interface PlatformWatchMetricsResponse {
  business: BusinessMetrics;
  users: UserBreakdownMetrics;
  health: SystemHealthMetrics;
  societies: SocietyWatchItem[];
}
