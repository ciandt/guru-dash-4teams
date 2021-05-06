export interface ISonarMetadata {
    key: string;
    url: string;
    projects: string[];
    metrics: string[];
  }

export interface ISonarProjectResponse {
  paging: {
    pageIndex: number;
    pageSize: number;
    total: number;
  };
  components: ISonarProject[]
}

interface ISonarProject {
  id: string;
  organization: string;
  key: string;
  name: string;
  qualifier: string;
  project: string;
}

export interface ISonarMetricResponse {
  metrics: ISonarMetric[];
  total: number;
  p: number;
  ps: number;
}

interface ISonarMetric {
  id: string;
  key: string;
  type: string;
  name: string;
  description: string;
  domain: string;
  directon: number;
  qualitative: boolean;
  hidden: boolean;
  custom: boolean;
}

export interface ISonarMeasureResponse {
  paging: {
    pageIndex: number;
    pageSize: number;
    total: number;
  };
  measures: ISonarMeasure[]
}

export interface ISonarMeasure {
  metric: string;
  history: ISonarMeasureHistory[];
}

interface ISonarMeasureHistory {
  date: string;
  value: string;
}