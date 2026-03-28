export interface CarbonEmission {
  id: string;
  userId: string;
  source: EmissionSource;
  category: EmissionCategory;
  amount: number; // kg CO2e
  unit: string;
  description: string;
  location?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export enum EmissionSource {
  ELECTRICITY = 'electricity',
  GAS = 'gas',
  TRANSPORTATION = 'transportation',
  TRAVEL = 'travel',
  FOOD = 'food',
  WASTE = 'waste',
  WATER = 'water',
  MANUFACTURING = 'manufacturing',
  DIGITAL = 'digital',
  OTHER = 'other'
}

export enum EmissionCategory {
  SCOPE1 = 'scope1', // Direct emissions
  SCOPE2 = 'scope2', // Indirect emissions from electricity
  SCOPE3 = 'scope3'  // Other indirect emissions
}

export interface CarbonCalculator {
  id: string;
  name: string;
  source: EmissionSource;
  factors: EmissionFactor[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmissionFactor {
  id: string;
  source: string;
  value: number; // kg CO2e per unit
  unit: string;
  region?: string;
  year?: number;
  sourceType: EmissionSource;
  description?: string;
  lastUpdated: Date;
  certification?: string;
}

export interface SustainabilityMetric {
  id: string;
  userId: string;
  metricType: MetricType;
  value: number;
  unit: string;
  target?: number;
  period: MetricPeriod;
  date: Date;
  trend: MetricTrend;
  createdAt: Date;
  updatedAt: Date;
}

export enum MetricType {
  CARBON_FOOTPRINT = 'carbon_footprint',
  ENERGY_CONSUMPTION = 'energy_consumption',
  WATER_USAGE = 'water_usage',
  WASTE_GENERATED = 'waste_generated',
  RENEWABLE_ENERGY_PERCENTAGE = 'renewable_energy_percentage',
  CARBON_INTENSITY = 'carbon_intensity',
  SUSTAINABILITY_SCORE = 'sustainability_score',
  OFFSET_COVERAGE = 'offset_coverage'
}

export enum MetricPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export enum MetricTrend {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable',
  UNKNOWN = 'unknown'
}

export interface CarbonOffset {
  id: string;
  userId: string;
  provider: OffsetProvider;
  projectId: string;
  projectName: string;
  amount: number; // kg CO2e
  price: number; // USD
  currency: string;
  type: OffsetType;
  certification: string;
  location: string;
  vintage: number;
  status: OffsetStatus;
  purchasedAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export enum OffsetProvider {
  NATURE_CONSERVANCY = 'nature_conservancy',
  CLIMATEWORKS = 'climateworks',
  GOLD_STANDARD = 'gold_standard',
  VERRA = 'verra',
  AMERICAN_CARBON_REGISTRY = 'american_carbon_registry',
  CARBON_CREDIT_CAPITAL = 'carbon_credit_capital',
  SOUTH_POLE = 'south_pole',
  COTAP = 'cotap',
  PLANET = 'planet',
  OTHER = 'other'
}

export enum OffsetType {
  REFORESTATION = 'reforestation',
  RENEWABLE_ENERGY = 'renewable_energy',
  ENERGY_EFFICIENCY = 'energy_efficiency',
  METHANE_CAPTURE = 'methane_capture',
  CARBON_CAPTURE = 'carbon_capture',
  BIOCHAR = 'biochar',
  SOIL_CARBON = 'soil_carbon',
  BLUE_CARBON = 'blue_carbon',
  OTHER = 'other'
}

export enum OffsetStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  RETIRED = 'retired'
}

export interface CarbonCredit {
  id: string;
  serialNumber: string;
  amount: number; // kg CO2e
  price: number; // USD per kg CO2e
  currency: string;
  provider: OffsetProvider;
  project: string;
  certification: string;
  vintage: number;
  status: CreditStatus;
  listedAt: Date;
  soldAt?: Date;
  metadata?: Record<string, any>;
}

export enum CreditStatus {
  AVAILABLE = 'available',
  PENDING = 'pending',
  SOLD = 'sold',
  RETIRED = 'retired',
  CANCELLED = 'cancelled'
}

export interface ImpactReport {
  id: string;
  userId: string;
  title: string;
  description?: string;
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  totalEmissions: number;
  totalOffsets: number;
  netEmissions: number;
  reductionPercentage: number;
  metrics: SustainabilityMetric[];
  recommendations: Recommendation[];
  certifications: GreenCertification[];
  generatedAt: Date;
  fileUrl?: string;
  isPublic: boolean;
}

export enum ReportPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  impact: number; // kg CO2e reduction potential
  cost?: number;
  difficulty: DifficultyLevel;
  timeframe: string;
  category: EmissionCategory;
  priority: Priority;
  isCompleted: boolean;
  completedAt?: Date;
}

export enum RecommendationType {
  ENERGY_EFFICIENCY = 'energy_efficiency',
  RENEWABLE_ENERGY = 'renewable_energy',
  TRANSPORTATION = 'transportation',
  WASTE_REDUCTION = 'waste_reduction',
  WATER_CONSERVATION = 'water_conservation',
  SUSTAINABLE_PURCHASING = 'sustainable_purchasing',
  BEHAVIORAL_CHANGE = 'behavioral_change',
  TECHNOLOGY_UPGRADE = 'technology_upgrade'
}

export enum DifficultyLevel {
  EASY = 'easy',
  MODERATE = 'moderate',
  CHALLENGING = 'challenging',
  EXPERT = 'expert'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface GreenCertification {
  id: string;
  userId: string;
  type: CertificationType;
  name: string;
  issuer: string;
  certificateNumber: string;
  issuedAt: Date;
  expiresAt?: Date;
  status: CertificationStatus;
  criteria: CertificationCriteria[];
  documents: CertificationDocument[];
  verifiedAt?: Date;
  metadata?: Record<string, any>;
}

export enum CertificationType {
  LEED = 'leed',
  BREEAM = 'breeam',
  ENERGY_STAR = 'energy_star',
  GREEN_BUILDING = 'green_building',
  CARBON_NEUTRAL = 'carbon_neutral',
  CLIMATE_NEUTRAL = 'climate_neutral',
  NET_ZERO = 'net_zero',
  SCIENCE_BASED_TARGETS = 'science_based_targets',
  ISO_14001 = 'iso_14001',
  ISO_14064 = 'iso_14064',
  GHG_PROTOCOL = 'ghg_protocol',
  OTHER = 'other'
}

export enum CertificationStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked'
}

export interface CertificationCriteria {
  id: string;
  name: string;
  description: string;
  required: boolean;
  achieved: boolean;
  value?: number;
  unit?: string;
  threshold?: number;
}

export interface CertificationDocument {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadedAt: Date;
  verified: boolean;
  verifiedAt?: Date;
}

export enum DocumentType {
  CERTIFICATE = 'certificate',
  REPORT = 'report',
  VERIFICATION = 'verification',
  EVIDENCE = 'evidence',
  OTHER = 'other'
}

export interface SustainabilityGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: GoalType;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  category: EmissionCategory;
  priority: Priority;
  status: GoalStatus;
  milestones: GoalMilestone[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export enum GoalType {
  EMISSION_REDUCTION = 'emission_reduction',
  OFFSET_COVERAGE = 'offset_coverage',
  RENEWABLE_ENERGY = 'renewable_energy',
  ENERGY_EFFICIENCY = 'energy_efficiency',
  WASTE_REDUCTION = 'waste_reduction',
  WATER_REDUCTION = 'water_reduction',
  CARBON_NEUTRALITY = 'carbon_neutrality',
  SUSTAINABILITY_SCORE = 'sustainability_score'
}

export enum GoalStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  ON_TRACK = 'on_track',
  AT_RISK = 'at_risk',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface GoalMilestone {
  id: string;
  title: string;
  description: string;
  target: number;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface CarbonState {
  emissions: CarbonEmission[];
  metrics: SustainabilityMetric[];
  offsets: CarbonOffset[];
  credits: CarbonCredit[];
  reports: ImpactReport[];
  certifications: GreenCertification[];
  goals: SustainabilityGoal[];
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;
}

export interface CarbonFilter {
  source?: EmissionSource;
  category?: EmissionCategory;
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  search?: string;
}

export interface CarbonAnalytics {
  totalEmissions: number;
  totalOffsets: number;
  netEmissions: number;
  emissionTrend: MetricTrend;
  categoryBreakdown: { [category: string]: number };
  sourceBreakdown: { [source: string]: number };
  monthlyTrend: Array<{
    month: string;
    emissions: number;
    offsets: number;
    net: number;
  }>;
  yearOverYearComparison: {
    currentYear: number;
    previousYear: number;
    change: number;
    changePercentage: number;
  };
  reductionProgress: {
    target: number;
    current: number;
    percentage: number;
  };
}

export interface CarbonCalculationRequest {
  source: EmissionSource;
  category: EmissionCategory;
  amount: number;
  unit: string;
  region?: string;
  year?: number;
}

export interface CarbonCalculationResult {
  emissions: number; // kg CO2e
  confidence: number; // 0-1
  methodology: string;
  factors: EmissionFactor[];
  assumptions: string[];
}

export interface MarketplaceListing {
  id: string;
  credit: CarbonCredit;
  seller: string;
  pricePerCredit: number;
  minimumPurchase: number;
  availableAmount: number;
  listingDate: Date;
  expiresAt?: Date;
  terms: string;
  metadata?: Record<string, any>;
}

export interface CarbonTradingTransaction {
  id: string;
  buyer: string;
  seller: string;
  credit: CarbonCredit;
  amount: number;
  price: number;
  currency: string;
  transactionDate: Date;
  status: TransactionStatus;
  blockchainHash?: string;
  metadata?: Record<string, any>;
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface CarbonSettings {
  id: string;
  userId: string;
  defaultRegion: string;
  preferredCurrency: string;
  emissionFactors: EmissionFactor[];
  notifications: NotificationSettings;
  reporting: ReportingSettings;
  privacy: PrivacySettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSettings {
  weeklyReports: boolean;
  monthlyReports: boolean;
  goalReminders: boolean;
  offsetExpiry: boolean;
  certificationExpiry: boolean;
  marketAlerts: boolean;
}

export interface ReportingSettings {
  autoGenerate: boolean;
  frequency: ReportPeriod;
  includeRecommendations: boolean;
  publicReports: boolean;
  recipients: string[];
}

export interface PrivacySettings {
  publicProfile: boolean;
  shareEmissions: boolean;
  shareOffsets: boolean;
  shareGoals: boolean;
  anonymizeData: boolean;
}

export interface CarbonAuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export enum AuditAction {
  EMISSION_ADDED = 'emission_added',
  EMISSION_UPDATED = 'emission_updated',
  EMISSION_DELETED = 'emission_deleted',
  OFFSET_PURCHASED = 'offset_purchased',
  OFFSET_RETIRED = 'offset_retired',
  CREDIT_LISTED = 'credit_listed',
  CREDIT_SOLD = 'credit_sold',
  GOAL_CREATED = 'goal_created',
  GOAL_UPDATED = 'goal_updated',
  GOAL_COMPLETED = 'goal_completed',
  CERTIFICATION_ADDED = 'certification_added',
  REPORT_GENERATED = 'report_generated',
  CALCULATION_PERFORMED = 'calculation_performed',
  SETTINGS_UPDATED = 'settings_updated'
}
