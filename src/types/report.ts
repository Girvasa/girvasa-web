export interface FinancialKpisDto {
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  collectionPercentage: number;
  criticalDelinquentOver90Days: number;
}

export interface FacilityKpisDto {
  totalParkingSlots: number;
  allocatedParkingSlots: number;
  parkingOccupancyPercentage: number;
  totalAmenityBookings: number;
  amenityRevenue: number;
}

export interface OperationalKpisDto {
  openComplaints: number;
  averageComplaintResolutionHours: number;
  activeStaff: number;
  activeVendorContracts: number;
}

export interface SecurityKpisDto {
  visitsToday: number;
  visitorsCurrentlyInside: number;
  activeEmergencyAlerts: number;
}

export interface CommunityKpisDto {
  activeNotices: number;
  upcomingEvents: number;
  activePolls: number;
  averagePollParticipationPercentage: number;
}

export interface ExecutiveDashboardResponse {
  societyId: string;
  financial: FinancialKpisDto;
  facility: FacilityKpisDto;
  operational: OperationalKpisDto;
  security: SecurityKpisDto;
  community: CommunityKpisDto;
}
