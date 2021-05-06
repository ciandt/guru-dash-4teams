export interface IAzureMetadata {
  organization: string;
  project: string;
  key: string;
  releases: string[]
  bugsQuery: string;
}

export interface IAzureResponse<T> {
  count: number;
  value: T[];
}

export interface IAzureBuild {
  definition: {
    name: string;
  };
  result: string;
  startTime: string;
  finishTime: string;
}

export interface IAzureRelease {
  releaseDefinition: {
    name: string;
  };
  releaseEnvironment: {
    name: string;
  },
  deploymentStatus: string;
  startedOn: string;
  completedOn: string;
}

export interface IAzureWIQLResponse {
  workItems: IWorkItemSummary[];
}

interface IWorkItemSummary {
  id: number;
}

export interface IAzureWorkItem {
  fields: {
    'System.State': string;
    'System.CreatedDate': string;
    'Microsoft.VSTS.Common.ClosedDate': string;
  }
}
