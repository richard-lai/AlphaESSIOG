import { createHash } from 'node:crypto'
import DischargeConfigType from '../types/dischargeConfigTypes';

const ALPHA_URL = process.env.ALPHA_OPEN_URL as string;
const APP_ID = process.env.ALPHA_APP_ID as string;
const APP_SCRET = process.env.ALPHA_APP_SECRET as string;
const SN = process.env.ALPHA_SN;

const alphaSecureHeader = (): Record<string, string> => {
    const unixTimeStamp = Math.floor(Date.now() / 1000).toString();
    const sign = `${APP_ID}${APP_SCRET}${unixTimeStamp}`;
    const sha512Sign = createHash('sha512').update(sign).digest('hex');

    const headers: Record<string, string> = { 'appId': APP_ID, 'timestamp': unixTimeStamp, 'sign': sha512Sign };
    return headers;
}

const getDischargeConfigInfo = async (): Promise<DischargeConfigType> => {
    const headers = alphaSecureHeader();
    const res = await fetch(`${ALPHA_URL}/getDisChargeConfigInfo?sysSn=${SN}`, {
        method: 'GET',
        headers,
    });

    const json = await res.json() as alphaResponse<DischargeConfigType>;

    if (!res.ok || json.msg !== 'Success') {
        const err = new Error(`Alpha getDisChargeConfigInfo error: ${JSON.stringify(json.msg || json)}`);
        // @ts-ignore
        err.details = json;
        throw err;
    }

    return json.data as DischargeConfigType;
}

const updateDisChargeConfigInfo = async (dischargeConfig: DischargeConfigType): Promise<alphaResponse<any>> => {
    const headers = alphaSecureHeader();
    headers['Content-Type'] = 'application/json';

    const res = await fetch(`${ALPHA_URL}/updateDisChargeConfigInfo`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            ...dischargeConfig,
            sysSn: SN
        }),
    });

    const json = await res.json() as alphaResponse<any>;

    if (!res.ok || json.msg !== 'Success') {
        const err = new Error(`Alpha updateDisChargeConfigInfo error: ${JSON.stringify(json.msg || json)}`);
        // @ts-ignore
        err.details = json;
        throw err;
    }

    return json;
}

export default { getDischargeConfigInfo, updateDisChargeConfigInfo };