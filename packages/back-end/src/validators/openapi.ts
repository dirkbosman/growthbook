/* eslint-disable */
/**
* This file was auto-generated. DO NOT MODIFY DIRECTLY
* Instead, modify the source OpenAPI schema in back-end/src/api/openapi
* and run `yarn generate-api-types` to re-generate this file.
*/
import { z } from "zod";

export const listFeaturesValidator = {
  bodySchema: z.never(),
  querySchema: z.object({"limit":z.coerce.number().int().default(10),"offset":z.coerce.number().int().optional(),"projectId":z.string().optional()}).strict(),
  paramsSchema: z.never(),
};

export const getFeatureValidator = {
  bodySchema: z.never(),
  querySchema: z.never(),
  paramsSchema: z.object({"id":z.string()}).strict(),
};

export const toggleFeatureValidator = {
  bodySchema: z.object({"reason":z.string().optional(),"environments":z.record(z.union([z.literal(true),z.literal(false),z.literal("true"),z.literal("false"),z.literal("1"),z.literal("0"),z.literal(1),z.literal(0),z.literal("")]))}).strict(),
  querySchema: z.never(),
  paramsSchema: z.object({"id":z.string()}).strict(),
};

export const listProjectsValidator = {
  bodySchema: z.never(),
  querySchema: z.object({"limit":z.coerce.number().int().default(10),"offset":z.coerce.number().int().optional()}).strict(),
  paramsSchema: z.never(),
};

export const getProjectValidator = {
  bodySchema: z.never(),
  querySchema: z.never(),
  paramsSchema: z.object({"id":z.string()}).strict(),
};

export const listDimensionsValidator = {
  bodySchema: z.never(),
  querySchema: z.object({"limit":z.coerce.number().int().default(10),"offset":z.coerce.number().int().optional(),"datasourceId":z.string().optional()}).strict(),
  paramsSchema: z.never(),
};

export const getDimensionValidator = {
  bodySchema: z.never(),
  querySchema: z.never(),
  paramsSchema: z.object({"id":z.string()}).strict(),
};

export const listSegmentsValidator = {
  bodySchema: z.never(),
  querySchema: z.object({"limit":z.coerce.number().int().default(10),"offset":z.coerce.number().int().optional(),"datasourceId":z.string().optional()}).strict(),
  paramsSchema: z.never(),
};

export const getSegmentValidator = {
  bodySchema: z.never(),
  querySchema: z.never(),
  paramsSchema: z.object({"id":z.string()}).strict(),
};

export const listSdkConnectionsValidator = {
  bodySchema: z.never(),
  querySchema: z.object({"limit":z.coerce.number().int().default(10),"offset":z.coerce.number().int().optional(),"projectId":z.string().optional(),"withProxy":z.string().optional()}).strict(),
  paramsSchema: z.never(),
};

export const getSdkConnectionValidator = {
  bodySchema: z.never(),
  querySchema: z.never(),
  paramsSchema: z.object({"id":z.string()}).strict(),
};

export const listDataSourcesValidator = {
  bodySchema: z.never(),
  querySchema: z.object({"limit":z.coerce.number().int().default(10),"offset":z.coerce.number().int().optional(),"projectId":z.string().optional()}).strict(),
  paramsSchema: z.never(),
};

export const getDataSourceValidator = {
  bodySchema: z.never(),
  querySchema: z.never(),
  paramsSchema: z.object({"id":z.string()}).strict(),
};

export const listExperimentsValidator = {
  bodySchema: z.never(),
  querySchema: z.object({"limit":z.coerce.number().int().default(10),"offset":z.coerce.number().int().optional(),"projectId":z.string().optional(),"datasourceId":z.string().optional(),"experimentId":z.string().optional()}).strict(),
  paramsSchema: z.never(),
};

export const getExperimentValidator = {
  bodySchema: z.never(),
  querySchema: z.never(),
  paramsSchema: z.object({"id":z.string()}).strict(),
};

export const getExperimentResultsValidator = {
  bodySchema: z.never(),
  querySchema: z.object({"phase":z.string().optional(),"dimension":z.string().optional()}).strict(),
  paramsSchema: z.object({"id":z.string()}).strict(),
};

export const listMetricsValidator = {
  bodySchema: z.never(),
  querySchema: z.object({"limit":z.coerce.number().int().default(10),"offset":z.coerce.number().int().optional(),"projectId":z.string().optional(),"datasourceId":z.string().optional()}).strict(),
  paramsSchema: z.never(),
};

export const postMetricValidator = {
  bodySchema: z.object({"datasourceId":z.string().describe("ID for the [DataSource](#tag/DataSource_model)"),"name":z.string().describe("Name of the metric"),"description":z.string().describe("Description of the metric").optional(),"owner":z.string().describe("Name of the person who owns this metric").optional(),"type":z.enum(["binomial","count","duration","revenue"]).describe("Type of metric. See [Metrics documentation](/app/metrics)"),"tags":z.array(z.string()).describe("List of tags").optional(),"projects":z.array(z.string()).describe("List of project IDs for projects that can access this metric").optional(),"behavior":z.object({"goal":z.enum(["increase","decrease"]),"cap":z.number().describe("This should be non-negative"),"conversionWindowStart":z.number().describe("The [Conversion Delay](/app/metrics#conversion-delay), in hours"),"conversionWindowEnd":z.number().describe("The [Conversion Window](/app/metrics#conversion-window), in hours"),"riskThresholdSuccess":z.number(),"riskThresholdDanger":z.number(),"minPercentChange":z.number().describe("Minimum percent change to consider uplift significant, as a proportion (e.g. put 0.5 for 50%)"),"maxPercentChange":z.number().describe("Maximum percent change to consider uplift significant, as a proportion (e.g. put 0.5 for 50%)"),"minSampleSize":z.number()}).optional(),"sql":z.object({"identifierTypes":z.array(z.string()).describe("The [Identifier Types](/app/datasources#identifier-types) in your Data Source that are available for this metric"),"conversionSQL":z.string().describe("The main SQL to retrieve your metric"),"userAggregationSQL":z.string().describe("Custom user level aggregation for your metric (default: SUM(value))").optional(),"denominatorMetricId":z.string().describe("The metric ID for a [denominator metric for funnel and ratio metrics](/app/metrics#denominator-ratio--funnel-metrics)").optional(),"builder":z.object({"identifierTypeColumns":z.array(z.object({"identifierType":z.string(),"columnName":z.string()})),"tableName":z.string(),"valueColumnName":z.string().optional(),"timestampColumnName":z.string(),"conditions":z.array(z.object({"column":z.string(),"operator":z.string(),"value":z.string()})).optional()}).describe("An alternative way to specify your metric to a full query. Using the top-level `sql.conversionSql` and `sql.identifierTypes` is preferred.").optional()}).optional(),"mixpanel":z.object({"eventName":z.string(),"eventValue":z.string(),"userAggregation":z.string(),"conditions":z.array(z.object({"property":z.string(),"operator":z.string(),"value":z.string()}))}).describe("Only use for MixPanel (non-SQL) Data Sources. If providing this field, omit `sql`.").optional()}).strict(),
  querySchema: z.never(),
  paramsSchema: z.never(),
};

export const getMetricValidator = {
  bodySchema: z.never(),
  querySchema: z.never(),
  paramsSchema: z.object({"id":z.string()}).strict(),
};

export const listVisualChangesetsValidator = {
  bodySchema: z.never(),
  querySchema: z.never(),
  paramsSchema: z.object({"id":z.string()}).strict(),
};

export const getVisualChangesetValidator = {
  bodySchema: z.never(),
  querySchema: z.never(),
  paramsSchema: z.object({"id":z.string()}).strict(),
};