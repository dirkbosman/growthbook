export interface ProjectInterface {
  id: string;
  organization: string;
  name: string;
  dateCreated: Date;
  dateUpdated: Date;
  datasources?: string[];
  metrics?: string[];
}
