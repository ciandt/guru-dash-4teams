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
  filter: string;
  customFields: IJiraQueryCustomField[];
}

export interface IJiraQueryCustomField {
  key: string;
  name: string;
  defaultValue?:string
}

export interface IJiraQueryResposeSprint {
  id: number;                        
  name: string;
  state: string;
}