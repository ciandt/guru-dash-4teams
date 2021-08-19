import { logger } from '../../shared/logger';
import axios from 'axios';

export async function getQuery(headers:any, url: string){
    //logger.info(`Executing GET: ${url}`);
    const res = await axios.get(url, headers);
    return res;
}