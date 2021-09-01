import { logger } from '../../shared/logger';
import axios from 'axios';

export async function getQuery(headers:any, url: string){
    const res = await axios.get(url, headers);
    return res;
}