import {ICustomMetric, IStrapiMetadata} from "./strapi.types";
import axios from "axios";
import {IPoint} from "influx";
import {IDataSource} from "../../shared/common.types";

async function getJWT(): Promise<string> {
  const res = await axios.post(process.env.STRAPI_URL! + '/auth/local', {
    identifier: process.env.STRAPI_USERNAME,
    password: process.env.STRAPI_PASSWORD,
  })

  return res.data.jwt;
}

export async function getDatasources(): Promise<IDataSource[]> {
  const jwt = await getJWT();
  const res = await axios.get<IDataSource[]>(process.env.STRAPI_URL! + '/datasources', {
    headers: {
      authorization: 'Bearer ' + jwt
    }
  });
  return res.data;
}

export async function getStrapiMetrics(metadata: IStrapiMetadata) {
  const jwt = await getJWT();
  const res = await axios.get<ICustomMetric[]>(process.env.STRAPI_URL! + '/custom-metrics', {
    headers: {
      authorization: 'Bearer ' + jwt
    }
  });
  return res.data.map(map);
}

function map(metric: ICustomMetric): IPoint {
  return {
    measurement: metric.name,
    fields: { value: metric.value },
    timestamp: new Date(metric.date),
  }
}
