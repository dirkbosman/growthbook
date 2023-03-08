import {
  InformationSchemaInterface,
  InformationSchemaTablesInterface,
} from "@/../back-end/src/types/Integration";
import { DataSourceInterfaceWithParams } from "@/../back-end/types/datasource";
import React, { useEffect, useState } from "react";
import Collapsible from "react-collapsible";
import { FaAngleDown, FaAngleRight, FaDatabase, FaTable } from "react-icons/fa";
import { useAuth } from "@/services/auth";
import { useSearch } from "@/services/search";
import DatasourceTableData from "./DatasourceTableData";
import LoadingOverlay from "./LoadingOverlay";
import Field from "./Forms/Field";

type Props = {
  datasource: DataSourceInterfaceWithParams;
  informationSchema: InformationSchemaInterface;
};

export default function DatasourceSchema({
  datasource,
  informationSchema,
}: Props) {
  const { apiCall } = useAuth();
  const [
    currentTable,
    setCurrentTable,
  ] = useState<InformationSchemaTablesInterface | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentTable(null);
  }, [datasource]);

  const { items, searchInputProps } = useSearch({
    items: informationSchema.databases || [],
    searchFields: ["databaseName", "schemas"], //MKTODO: Update this so nested search works correctly
    localStorageKey: "datasources",
    defaultSortField: "databaseName",
  });

  if (!datasource || !informationSchema) {
    return <LoadingOverlay />;
  }

  return (
    <div className="d-flex flex-column">
      <div>
        <label className="font-weight-bold mb-1">
          <FaDatabase /> {datasource.name}
        </label>
        <Field placeholder="Search..." type="search" {...searchInputProps} />
        <div
          key="database"
          className="border rounded p-1"
          style={{
            height: "210px",
            overflowY: "scroll",
          }}
        >
          {items.map((database) => {
            return (
              <>
                {database.schemas.map((schema) => {
                  return (
                    <div key={schema.schemaName} className="pb-2">
                      <Collapsible
                        className="pb-1"
                        key={database.databaseName + schema.schemaName}
                        trigger={
                          <>
                            <FaAngleRight />
                            {`${database.databaseName}.${schema.schemaName}`}
                          </>
                        }
                        triggerWhenOpen={
                          <>
                            <FaAngleDown />
                            {`${database.databaseName}.${schema.schemaName}`}
                          </>
                        }
                        triggerStyle={{
                          fontWeight: "bold",
                        }}
                        transitionTime={100}
                      >
                        {schema.tables.map((table) => {
                          return (
                            <div
                              className="pl-3 pb-1"
                              role="button"
                              key={
                                database.databaseName +
                                schema.schemaName +
                                table.tableName
                              }
                              onClick={async () => {
                                try {
                                  setLoading(true);
                                  setCurrentTable(null);
                                  const res = await apiCall<{
                                    status: number;
                                    table?: InformationSchemaTablesInterface;
                                  }>(
                                    `/database/${database.databaseName}/schema/${schema.schemaName}/table/${table.tableName}`,
                                    {
                                      method: "GET",
                                    }
                                  );
                                  console.log("res", res);
                                  setCurrentTable(res.table);
                                  setLoading(false);
                                } catch (e) {
                                  console.log("e", e);
                                }
                              }}
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
      </div>
      <DatasourceTableData table={currentTable} loading={loading} />
    </div>
  );
}
