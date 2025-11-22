import GraphDataType from '../types/octopusTypes';
import { FlexPlannedDispatchType, flexPlannedDispatchTypes } from '../types/flexPlannedDispatchTypes';
import ObtainKrakenTokenType from '../types/krakenTokenTypes';

const GRAPH_URL = process.env.OCTO_GRAPH_URL as string;
const API_KEY = process.env.OCTO_API_KEY;
const DEVICE_ID = process.env.OCTO_HYPERVOLT_DEVICE_ID;

async function postGraphQL<T>(query: string, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `${token}`;
  
  const res = await fetch(GRAPH_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });

  const json = await res.json() as GraphDataType<T>;

  if (!res.ok || json.errors) {
    const err = new Error(`GraphQL error: ${JSON.stringify(json.errors || json)}`);
    // @ts-ignore
    err.details = json;
    throw err;
  }

  return json.data as T;
}

export async function obtainKrakenToken(apiKey = API_KEY) : Promise<string> {
  if (!apiKey) throw new Error('OCTO API key is not provided (OCTO_API_KEY)');

  const mutation = `mutation ObtainKrakenToken {  obtainKrakenToken(input: { APIKey: \"${apiKey}\" }) {    token  }}`;

  const data = await postGraphQL<ObtainKrakenTokenType>(mutation);
  return data?.obtainKrakenToken?.token;
}

export async function getFlexPlannedDispatches(token: string, deviceId = DEVICE_ID) : Promise<FlexPlannedDispatchType[]> {
  if (!deviceId) throw new Error('Device id not provided (OCTO_HYPERVOLT_DEVICE_ID)');

  const query = `query Devices {  flexPlannedDispatches(deviceId: \"${deviceId}\") {    start    end    type    energyAddedKwh  }}`;

  const data = await postGraphQL<flexPlannedDispatchTypes>(query, token);
  return data?.flexPlannedDispatches;
}

export default { obtainKrakenToken, getFlexPlannedDispatches };
