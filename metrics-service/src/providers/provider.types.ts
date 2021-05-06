import {IPoint} from "influx";

export type ProviderFunction = (meta: any) => Promise<IPoint[]>;
