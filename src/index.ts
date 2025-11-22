import dotenv from 'dotenv';
dotenv.config();

import 'colors';
import alphaClient from "./lib/alphaClient";
import octopusClient from "./lib/octopusClient";
import getNewDischargeSchedule from './lib/dischargeSchedule';
import cron from 'node-cron';
import dayjs from 'dayjs';

const main = async () => {

  console.log(`Starting discharge schedule update process... ${dayjs()}`.green);

  const octopusKrakenToken = await octopusClient.obtainKrakenToken();
  console.log(`Obtained Octopus Kraken token: ${octopusKrakenToken.substring(0, 10)}...`);

  const chargeSchedules = await octopusClient.getFlexPlannedDispatches(octopusKrakenToken);
  console.log('Current car charge schedules', chargeSchedules);

  if(chargeSchedules.length === 0) {
    console.log('No octopus car charge schedules'.yellow);
  }
  
  const currentDischargeSchedule = await alphaClient.getDischargeConfigInfo();
  console.log('Current battery discharge schedule', currentDischargeSchedule);

  const newDischargeSchedule = getNewDischargeSchedule(chargeSchedules, currentDischargeSchedule);
  console.log('New planned battery discharge schedule', newDischargeSchedule);

  if(JSON.stringify(newDischargeSchedule) === JSON.stringify(currentDischargeSchedule)) {
    console.log('Discharge battery schedule is up to date, no changes needed.'.green);
    console.log(' ');
    return;
  }

  console.log('Setting new battery discharge schedule.');
  const updateDischargeConfigResponse = await alphaClient.updateDisChargeConfigInfo(newDischargeSchedule);
  console.log(`Discharge battery schedule update response ${updateDischargeConfigResponse.msg}`);

  console.log('Discharge battery schedule update process complete.'.green);
  console.log(' ');
};

main();
cron.schedule('*/5 * * * *', () => {
  main();
});