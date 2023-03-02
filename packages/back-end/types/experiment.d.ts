import { NamespaceValue } from "./feature";

export type ImplementationType = "visual" | "code" | "configuration" | "custom";

export type ExperimentPhaseType = "ramp" | "main" | "holdout";

export type DomChange = {
  selector: string;
  action: "append" | "set" | "remove";
  attribute: string;
  value: string;
};

export interface Screenshot {
  path: string;
  width?: number;
  height?: number;
  description?: string;
}

export interface LegacyVariation extends Variation {
  /** @deprecated */
  css?: string;
  /** @deprecated */
  dom?: DomChange[];
}

export interface Variation {
  id: string;
  name: string;
  description?: string;
  key: string;
  screenshots: Screenshot[];
}

export interface LegacyExperimentPhase extends ExperimentPhase {
  /** @deprecated */
  phase?: ExperimentPhaseType;
  /** @deprecated */
  groups?: string[];
}

export interface ExperimentPhase {
  dateStarted: Date;
  dateEnded?: Date;
  name: string;
  reason: string;
  coverage: number;
  condition: string;
  namespace: NamespaceValue;
  seed?: string;
  variationWeights: number[];
}

export type ExperimentPhaseStringDates = Omit<
  ExperimentPhase,
  "dateStarted" | "dateEnded"
> & {
  dateStarted?: string;
  dateEnded?: string;
};

export type ExperimentStatus = "draft" | "running" | "stopped";

export type AttributionModel = "firstExposure" | "allExposures";

export type ExperimentResultsType = "dnf" | "won" | "lost" | "inconclusive";

export type MetricOverride = {
  id: string;
  conversionWindowHours?: number;
  conversionDelayHours?: number;
  winRisk?: number;
  loseRisk?: number;
};

export interface LegacyExperimentInterface
  extends Omit<ExperimentInterface, "phases" | "variations"> {
  /**
   * @deprecated
   */
  observations?: string;

  variations: LegacyVariation[];
  phases: LegacyExperimentPhase[];
}

export interface ExperimentInterface {
  id: string;
  trackingKey: string;
  organization: string;
  project?: string;
  owner: string;
  datasource: string;
  exposureQueryId: string;
  implementation: ImplementationType;
  /**
   * @deprecated
   */
  userIdType?: "anonymous" | "user";
  hashAttribute: string;
  name: string;
  dateCreated: Date;
  dateUpdated: Date;
  tags: string[];
  description?: string;
  hypothesis?: string;
  metrics: string[];
  metricOverrides?: MetricOverride[];
  guardrails?: string[];
  activationMetric?: string;
  segment?: string;
  queryFilter?: string;
  skipPartialData?: boolean;
  removeMultipleExposures?: boolean;
  attributionModel?: AttributionModel;
  autoAssign: boolean;
  previewURL: string;
  targetURLRegex: string;
  variations: Variation[];
  archived: boolean;
  status: ExperimentStatus;
  phases: ExperimentPhase[];
  results?: ExperimentResultsType;
  winner?: number;
  analysis?: string;
  releasedVariationId: string;
  lastSnapshotAttempt?: Date;
  nextSnapshotAttempt?: Date;
  autoSnapshots: boolean;
  ideaSource?: string;
  visualEditorUrl?: string;
}

export type ExperimentInterfaceStringDates = Omit<
  ExperimentInterface,
  "dateCreated" | "dateUpdated" | "phases"
> & {
  dateCreated: string;
  dateUpdated: string;
  phases: ExperimentPhaseStringDates[];
};

export type Changeset = Partial<ExperimentInterface>;
