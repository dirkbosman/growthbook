import omit from "lodash/omit";
import z from "zod";
import mongoose from "mongoose";
import uniqid from "uniqid";
import { InformationSchemaTablesInterface } from "../types/Integration";
import { errorStringFromZodResult } from "../util/validation";
import { logger } from "../util/logger";
import { fetchTableData } from "../services/datasource";
import { getPath } from "../util/integrations";
import { usingFileConfig } from "../init/config";
import { getDataSourceById } from "./DataSourceModel";
import {
  getInformationSchemaById,
  updateInformationSchemaById,
} from "./InformationSchemaModel";

const informationSchemaTablesSchema = new mongoose.Schema({
  id: String,
  organization: {
    type: String,
    index: true,
  },
  tableName: String,
  tableSchema: String,
  databaseName: String,
  columns: {
    type: [Object],
    required: true,
    validate: {
      validator(value: unknown) {
        const zodSchema = z.array(
          z.object({
            columnName: z.string(),
            path: z.string(),
            dataType: z.string(),
          })
        );

        const result = zodSchema.safeParse(value);

        if (!result.success) {
          const errorString = errorStringFromZodResult(result);
          logger.error(errorString, "Invalid Columns name");
        }

        return result.success;
      },
    },
  },
  dateCreated: Date,
  dateUpdated: Date,
});

type InformationSchemaTablesDocument = mongoose.Document &
  InformationSchemaTablesInterface;

const InformationSchemaTablesModel = mongoose.model<InformationSchemaTablesDocument>(
  "InformationSchemaTables",
  informationSchemaTablesSchema
);

/**
 * Convert the Mongo document to an InformationSourceInterface, omitting Mongo default fields __v, _id
 * @param doc
 */
const toInterface = (
  doc: InformationSchemaTablesDocument
): InformationSchemaTablesInterface => omit(doc.toJSON(), ["__v", "_id"]);

export async function createInformationSchemaTables(
  tables: InformationSchemaTablesInterface[]
): Promise<InformationSchemaTablesInterface[]> {
  if (usingFileConfig()) {
    throw new Error("Cannot add. Data sources managed by config.yml");
  }

  const results = await InformationSchemaTablesModel.insertMany(tables);

  return results.map(toInterface);
}

export async function createInformationSchemaTable(
  table: InformationSchemaTablesInterface
): Promise<InformationSchemaTablesInterface | null> {
  const result = await InformationSchemaTablesModel.create(table);

  return result ? toInterface(result) : null;
}

export async function getTableDataByPath(
  organization: string,
  databaseName: string,
  schemaName: string,
  tableName: string,
  datasourceId: string
): Promise<InformationSchemaTablesInterface | null> {
  if (usingFileConfig()) {
    throw new Error("Cannot add. Data sources managed by config.yml");
  }

  const table = await InformationSchemaTablesModel.findOne({
    organization,
    databaseName: databaseName,
    tableSchema: schemaName,
    tableName: tableName,
  });

  if (table) {
    // The table exits in the informationSchemaTables collection, so we just need to return it
    return toInterface(table);
  }
  let newTable;

  const datasource = await getDataSourceById(datasourceId, organization);

  if (datasource) {
    // We need to fetch table data from the datasource
    const tableData = await fetchTableData(
      databaseName,
      schemaName,
      tableName,
      datasource
    );
    // If we get the tableData, then we need to create a new document and return it to the user
    if (tableData) {
      newTable = await createInformationSchemaTable({
        id: uniqid("tbl_"),
        organization,
        tableName,
        tableSchema: schemaName,
        databaseName,
        columns: tableData.map(
          (row: { column_name: string; data_type: string }) => {
            return {
              columnName: row.column_name.toLocaleLowerCase(),
              dataType: row.data_type.toLocaleLowerCase(),
              path: getPath(datasource.type, {
                tableCatalog: databaseName,
                tableSchema: schemaName,
                tableName: tableName,
                columnName: row.column_name,
              }),
            };
          }
        ),
        dateCreated: new Date(),
        dateUpdated: new Date(),
      });

      const informationSchema = await getInformationSchemaById(
        organization,
        datasource.settings.informationSchemaId || ""
      );

      if (informationSchema && newTable) {
        const databaseIndex = informationSchema.databases.findIndex(
          (database) => database.databaseName === databaseName
        );

        const schemaIndex = informationSchema.databases[
          databaseIndex
        ].schemas.findIndex((schema) => schema.schemaName === schemaName);

        const tableIndex = informationSchema.databases[databaseIndex].schemas[
          schemaIndex
        ].tables.findIndex((table) => table.tableName === tableName);

        informationSchema.databases[databaseIndex].schemas[schemaIndex].tables[
          tableIndex
        ].id = newTable.id;

        //MKTODO: Optimize this so we're not replacing the entire informationSchema document
        await updateInformationSchemaById(
          organization,
          informationSchema.id,
          informationSchema
        );
      }
    }
  }

  return newTable || null;
}
