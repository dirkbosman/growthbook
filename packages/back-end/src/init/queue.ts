import addExperimentResultsJob from "../jobs/updateExperimentResults";
import updateScheduledFeatures from "../jobs/updateScheduledFeatures";
import addWebhooksJob from "../jobs/webhooks";
import addCacheInvalidateJob from "../jobs/cacheInvalidate";
import addMetricUpdateJob from "../jobs/updateMetrics";
import addProxyUpdateJob from "../jobs/proxyUpdate";
import createInformationSchemaJob from "../jobs/createInformationSchema";
import updateInformationSchemaJob from "../jobs/updateInformationSchema";
import { CRON_ENABLED } from "../util/secrets";
import { getAgendaInstance } from "../services/queueing";
import updateStaleInformationSchemaTable from "../jobs/updateStaleInformationSchemaTable";

export async function queueInit() {
  if (!CRON_ENABLED) return;

  const agenda = getAgendaInstance();

  addExperimentResultsJob(agenda);
  updateScheduledFeatures(agenda);
  addMetricUpdateJob(agenda);
  addWebhooksJob(agenda);
  addCacheInvalidateJob(agenda);
  addProxyUpdateJob(agenda);
  createInformationSchemaJob(agenda);
  updateInformationSchemaJob(agenda);
  updateStaleInformationSchemaTable(agenda);

  await agenda.start();
}
