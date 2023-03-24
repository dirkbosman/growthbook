import { InformationSchemaInterface } from "@/../back-end/src/types/Integration";
import { DataSourceInterfaceWithParams } from "@/../back-end/types/datasource";
import React, { useEffect, useState } from "react";
import Collapsible from "react-collapsible";
import { FaAngleDown, FaAngleRight, FaTable } from "react-icons/fa";
import { cloneDeep } from "lodash";
import clsx from "clsx";
import { useAuth } from "@/services/auth";
import useApi from "@/hooks/useApi";
import { CursorData } from "../Segments/SegmentForm";
import LoadingSpinner from "../LoadingSpinner";
import SchemaBrowserWrapper from "./SchemaBrowserWrapper";
import RetryInformationSchemaCard from "./RetryInformationSchemaCard";
import PendingInformationSchemaCard from "./PendingInformationSchemaCard";
import BuildInformationSchemaCard from "./BuildInformationSchemaCard";
import DatasourceTableData from "./DatasourceTableData";

type Props = {
  datasource: DataSourceInterfaceWithParams;
  cursorData?: CursorData;
  updateSqlInput?: (sql: string) => void;
};

export default function SchemaBrowser({
  datasource,
  updateSqlInput,
  cursorData,
}: Props) {
  const { data, mutate } = useApi<{
    informationSchema: InformationSchemaInterface;
  }>(`/datasource/${datasource.id}/schema`);

  const informationSchema = data?.informationSchema;

  const { apiCall } = useAuth();
  const [currentTable, setCurrentTable] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const row = cursorData?.row || 0;
  const column = cursorData?.column || 0;
  const inputArray = cursorData?.input || [];

  function pastePathIntoExistingQuery(
    existingQuery: string,
    index: number,
    pathToPaste: string
  ) {
    if (index === existingQuery.length - 1) return existingQuery + pathToPaste;
    return (
      existingQuery.substring(0, index) +
      pathToPaste +
      existingQuery.substring(index)
    );
  }

  const handleTableClick = async (e, path: string, tableId: string) => {
    setError(null);
    if (e.detail === 2) {
      if (!inputArray || !updateSqlInput) return;
      const updatedStr = pastePathIntoExistingQuery(
        inputArray[row] || "",
        column,
        path
      );

      const updatedInputArray = cloneDeep(inputArray);
      updatedInputArray[row] = updatedStr;

      updateSqlInput(updatedInputArray.join("\n"));
    }

    setCurrentTable(tableId);
  };

  useEffect(() => {
    setCurrentTable("");
  }, [datasource]);

  if (!data) return <LoadingSpinner />;

  if (informationSchema?.error?.message) {
    return (
      <SchemaBrowserWrapper
        datasourceName={datasource.name}
        datasourceId={datasource.id}
        informationSchema={informationSchema}
        mutate={mutate}
        setError={setError}
      >
        <RetryInformationSchemaCard
          datasourceId={datasource.id}
          mutate={mutate}
          informationSchema={informationSchema}
        />
      </SchemaBrowserWrapper>
    );
  }

  if (informationSchema?.status === "PENDING") {
    return (
      <SchemaBrowserWrapper
        datasourceName={datasource.name}
        datasourceId={datasource.id}
        informationSchema={informationSchema}
        mutate={mutate}
        setError={setError}
      >
        <PendingInformationSchemaCard mutate={mutate} />
      </SchemaBrowserWrapper>
    );
  }

  return (
    <>
      <SchemaBrowserWrapper
        datasourceName={datasource.name}
        datasourceId={datasource.id}
        informationSchema={informationSchema}
        mutate={mutate}
        setError={setError}
      >
        {!informationSchema || !informationSchema.databases.length ? (
          <BuildInformationSchemaCard
            informationSchema={informationSchema}
            datasourceId={datasource.id}
            mutate={mutate}
          />
        ) : (
          <div
            key="database"
            className="border rounded p-1"
            style={{
              minHeight: "100px",
              maxHeight: "210px",
              overflowY: "scroll",
            }}
          >
            {informationSchema.databases.map((database) => {
              return (
                <>
                  {database.schemas.map((schema) => {
                    return (
                      <div key={schema.schemaName}>
                        <Collapsible
                          className="pb-1"
                          key={database.databaseName + schema.schemaName}
                          onTriggerOpening={async () => {
                            const currentDate = new Date();
                            const dateLastUpdated = new Date(
                              informationSchema.dateUpdated
                            );
                            // To calculate the time difference of two dates
                            const diffInMilliseconds =
                              currentDate.getTime() - dateLastUpdated.getTime();

                            // To calculate the no. of days between two dates
                            const diffInDays = Math.floor(
                              diffInMilliseconds / (1000 * 3600 * 24)
                            );

                            if (diffInDays > 30) {
                              await apiCall<{
                                status: number;
                                message?: string;
                              }>(`/datasource/${datasource.id}/schema`, {
                                method: "PUT",
                                body: JSON.stringify({
                                  informationSchemaId: informationSchema.id,
                                }),
                              });
                            }
                          }}
                          trigger={
                            datasource.type === ("bigquery" || "postgres") ? (
                              <>
                                <FaAngleRight />
                                {`${database.databaseName}.${schema.schemaName}`}
                              </>
                            ) : (
                              <>
                                <FaAngleRight />
                                {`${schema.schemaName}`}
                              </>
                            )
                          }
                          triggerWhenOpen={
                            datasource.type === ("bigquery" || "postgres") ? (
                              <>
                                <FaAngleDown />
                                {`${database.databaseName}.${schema.schemaName}`}
                              </>
                            ) : (
                              <>
                                <FaAngleDown />
                                {`${schema.schemaName}`}
                              </>
                            )
                          }
                          triggerStyle={{
                            fontWeight: "bold",
                          }}
                          transitionTime={100}
                        >
                          {schema.tables.map((table) => {
                            return (
                              <div
                                className={clsx(
                                  table.id === currentTable &&
                                    "bg-light rounded",
                                  "pl-3 py-1"
                                )}
                                style={{ userSelect: "none" }}
                                role="button"
                                key={
                                  database.databaseName +
                                  schema.schemaName +
                                  table.tableName
                                }
                                onClick={async (e) =>
                                  handleTableClick(e, table.path, table.id)
                                }
                              >
                                <FaTable /> {table.tableName}
                              </div>
                            );
                          })}
                        </Collapsible>
                      </div>
                    );
                  })}
                </>
              );
            })}
          </div>
        )}
      </SchemaBrowserWrapper>
      {error && <div className="alert alert-danger mt-2 mb-0">{error}</div>}
      <DatasourceTableData
        tableId={currentTable}
        datasourceId={datasource.id}
        setError={setError}
      />
    </>
  );
}
