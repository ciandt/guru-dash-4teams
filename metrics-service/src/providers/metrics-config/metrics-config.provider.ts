import axios from "axios";
import {IDataSource} from "../../shared/common.types";

export async function getDatasources(): Promise<IDataSource[]> {
  const res = await axios.get<IDataSource[]>(process.env.METRICS_CONFIG! + '/api/v1/metrics-config', {});
  return res.data.map((ds: IDataSource) => ({...ds, meta: JSON.parse(ds.meta) }));
}
