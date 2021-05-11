export interface IJiraMetadata {
    user: string;
    key: string;
    url: string;
    apiVersion: string;
    queries: IJiraQuery[]; 
}

export interface IJiraQuery {
  name: string;
  type: string;
  description: string;
  jql: string;
}