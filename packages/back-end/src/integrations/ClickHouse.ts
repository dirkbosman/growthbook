import { ClickHouse as ClickHouseClient } from "clickhouse";
import { decryptDataSourceParams } from "../services/datasource";
import { ClickHouseConnectionParams } from "../../types/integrations/clickhouse";
import { MetricAggregationType } from "../types/Integration";
import SqlIntegration from "./SqlIntegration";

export default class ClickHouse extends SqlIntegration {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  params: ClickHouseConnectionParams;
  setParams(encryptedParams: string) {
    this.params = decryptDataSourceParams<ClickHouseConnectionParams>(
      encryptedParams
    );

    if (this.params.user) {
      this.params.username = this.params.user;
      delete this.params.user;
    }
    if (this.params.host) {
      this.params.url = this.params.host;
      delete this.params.host;
    }
  }
  getSensitiveParamKeys(): string[] {
    return ["password"];
  }
  async runQuery(sql: string) {
    const client = new ClickHouseClient({
      url: this.params.url,
      port: this.params.port,
      basicAuth: this.params.username
        ? {
            username: this.params.username,
            password: this.params.password,
          }
        : null,
      format: "json",
      debug: false,
      raw: false,
      config: {
        database: this.params.database,
      },
      reqParams: {
        headers: {
          "x-clickhouse-format": "JSON",
        },
      },
    });
    return Array.from(await client.query(sql).toPromise());
  }
  toTimestamp(date: Date) {
    return `toDateTime('${date
      .toISOString()
      .substr(0, 19)
      .replace("T", " ")}')`;
  }
  addTime(
    col: string,
    unit: "hour" | "minute",
    sign: "+" | "-",
    amount: number
  ): string {
    return `date${sign === "+" ? "Add" : "Sub"}(${unit}, ${amount}, ${col})`;
  }
  dateTrunc(col: string) {
    return `dateTrunc('day', ${col})`;
  }
  dateDiff(startCol: string, endCol: string) {
    return `dateDiff('day', ${startCol}, ${endCol})`;
  }
  stddev(col: string) {
    return `stddevSamp(${col})`;
  }
  formatDate(col: string): string {
    return `formatDateTime(${col}, '%F')`;
  }
  ifElse(condition: string, ifTrue: string, ifFalse: string) {
    return `if(${condition}, ${ifTrue}, ${ifFalse})`;
  }
  castToString(col: string): string {
    return `toString(${col})`;
  }
  addPrePostTimeFilter(col: string, timePeriod: MetricAggregationType): string {
    const mcol = `m.timestamp`;
    if (timePeriod === "pre") {
      return `${this.ifElse(
        `${mcol} < d.preexposure_end AND ${mcol} > d.preexposure_start`,
        `${col}`,
        `NULL`
      )}`;
    }
    if (timePeriod === "post") {
      return `${this.ifElse(
        `${mcol} BETWEEN d.conversion_start AND d.conversion_end`,
        `${col}`,
        `NULL`
      )}`;
    }
    return `${col}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userMetricJoin(ignoreConversionEnd: boolean): string {
    // Clickhouse does not support anything other than equality in join condition
    // so we do not join on date and instead use the custom time filter above in
    // addPrePostTimeFilter
    return "";
  }
}
