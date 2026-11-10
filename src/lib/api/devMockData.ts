import { OtpResponseDto, AuthTokensResponse, UserResponse } from "@/types/auth";
import { CurrentSocietyContext, UserSocietyMembership } from "@/types/tenant";
import { ExecutiveDashboardResponse } from "@/types/report";
import { BillSummaryResponse } from "@/types/billing";
import { VisitResponse } from "@/types/visitor";
import { ComplaintResponse } from "@/types/complaint";
import { UnitResponse, BuildingResponse } from "@/types/structure";
import { PlatformWatchMetricsResponse } from "@/types/platform";
import { OnboardingProgressResponse, SocietySubscriptionDetailResponse } from "@/types/subscription";
import {
  AppVersionConfig,
  FeatureFlagItem,
  SmsGatewayConfig,
  PlatformUserItem,
  DeletedUserItem,
  MaintenanceConfig,
  PaymentGatewayConfig,
  SocietyBankAccountItem,
  SubscriptionRateItem,
  ApiKeyIntegrationItem,
  ImpersonationSession,
  SocietyLifecycleItem,
  PendingApprovalItem,
  UnreconciledTransactionItem,
  BackgroundJobItem,
} from "@/types/platformAdmin";



/**
 * Society OS (Girvasa) Dev & Test Mock Data Service
 * Provides offline fallback for seamless Super Admin test logins and platform exploration
 * without modifying any UI components or violating tenant isolation specifications.
 */

export const DEV_SUPER_ADMIN_USER: UserResponse = {
  id: "usr-superadmin-001",
  mobileNumber: "+919876543210",
  phoneVerified: true,
  fullName: "Platform Super Admin",
  email: "superadmin@girvasa.com",
  profileImageKey: null,
  status: "ACTIVE",
  createdAt: "2026-01-01T00:00:00Z",
};

export const DEV_SOCIETIES: UserSocietyMembership[] = [
  {
    societyId: "soc-girvasa-apex",
    societyCode: "GIR-001",
    societyName: "Girvasa Apex Grandeur Society",
    roles: ["PLATFORM_SUPER_ADMIN", "SOCIETY_ADMIN"],
    membershipStatus: "ACTIVE",
    joinedAt: "2026-01-01T00:00:00Z",
  },
];

export const DEV_CURRENT_SOCIETY: CurrentSocietyContext = {
  societyId: "soc-girvasa-apex",
  societyCode: "GIR-001",
  societyName: "Girvasa Apex Grandeur Society",
  legalName: "Girvasa Apex Grandeur Co-operative Housing Society Ltd.",
  city: "Mumbai",
  state: "Maharashtra",
  countryCode: "IN",
  pincode: "400001",
  status: "ACTIVE",
  membershipId: "mem-superadmin-001",
  membershipStatus: "ACTIVE",
  roles: ["PLATFORM_SUPER_ADMIN", "SOCIETY_ADMIN"],
  permissions: ["*"],
  isPlatformAdmin: true,
};

export const DEV_EXECUTIVE_DASHBOARD: ExecutiveDashboardResponse = {
  societyId: "soc-girvasa-apex",
  financial: {
    totalBilled: 750000,
    totalPaid: 685000,
    totalOutstanding: 65000,
    collectionPercentage: 91.3,
    criticalDelinquentOver90Days: 2,
  },
  facility: {
    totalParkingSlots: 150,
    allocatedParkingSlots: 138,
    parkingOccupancyPercentage: 92.0,
    totalAmenityBookings: 42,
    amenityRevenue: 54000,
  },
  operational: {
    openComplaints: 4,
    averageComplaintResolutionHours: 18.5,
    activeStaff: 12,
    activeVendorContracts: 8,
  },
  security: {
    visitsToday: 28,
    visitorsCurrentlyInside: 6,
    activeEmergencyAlerts: 0,
  },
  community: {
    activeNotices: 5,
    upcomingEvents: 2,
    activePolls: 1,
    averagePollParticipationPercentage: 78.4,
  },
};

export const DEV_BILLS: BillSummaryResponse[] = [
  {
    id: "bill-001",
    societyId: "soc-girvasa-apex",
    unitId: "unit-101",
    unitNumber: "A-101",
    buildingName: "Tower A",
    billNumber: "INV-2026-001",
    billingPeriodId: "period-nov-2026",
    periodName: "November 2026",
    subtotal: 5500,
    taxAmount: 990,
    totalAmount: 6490,
    paidAmount: 6490,
    outstandingAmount: 0,
    dueDate: "2026-11-15T00:00:00Z",
    status: "PAID",
    createdAt: "2026-11-01T00:00:00Z",
  },
  {
    id: "bill-002",
    societyId: "soc-girvasa-apex",
    unitId: "unit-102",
    unitNumber: "A-102",
    buildingName: "Tower A",
    billNumber: "INV-2026-002",
    billingPeriodId: "period-nov-2026",
    periodName: "November 2026",
    subtotal: 5500,
    taxAmount: 990,
    totalAmount: 6490,
    paidAmount: 0,
    outstandingAmount: 6490,
    dueDate: "2026-11-15T00:00:00Z",
    status: "PENDING",
    createdAt: "2026-11-01T00:00:00Z",
  },
  {
    id: "bill-003",
    societyId: "soc-girvasa-apex",
    unitId: "unit-201",
    unitNumber: "B-201",
    buildingName: "Tower B",
    billNumber: "INV-2026-003",
    billingPeriodId: "period-nov-2026",
    periodName: "November 2026",
    subtotal: 7200,
    taxAmount: 1296,
    totalAmount: 8496,
    paidAmount: 8496,
    outstandingAmount: 0,
    dueDate: "2026-11-15T00:00:00Z",
    status: "PAID",
    createdAt: "2026-11-01T00:00:00Z",
  },
  {
    id: "bill-004",
    societyId: "soc-girvasa-apex",
    unitId: "unit-202",
    unitNumber: "B-202",
    buildingName: "Tower B",
    billNumber: "INV-2026-004",
    billingPeriodId: "period-nov-2026",
    periodName: "November 2026",
    subtotal: 7200,
    taxAmount: 1296,
    totalAmount: 8496,
    paidAmount: 0,
    outstandingAmount: 8496,
    dueDate: "2026-11-10T00:00:00Z",
    status: "OVERDUE",
    createdAt: "2026-10-25T00:00:00Z",
  },
];

export const DEV_VISITS: VisitResponse[] = [
  {
    id: "vis-001",
    societyId: "soc-girvasa-apex",
    visitNumber: "VIS-2026-001",
    visitorName: "Rajesh Kumar",
    visitorPhone: "+919811122233",
    visitorType: "GUEST",
    categoryName: "Guest",
    unitId: "unit-101",
    unitNumber: "A-101",
    hostUnitNumber: "A-101",
    hostUserName: "Amitabh Verma",
    purpose: "Personal Visit",
    vehicleNumber: "MH-02-CD-4567",
    vehicleType: "FOUR_WHEELER",
    checkInTime: "2026-11-02T10:15:00Z",
    checkedInAt: "2026-11-02T10:15:00Z",
    status: "CHECKED_IN",
    createdAt: "2026-11-02T10:15:00Z",
  },
  {
    id: "vis-002",
    societyId: "soc-girvasa-apex",
    visitNumber: "VIS-2026-002",
    visitorName: "Sunil Delivery (Amazon)",
    visitorPhone: "+919822233344",
    visitorType: "DELIVERY",
    categoryName: "E-Commerce Delivery",
    unitId: "unit-201",
    unitNumber: "B-201",
    hostUnitNumber: "B-201",
    hostUserName: "Rohit Deshpande",
    purpose: "Package Delivery",
    checkInTime: "2026-11-02T11:30:00Z",
    checkedInAt: "2026-11-02T11:30:00Z",
    checkOutTime: "2026-11-02T11:45:00Z",
    checkedOutAt: "2026-11-02T11:45:00Z",
    status: "CHECKED_OUT",
    createdAt: "2026-11-02T11:30:00Z",
  },
];

export const DEV_COMPLAINTS: ComplaintResponse[] = [
  {
    id: "cmp-001",
    societyId: "soc-girvasa-apex",
    ticketNumber: "TKT-2026-001",
    title: "Passenger Lift 2 Intermittent Vibration",
    description: "Lift 2 in Tower A makes audible vibration when stopping at 7th floor.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    categoryName: "Lift Maintenance",
    unitId: "unit-101",
    unitNumber: "A-101",
    reportedByUserId: "usr-resident-001",
    reportedByName: "Amitabh Verma",
    assignedToUserId: "usr-staff-001",
    assignedToName: "Otis Service Engineer",
    createdAt: "2026-11-01T09:30:00Z",
    updatedAt: "2026-11-02T08:00:00Z",
  },
  {
    id: "cmp-002",
    societyId: "soc-girvasa-apex",
    ticketNumber: "TKT-2026-002",
    title: "Basement 1 Sprinkler Sensor Check",
    description: "Annual preventive inspection of pressure release valves in B1 parking.",
    status: "RESOLVED",
    priority: "MEDIUM",
    categoryName: "Fire & Safety",
    unitNumber: "Common Area B1",
    reportedByUserId: "usr-superadmin-001",
    reportedByName: "Platform Super Admin",
    assignedToName: "Facility Safety Officer",
    createdAt: "2026-10-28T14:00:00Z",
    updatedAt: "2026-10-30T17:00:00Z",
  },
];

export const DEV_UNITS: UnitResponse[] = [
  {
    id: "unit-101",
    societyId: "soc-girvasa-apex",
    buildingId: "bld-001",
    buildingName: "Tower A",
    wingId: "wing-001",
    wingName: "East Wing",
    unitNumber: "A-101",
    floorNumber: 1,
    unitType: "RESIDENTIAL",
    status: "OCCUPIED",
    squareFeet: 1250,
    configuration: "3 BHK",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "unit-102",
    societyId: "soc-girvasa-apex",
    buildingId: "bld-001",
    buildingName: "Tower A",
    wingId: "wing-001",
    wingName: "East Wing",
    unitNumber: "A-102",
    floorNumber: 1,
    unitType: "RESIDENTIAL",
    status: "OCCUPIED",
    squareFeet: 1250,
    configuration: "3 BHK",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "unit-201",
    societyId: "soc-girvasa-apex",
    buildingId: "bld-002",
    buildingName: "Tower B",
    wingId: "wing-002",
    wingName: "West Wing",
    unitNumber: "B-201",
    floorNumber: 2,
    unitType: "RESIDENTIAL",
    status: "OCCUPIED",
    squareFeet: 1650,
    configuration: "4 BHK",
    createdAt: "2026-01-01T00:00:00Z",
  },
];

export const DEV_BUILDINGS: BuildingResponse[] = [
  {
    id: "bld-001",
    societyId: "soc-girvasa-apex",
    name: "Tower A",
    code: "TWR-A",
    totalFloors: 14,
    totalUnits: 56,
    description: "Premium East-Facing Residential Wing",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "bld-002",
    societyId: "soc-girvasa-apex",
    name: "Tower B",
    code: "TWR-B",
    totalFloors: 18,
    totalUnits: 72,
    description: "Signature West-Facing Residential Wing",
    createdAt: "2026-01-01T00:00:00Z",
  },
];

export const DEV_PLATFORM_WATCH: PlatformWatchMetricsResponse = {
  business: {
    totalSocieties: 48,
    activeSocieties: 45,
    trialingSocieties: 3,
    paidSocieties: 42,
    totalUnitsManaged: 6240,
    totalBuildingsManaged: 112,
    estimatedMonthlyRevenuePaise: 42000000,
    currency: "INR",
  },
  users: {
    totalRegisteredUsers: 14850,
    totalWebUsers: 340,
    totalAppUsers: 14510,
    activePast24Hours: 8920,
    roleDistribution: {
      PLATFORM_SUPER_ADMIN: 2,
      SOCIETY_ADMIN: 96,
      ACCOUNTANT: 52,
      RESIDENT: 13800,
      SECURITY_GUARD: 900,
    },
  },
  health: {
    status: "HEALTHY",
    uptimeSeconds: 1248000,
    jvmMemoryUsedMb: 384,
    jvmMemoryMaxMb: 2048,
    cpuCores: 8,
    activeThreads: 42,
    dbPoolActiveConnections: 6,
    dbPoolMaxConnections: 30,
    virtualThreadsEnabled: true,
    timestamp: new Date().toISOString(),
  },
  societies: [
    {
      societyId: "soc-girvasa-apex",
      societyCode: "GIR-001",
      societyName: "Girvasa Apex Grandeur Society",
      city: "Mumbai",
      state: "Maharashtra",
      societyStatus: "ACTIVE",
      planCode: "ENTERPRISE",
      planName: "Girvasa Enterprise Society Suite",
      subscriptionStatus: "ACTIVE",
      totalUnits: 128,
      totalMembers: 360,
      adminMobile: "+919876543210",
      createdAt: "2026-01-01T00:00:00Z",
    },
    {
      societyId: "soc-002",
      societyCode: "SOC-002",
      societyName: "Royal Palms CHS",
      city: "Pune",
      state: "Maharashtra",
      societyStatus: "ACTIVE",
      planCode: "GROWTH",
      planName: "Girvasa Growth Society",
      subscriptionStatus: "ACTIVE",
      totalUnits: 96,
      totalMembers: 240,
      adminMobile: "+919822001122",
      createdAt: "2026-02-15T00:00:00Z",
    },
  ],
};

export const DEV_ONBOARDING_PROGRESS: OnboardingProgressResponse = {
  societyId: "soc-girvasa-apex",
  societyName: "Girvasa Apex Grandeur Society",
  societyCode: "GIR-001",
  onboardingStatus: "WIZARD_COMPLETED",
  verificationStatus: "VERIFIED",
  totalBuildings: 2,
  totalUnits: 128,
  totalMembers: 360,
  completed: true,
};

export const DEV_SUBSCRIPTION: SocietySubscriptionDetailResponse = {
  id: "sub-001",
  societyId: "soc-girvasa-apex",
  plan: {
    id: "plan-ent-01",
    code: "ENTERPRISE",
    name: "Girvasa Enterprise Society Suite",
    description: "Full suite for large cooperative housing societies and apex federations.",
    maxUnits: 500,
    pricePaise: 499900,
    currency: "INR",
    billingInterval: "ANNUAL",
    featuresSummary: "Full ERP, Accounting, Gate Management, DPDP Compliance",
    active: true,
  },
  status: "ACTIVE",
  trialEndsAt: "2026-12-31T00:00:00Z",
  currentPeriodStart: "2026-01-01T00:00:00Z",
  currentPeriodEnd: "2027-01-01T00:00:00Z",
  daysRemaining: 60,
  isExpiringSoon: false,
  isExpired: false,
};

export const DEV_APP_VERSIONS: AppVersionConfig = {
  minAndroidVersion: "1.2.0",
  latestAndroidVersion: "1.4.2",
  minIosVersion: "1.2.0",
  latestIosVersion: "1.4.2",
  forceUpdateEnabled: false,
  playStoreUrl: "https://play.google.com/store/apps/details?id=com.girvasa.societyos",
  appStoreUrl: "https://apps.apple.com/app/girvasa-society-os/id6449123456",
  maintenanceNotice: "All services operational. Mobile client v1.4.2 available with offline gate pass sync.",
};

export const DEV_FEATURE_FLAGS: FeatureFlagItem[] = [
  {
    key: "gate_os_guard_tablet",
    name: "Gate OS Security Guard Tablet App",
    description: "Enable guard check-in/out, visitor facial/ID capture, vehicle ANPR, and delivery pass validation.",
    category: "OPERATIONS",
    enabledGlobal: true,
    societiesOverridden: 0,
  },
  {
    key: "digital_maintenance_pg",
    name: "Online Maintenance Gateway Collection",
    description: "Allow residents to pay maintenance invoices directly via UPI, NetBanking & Cards.",
    category: "FINANCE",
    enabledGlobal: true,
    societiesOverridden: 1,
  },
  {
    key: "whatsapp_invoice_dispatch",
    name: "WhatsApp PDF Invoices & Receipt Dispatch",
    description: "Send instant notification and PDF attachments to resident WhatsApp numbers on bill generation.",
    category: "MOBILE",
    enabledGlobal: true,
    societiesOverridden: 3,
  },
  {
    key: "amenity_slot_booking",
    name: "Clubhouse & Amenity Slot Booking Engine",
    description: "Slot reservations, capacity limits, and advance booking rules.",
    category: "OPERATIONS",
    enabledGlobal: true,
    societiesOverridden: 0,
  },
  {
    key: "community_buzz_polls",
    name: "Community Buzz & Resident Polls",
    description: "Interactive discussion forum, AGM notices, and formal digital voting.",
    category: "MOBILE",
    enabledGlobal: true,
    societiesOverridden: 2,
  },
  {
    key: "smart_parking_allocation",
    name: "Smart Parking & Guest Vehicle Tracker",
    description: "Manage reserved resident slots and automated guest parking tokens.",
    category: "OPERATIONS",
    enabledGlobal: true,
    societiesOverridden: 0,
  },
];

export const DEV_SMS_GATEWAY: SmsGatewayConfig = {
  provider: "MSG91",
  senderId: "GRVASA",
  dltEntityId: "1701159123456789012",
  authKeyMasked: "389218A4•••••••••••••77B1",
  dailyQuota: 50000,
  usedToday: 3420,
  deliverySuccessRate: 99.4,
  whatsappEnabled: true,
};

export const DEV_PLATFORM_USERS: PlatformUserItem[] = [
  {
    id: "usr-superadmin-001",
    fullName: "Platform Super Admin",
    mobileNumber: "+919876543210",
    email: "superadmin@girvasa.com",
    kycStatus: "VERIFIED",
    societyId: "soc-girvasa-apex",
    societyName: "Girvasa Apex Grandeur Society",
    role: "PLATFORM_SUPER_ADMIN",
    status: "ACTIVE",
    lastLoginAt: new Date().toISOString(),
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "usr-002",
    fullName: "Rajesh Sharma",
    mobileNumber: "+919820011223",
    email: "rajesh.sharma@apexgrandeur.org",
    kycStatus: "VERIFIED",
    societyId: "soc-girvasa-apex",
    societyName: "Girvasa Apex Grandeur Society",
    unitNumber: "A-402",
    role: "SOCIETY_ADMIN",
    status: "ACTIVE",
    lastLoginAt: "2026-11-02T10:15:00Z",
    createdAt: "2026-01-05T09:00:00Z",
  },
  {
    id: "usr-003",
    fullName: "Pooja Mehta",
    mobileNumber: "+919833445566",
    email: "pooja.mehta@apexgrandeur.org",
    kycStatus: "VERIFIED",
    societyId: "soc-girvasa-apex",
    societyName: "Girvasa Apex Grandeur Society",
    unitNumber: "B-801",
    role: "ACCOUNTANT",
    status: "ACTIVE",
    lastLoginAt: "2026-11-02T08:30:00Z",
    createdAt: "2026-01-10T11:00:00Z",
  },
  {
    id: "usr-004",
    fullName: "Vikram Malhotra",
    mobileNumber: "+919811223344",
    email: "vikram.m@gmail.com",
    kycStatus: "PENDING",
    societyId: "soc-girvasa-apex",
    societyName: "Girvasa Apex Grandeur Society",
    unitNumber: "A-102",
    role: "RESIDENT",
    status: "ACTIVE",
    lastLoginAt: "2026-11-01T19:40:00Z",
    createdAt: "2026-02-01T14:20:00Z",
  },
  {
    id: "usr-005",
    fullName: "Ramesh Pawar",
    mobileNumber: "+919870998877",
    email: "ramesh.guard@securityagency.in",
    kycStatus: "VERIFIED",
    societyId: "soc-girvasa-apex",
    societyName: "Girvasa Apex Grandeur Society",
    role: "SECURITY_GUARD",
    status: "ACTIVE",
    lastLoginAt: "2026-11-02T06:00:00Z",
    createdAt: "2026-01-15T08:00:00Z",
  },
];

export const DEV_DELETED_USERS: DeletedUserItem[] = [
  {
    id: "usr-del-001",
    fullName: "Amitabh Verma",
    mobileNumber: "+919820556677",
    email: "amitabh.v@exresident.com",
    societyId: "soc-girvasa-apex",
    societyName: "Girvasa Apex Grandeur Society",
    role: "TENANT",
    deletedAt: "2026-10-28T14:30:00Z",
    deletedBy: "Rajesh Sharma (Society Admin)",
    deletionReason: "Tenant tenancy agreement ended; flat vacated.",
    canUndo: true,
  },
  {
    id: "usr-del-002",
    fullName: "Sunil Shinde",
    mobileNumber: "+919833112233",
    email: "sunil.security@agency.com",
    societyId: "soc-girvasa-apex",
    societyName: "Girvasa Apex Grandeur Society",
    role: "SECURITY_GUARD",
    deletedAt: "2026-10-15T09:12:00Z",
    deletedBy: "Platform Super Admin",
    deletionReason: "Security agency staff rotation offboarding.",
    canUndo: true,
  },
  {
    id: "usr-del-003",
    fullName: "Sneha Kulkarni",
    mobileNumber: "+919819887766",
    email: "sneha.k@oldunit.in",
    societyId: "soc-002",
    societyName: "Royal Palms CHS",
    role: "RESIDENT",
    deletedAt: "2026-09-30T17:00:00Z",
    deletedBy: "Secretary (Royal Palms CHS)",
    deletionReason: "Duplicate registration profile created during data migration.",
    canUndo: true,
  },
];

export const DEV_MAINTENANCE_CONFIG: MaintenanceConfig = {
  isMaintenanceMode: false,
  scheduledStart: "2026-11-15T02:00:00+05:30",
  scheduledEnd: "2026-11-15T04:30:00+05:30",
  title: "Scheduled Core Database & Cloud Infrastructure Maintenance",
  bannerMessage: "Girvasa Society OS will undergo scheduled performance optimization on Sunday, Nov 15 between 02:00 AM and 04:30 AM IST. Mobile app Gate pass services will operate in offline buffer mode.",
  allowAdminBypass: true,
  affectedServices: ["Web Portal", "Mobile API", "Automated Billing Runs", "PG Webhooks"],
};

export const DEV_PAYMENT_GATEWAY: PaymentGatewayConfig = {
  activeProvider: "RAZORPAY",
  keyId: "rzp_live_8F1h92kLmPxQ",
  keySecretMasked: "sec_live_99A••••••••••••••••33bK",
  webhookSecretMasked: "whsec_live_••••••••••••••••91Qx",
  testMode: false,
  autoSettlement: true,
  settlementUtrPrefix: "GRV-SETTLE",
};

export const DEV_SOCIETY_BANK_ACCOUNTS: SocietyBankAccountItem[] = [
  {
    societyId: "soc-girvasa-apex",
    societyName: "Girvasa Apex Grandeur Society",
    accountNumberMasked: "••••••••••4821",
    rawAccountNumber: "50200049284821",
    ifscCode: "HDFC0000128",
    bankName: "HDFC Bank Ltd",
    branchName: "Bandra Kurla Complex, Mumbai",
    accountHolderName: "GIRVASA APEX GRANDEUR COOP HSG SOC LTD",
    verificationStatus: "VERIFIED",
    lastVerifiedAt: "2026-01-10T12:00:00Z",
  },
  {
    societyId: "soc-002",
    societyName: "Royal Palms CHS",
    accountNumberMasked: "••••••••••9104",
    rawAccountNumber: "000210400009104",
    ifscCode: "ICIC0000002",
    bankName: "ICICI Bank Ltd",
    branchName: "Shivaji Nagar, Pune",
    accountHolderName: "ROYAL PALMS CO-OP HOUSING SOCIETY",
    verificationStatus: "VERIFIED",
    lastVerifiedAt: "2026-02-20T15:30:00Z",
  },
  {
    societyId: "soc-003",
    societyName: "Sea Green Towers CHS",
    accountNumberMasked: "••••••••••3391",
    rawAccountNumber: "918020048123391",
    ifscCode: "UTIB0000248",
    bankName: "Axis Bank Ltd",
    branchName: "Marine Drive, Mumbai",
    accountHolderName: "SEA GREEN TOWERS MAINTENANCE A/C",
    verificationStatus: "PENDING_PENNY_DROP",
  },
];

export const DEV_SUBSCRIPTION_RATES: SubscriptionRateItem[] = [
  {
    planCode: "FREE_TRIAL",
    planName: "14-Day Full Feature Trial",
    ratePerUnitPaise: 0,
    flatFeePaise: 0,
    billingCyclesSupported: ["MONTHLY"],
    annualDiscountPercent: 0,
    trialDays: 14,
    features: ["Full ERP Access", "Gate OS Tablet", "Up to 300 Units", "Complimentary DLT SMS"],
    activeSocietiesCount: 8,
  },
  {
    planCode: "STARTER",
    planName: "Girvasa Starter (Small Societies)",
    ratePerUnitPaise: 1500,
    flatFeePaise: 99900,
    billingCyclesSupported: ["MONTHLY", "ANNUAL"],
    annualDiscountPercent: 15,
    trialDays: 14,
    features: ["Core Accounts & Invoicing", "Resident App", "Complaints & Notices", "Standard Email Support"],
    activeSocietiesCount: 22,
  },
  {
    planCode: "GROWTH_300",
    planName: "Girvasa Growth Suite",
    ratePerUnitPaise: 2000,
    flatFeePaise: 199900,
    billingCyclesSupported: ["MONTHLY", "QUARTERLY", "ANNUAL"],
    annualDiscountPercent: 20,
    trialDays: 14,
    features: ["Full Gate OS with Guard Tablet", "Automated WhatsApp Invoices", "Amenity Booking", "Priority 24/7 Helpline"],
    activeSocietiesCount: 45,
  },
  {
    planCode: "ENTERPRISE",
    planName: "Girvasa Enterprise & Apex Federations",
    ratePerUnitPaise: 2500,
    flatFeePaise: 499900,
    billingCyclesSupported: ["ANNUAL"],
    annualDiscountPercent: 25,
    trialDays: 30,
    features: ["Multi-Society Apex Federation Console", "Dedicated Database Tenant", "Custom ERP Export Integrations", "Dedicated Account Manager"],
    activeSocietiesCount: 14,
  },
];

export const DEV_API_KEY_INTEGRATIONS: ApiKeyIntegrationItem[] = [
  {
    keyName: "Google Maps Platform Geocoding & Places",
    service: "GOOGLE_MAPS",
    maskedKey: "AIzaSyD9xK••••••••••••••••M7Lp0",
    lastRotatedAt: "2026-08-15T00:00:00Z",
    status: "ACTIVE",
  },
  {
    keyName: "WhatsApp Cloud API Production Token (Meta)",
    service: "META_WHATSAPP",
    maskedKey: "EAAGz••••••••••••••••ZDZD",
    lastRotatedAt: "2026-10-01T00:00:00Z",
    status: "ACTIVE",
    expiresAt: "2027-10-01T00:00:00Z",
  },
  {
    keyName: "AWS S3 Document Vault Master IAM",
    service: "AWS_S3",
    maskedKey: "AKIAIOSFODNN7EXAMPLE",
    lastRotatedAt: "2026-05-10T00:00:00Z",
    status: "ACTIVE",
  },
  {
    keyName: "Kaleyra High-Volume OTP Fallback Gateway",
    service: "KALEYRA_SMS",
    maskedKey: "kal_sec_891••••••••••••10x",
    lastRotatedAt: "2026-03-20T00:00:00Z",
    status: "ACTIVE",
  },
];

export const DEV_SOCIETIES_LIFECYCLE: SocietyLifecycleItem[] = [
  {
    id: "soc-girvasa-apex",
    name: "Girvasa Apex Grandeur Society",
    code: "GIR-001",
    city: "Mumbai",
    state: "Maharashtra",
    totalUnits: 128,
    status: "ACTIVE",
    planCode: "ENTERPRISE",
    primaryAdminUserId: "usr-002",
    primaryAdminName: "Rajesh Sharma",
    primaryAdminMobile: "+919820011223",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "soc-002",
    name: "Royal Palms CHS",
    code: "SOC-002",
    city: "Pune",
    state: "Maharashtra",
    totalUnits: 96,
    status: "ACTIVE",
    planCode: "GROWTH_300",
    primaryAdminUserId: "usr-008",
    primaryAdminName: "Sanjay Deshmukh",
    primaryAdminMobile: "+919822001122",
    createdAt: "2026-02-15T00:00:00Z",
  },
  {
    id: "soc-003",
    name: "Sea Green Towers CHS",
    code: "SOC-003",
    city: "Mumbai",
    state: "Maharashtra",
    totalUnits: 64,
    status: "SUSPENDED",
    planCode: "STARTER",
    primaryAdminUserId: "usr-009",
    primaryAdminName: "Kailash Agarwal",
    primaryAdminMobile: "+919820334455",
    suspensionReason: "Commercial subscription payment overdue by 65 days. Managing committee notified.",
    createdAt: "2026-03-01T00:00:00Z",
  },
];

export const DEV_PENDING_APPROVALS: PendingApprovalItem[] = [
  {
    id: "appr-001",
    actionType: "PAYMENT_GATEWAY_CHANGE",
    title: "Switch Production Payment Gateway to Cashfree",
    description: "Proposed by Co-Admin Devendra to configure Cashfree secondary gateway route.",
    proposedByAdminId: "usr-superadmin-002",
    proposedByAdminName: "Devendra Patil (Co-Admin)",
    proposedAt: "2026-11-02T14:30:00Z",
    payload: { provider: "CASHFREE", keyId: "CF_LIVE_9981248" },
    status: "PENDING",
  },
  {
    id: "appr-002",
    actionType: "SUBSCRIPTION_RATE_CHANGE",
    title: "Update Starter Plan Pricing to ₹16/unit/month",
    description: "Annual inflation index revision adjustment (+₹1.00/unit/month).",
    proposedByAdminId: "usr-superadmin-002",
    proposedByAdminName: "Devendra Patil (Co-Admin)",
    proposedAt: "2026-11-01T11:00:00Z",
    payload: { planCode: "STARTER", newRatePaise: 1600 },
    status: "PENDING",
  },
  {
    id: "appr-003",
    actionType: "SOCIETY_BANK_OVERRIDE",
    title: "Verify HDFC Bank Account for Royal Palms CHS",
    description: "Penny drop succeeded via IMPS reference RRN 412948218491.",
    proposedByAdminId: "usr-superadmin-001",
    proposedByAdminName: "Platform Super Admin",
    proposedAt: "2026-10-30T16:15:00Z",
    payload: { societyId: "soc-002", ifsc: "HDFC0000128" },
    status: "APPROVED",
    reviewedByAdminName: "Sunita Rao (Compliance Lead)",
    reviewedAt: "2026-10-31T09:00:00Z",
  },
];

export const DEV_UNRECONCILED_TXNS: UnreconciledTransactionItem[] = [
  {
    id: "unrec-001",
    transactionId: "pay_N9k28aLmPx91",
    gatewayReference: "BANK-RRN-9948218491",
    societyId: "soc-girvasa-apex",
    societyName: "Girvasa Apex Grandeur Society",
    unitNumber: "A-502",
    residentName: "Anil Kapoor",
    amountPaise: 425000,
    status: "GATEWAY_SUCCESS_UNALLOCATED",
    createdAt: "2026-11-02T11:20:00Z",
  },
  {
    id: "unrec-002",
    transactionId: "pay_M8x19bQzLk74",
    gatewayReference: "UPI-RRN-1184920491",
    societyId: "soc-002",
    societyName: "Royal Palms CHS",
    unitNumber: "B-201",
    residentName: "Priya Nair",
    amountPaise: 280000,
    status: "PENDING_WEBHOOK",
    createdAt: "2026-11-02T09:45:00Z",
  },
];

export const DEV_BACKGROUND_JOBS: BackgroundJobItem[] = [
  {
    jobId: "job-billing-monthly",
    jobName: "Automated Society Monthly Maintenance Billing Generation",
    scheduleCron: "0 0 1 * * (1st of month at midnight)",
    lastRunAt: "2026-11-01T00:00:00Z",
    nextRunAt: "2026-12-01T00:00:00Z",
    status: "COMPLETED",
    recordsProcessed: 288,
  },
  {
    jobId: "job-interest-accrual",
    jobName: "Overdue Dues Late Fee Interest Accrual Engine",
    scheduleCron: "0 2 * * * (Daily at 02:00 AM IST)",
    lastRunAt: "2026-11-02T02:00:00Z",
    nextRunAt: "2026-11-03T02:00:00Z",
    status: "COMPLETED",
    recordsProcessed: 14,
  },
  {
    jobId: "job-sms-quota-reset",
    jobName: "DLT SMS Daily Consumption Quota Reset",
    scheduleCron: "0 0 * * * (Daily at 00:00 AM IST)",
    lastRunAt: "2026-11-02T00:00:00Z",
    nextRunAt: "2026-11-03T00:00:00Z",
    status: "COMPLETED",
    recordsProcessed: 3,
  },
  {
    jobId: "job-visitor-pass-purge",
    jobName: "Expired Gate Pass Buffer Archival & ANPR Cache Cleanup",
    scheduleCron: "0 4 * * 0 (Weekly Sunday at 04:00 AM IST)",
    lastRunAt: "2026-11-01T04:00:00Z",
    nextRunAt: "2026-11-08T04:00:00Z",
    status: "COMPLETED",
    recordsProcessed: 420,
  },
];

/**
 * Route handler for mock fallback responses
 */
export function getDevMockResponse<T>(endpoint: string, options: any = {}): T | undefined {


  const cleanEndpoint = endpoint.split("?")[0];
  const method = (options.method || "GET").toUpperCase();

  // Auth: Request OTP
  if (cleanEndpoint === "/auth/otp/request" && method === "POST") {
    let body: any = {};
    try {
      body = options.body ? JSON.parse(options.body) : {};
    } catch {
      // ignore
    }
    const mobile = body.mobileNumber || "+919876543210";
    return {
      requestId: "dev-challenge-superadmin",
      challengeId: "dev-challenge-superadmin",
      expiresInSeconds: 300,
      resendAfterSeconds: 45,
      message: `Verification code sent to ${mobile}. For Super Admin test login, use code: 123456`,
    } as unknown as T;
  }

  // Auth: Verify OTP
  if (cleanEndpoint === "/auth/otp/verify" && method === "POST") {
    let body: any = {};
    try {
      body = options.body ? JSON.parse(options.body) : {};
    } catch {
      // ignore
    }
    const mobile = body.mobileNumber || "+919876543210";
    return {
      accessToken: "girvasa_dev_super_admin_access_token_jwt",
      refreshToken: "girvasa_dev_super_admin_refresh_token_jwt",
      expiresInSeconds: 86400,
      user: {
        id: "usr-superadmin-001",
        mobileNumber: mobile,
        status: "ACTIVE",
      },
    } as unknown as T;
  }

  // Auth: Current User (/auth/me)
  if (cleanEndpoint === "/auth/me") {
    return DEV_SUPER_ADMIN_USER as unknown as T;
  }

  // Auth: Logout
  if (cleanEndpoint === "/auth/logout" && method === "POST") {
    return { message: "Logged out successfully" } as unknown as T;
  }

  // Tenant: User Societies
  if (cleanEndpoint === "/auth/societies") {
    return DEV_SOCIETIES as unknown as T;
  }

  // Tenant: Current Society Context
  if (cleanEndpoint === "/societies/current") {
    return DEV_CURRENT_SOCIETY as unknown as T;
  }

  // Dashboard: Executive Summary
  if (cleanEndpoint === "/reports/analytics/dashboard") {
    return DEV_EXECUTIVE_DASHBOARD as unknown as T;
  }

  // Reports: Accounting Summary
  if (cleanEndpoint === "/reports/accounting/summary") {
    return {
      totalIncome: 1250000,
      totalExpenses: 840000,
      netSurplus: 410000,
      bankBalance: 2450000,
    } as unknown as T;
  }

  // Billing: Bills
  if (cleanEndpoint === "/billing/bills") {
    return DEV_BILLS as unknown as T;
  }

  // Visitors: Visits
  if (cleanEndpoint === "/visits") {
    return DEV_VISITS as unknown as T;
  }

  // Complaints: Complaints
  if (cleanEndpoint === "/complaints") {
    return DEV_COMPLAINTS as unknown as T;
  }

  // Structure: Units
  if (cleanEndpoint === "/units") {
    return DEV_UNITS as unknown as T;
  }

  // Structure: Buildings
  if (cleanEndpoint === "/buildings") {
    return DEV_BUILDINGS as unknown as T;
  }

  // Platform Watch Metrics
  if (cleanEndpoint === "/platform/metrics") {
    return DEV_PLATFORM_WATCH as unknown as T;
  }

  // Subscription: Onboarding Progress
  if (cleanEndpoint === "/societies/current/onboarding") {
    return DEV_ONBOARDING_PROGRESS as unknown as T;
  }

  // Subscription: Current Subscription
  if (cleanEndpoint === "/societies/current/subscription") {
    return DEV_SUBSCRIPTION as unknown as T;
  }

  // Audit Events
  if (cleanEndpoint === "/audit/events") {
    return {
      content: [
        {
          id: "aud-001",
          societyId: "soc-girvasa-apex",
          actorId: "usr-superadmin-001",
          actorName: "Platform Super Admin",
          action: "LOGIN",
          resourceType: "AUTH_SESSION",
          resourceId: "usr-superadmin-001",
          timestamp: new Date().toISOString(),
          status: "SUCCESS",
          details: { channel: "SMS", mfaVerified: true },
        },
      ],
      totalElements: 1,
      totalPages: 1,
    } as unknown as T;
  }

  // Platform Super Admin Console Endpoints
  if (cleanEndpoint === "/platform/admin/app-versions") {

    return DEV_APP_VERSIONS as unknown as T;
  }
  if (cleanEndpoint === "/platform/admin/feature-flags") {
    return DEV_FEATURE_FLAGS as unknown as T;
  }
  if (cleanEndpoint.startsWith("/platform/admin/feature-flags/") && method === "PATCH") {
    const key = cleanEndpoint.replace("/platform/admin/feature-flags/", "");
    const flag = DEV_FEATURE_FLAGS.find((f) => f.key === key) || DEV_FEATURE_FLAGS[0];
    return { ...flag, enabledGlobal: !flag.enabledGlobal } as unknown as T;
  }
  if (cleanEndpoint === "/platform/admin/sms-gateway") {
    return DEV_SMS_GATEWAY as unknown as T;
  }
  if (cleanEndpoint === "/platform/admin/broadcast-notification" && method === "POST") {
    return { success: true, deliveredCount: 488 } as unknown as T;
  }
  if (cleanEndpoint === "/platform/admin/users") {
    return DEV_PLATFORM_USERS as unknown as T;
  }
  if (cleanEndpoint === "/platform/admin/users/deleted") {
    return DEV_DELETED_USERS as unknown as T;
  }
  if (cleanEndpoint.match(/\/platform\/admin\/users\/[^/]+\/restore/) && method === "POST") {
    return { success: true, message: "User successfully restored with society membership re-established." } as unknown as T;
  }
  if (cleanEndpoint.match(/\/platform\/admin\/users\/[^/]+\/revoke-sessions/) && method === "POST") {
    return { success: true, message: "All active user JWT tokens invalidated on web and mobile." } as unknown as T;
  }
  if (cleanEndpoint.match(/\/platform\/admin\/users\/[^/]+\/update/) && method === "PATCH") {
    return { ...DEV_PLATFORM_USERS[1], fullName: "Updated User Name" } as unknown as T;
  }
  if (cleanEndpoint === "/platform/admin/maintenance") {
    return DEV_MAINTENANCE_CONFIG as unknown as T;
  }
  if (cleanEndpoint === "/platform/admin/payment-gateway") {
    return DEV_PAYMENT_GATEWAY as unknown as T;
  }
  if (cleanEndpoint === "/platform/admin/bank-accounts") {
    return DEV_SOCIETY_BANK_ACCOUNTS as unknown as T;
  }
  if (cleanEndpoint.match(/\/platform\/admin\/bank-accounts\/[^/]+\/override/) && method === "POST") {
    return { ...DEV_SOCIETY_BANK_ACCOUNTS[2], verificationStatus: "VERIFIED" } as unknown as T;
  }
  if (cleanEndpoint === "/platform/admin/subscription-rates") {
    return DEV_SUBSCRIPTION_RATES as unknown as T;
  }
  if (cleanEndpoint === "/platform/admin/api-keys") {
    return DEV_API_KEY_INTEGRATIONS as unknown as T;
  }
  if (cleanEndpoint === "/platform/admin/societies/lifecycle") {
    return DEV_SOCIETIES_LIFECYCLE as unknown as T;
  }
  if (cleanEndpoint.match(/\/platform\/admin\/societies\/[^/]+\/status/) && method === "PATCH") {
    return { success: true, message: "Society status successfully updated." } as unknown as T;
  }
  if (cleanEndpoint.match(/\/platform\/admin\/societies\/[^/]+\/reassign-admin/) && method === "POST") {
    return { success: true, message: "Primary Society Admin role reassigned successfully." } as unknown as T;
  }
  if (cleanEndpoint === "/platform/admin/approvals") {
    return DEV_PENDING_APPROVALS as unknown as T;
  }
  if (cleanEndpoint.match(/\/platform\/admin\/approvals\/[^/]+\/approve/) && method === "POST") {
    return { success: true, message: "Request approved and executed via Dual-Control protocol." } as unknown as T;
  }
  if (cleanEndpoint.match(/\/platform\/admin\/approvals\/[^/]+\/reject/) && method === "POST") {
    return { success: true, message: "Request rejected." } as unknown as T;
  }
  if (cleanEndpoint === "/platform/admin/reconcile") {
    return DEV_UNRECONCILED_TXNS as unknown as T;
  }
  if (cleanEndpoint.match(/\/platform\/admin\/reconcile\/[^/]+\/force/) && method === "POST") {
    return { success: true, message: "Payment reconciled and credited to unit ledger." } as unknown as T;
  }
  if (cleanEndpoint === "/platform/admin/jobs") {
    return DEV_BACKGROUND_JOBS as unknown as T;
  }
  if (cleanEndpoint.match(/\/platform\/admin\/jobs\/[^/]+\/trigger/) && method === "POST") {
    return { success: true, message: "Scheduled job triggered and executing in background." } as unknown as T;
  }
  if (cleanEndpoint.match(/\/platform\/admin\/impersonate\/[^/]+/) && method === "POST") {
    return {
      success: true,
      impersonationToken: "girvasa_impersonation_jwt_token_sample",
      message: "Impersonation session established. Navigating to tenant view...",
    } as unknown as T;
  }
  if (cleanEndpoint === "/platform/admin/impersonate/exit" && method === "POST") {
    return { success: true, message: "Exited impersonation. Restored Platform Super Admin session." } as unknown as T;
  }

  // Generic fallback for list endpoints


  if (
    cleanEndpoint.startsWith("/amenities") ||
    cleanEndpoint.startsWith("/amenity-bookings") ||
    cleanEndpoint.startsWith("/notices") ||
    cleanEndpoint.startsWith("/events") ||
    cleanEndpoint.startsWith("/polls") ||
    cleanEndpoint.startsWith("/documents") ||
    cleanEndpoint.startsWith("/staff") ||
    cleanEndpoint.startsWith("/vendors") ||
    cleanEndpoint.startsWith("/parking") ||
    cleanEndpoint.startsWith("/members") ||
    cleanEndpoint.startsWith("/join-requests")
  ) {
    return [] as unknown as T;
  }

  return undefined;
}
