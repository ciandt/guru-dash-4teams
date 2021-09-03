export interface IBambooMetadata {
  bambooServer: string;
  user: string;
  key: string;
  projects: IBambooProject[];
}

export interface IBambooProject {
  name: string;
  key: string;
}

export interface IBambooBuild {
  plan: {
    shortName: string;
  };
  buildState: string;
  buildStartedTime: string;
  buildCompletedTime: string;
  projectName: string;
}

export interface IBambooPlanList{
  key: string;
}

export interface IBambooResponse<T> {
  value: T[];
}

export interface IBambooReleaseProjet {
    id: number,
    name: string,
    description: string
}

export interface IBambooRelease {
  deploymentVersionName: string;
  releaseEnvironment: string;
  deploymentState: string;
  startedDate: string;
  finishedDate: string;
}