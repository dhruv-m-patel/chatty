import { AlcumusPlatformCustomApiItem } from './types';
import axios from 'axios';

export default async function retrieveEntities<
  TData extends AlcumusPlatformCustomApiItem
>({
  route,
  apiKey,
  origin,
}: {
  route: string;
  apiKey: string;
  origin: string;
}): Promise<TData[]> {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      fields: 'all',
      origin: origin,
      Authorization: apiKey,
    },
  };
  const response = await axios.get(route, config);
  if (response.status >= 400) {
    throw new Error('Could not retrieve items');
  }
  return response.data;
}
