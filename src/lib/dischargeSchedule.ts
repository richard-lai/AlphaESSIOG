import { start } from "repl";
import DischargeConfigType from "../types/dischargeConfigTypes";
import { FlexPlannedDispatchType } from "../types/flexPlannedDispatchTypes";
import dayjs from "dayjs";

const getDischargeSchedule = (allChargeSchedules: FlexPlannedDispatchType[], currentDischargeSchedule: DischargeConfigType): DischargeConfigType => {
    let dischargeStartTime1 = "00:00";
    let dischargeEndTime1 = "00:00";
    let dischargeStartTime2 = "00:00";
    let dischargeEndTime2 = "00:00";

    const chargeSchedules = allChargeSchedules?.filter(schedule => dayjs(schedule.end).isAfter(dayjs()));

    if (chargeSchedules && chargeSchedules.length > 0) {

        const firstSchedule = chargeSchedules[0];
        const lastSchedule = getLastContinuousChargeSlot(chargeSchedules);

        const mergedSchedule = {
            start: firstSchedule.start,
            end: lastSchedule.end
        } as FlexPlannedDispatchType

        const chargeStartTime = getRoundedTimeToNearest15Minutes(mergedSchedule.start, Rounded15Minutes.RoundDown);
        const chargeEndTime = getRoundedTimeToNearest15Minutes(mergedSchedule.end, Rounded15Minutes.RoundUp);

        switch (getStartStopSchedule(mergedSchedule)) {
            case ChargingStartAndEnd.ChargingStartsTodayAndEndsToday:

                console.log('Next car charging schedule is today'.green);

                dischargeStartTime1 = "00:00";
                dischargeEndTime1 = chargeStartTime;

                dischargeStartTime2 = chargeEndTime;
                dischargeEndTime2 = "00:00";

                break;
            case ChargingStartAndEnd.ChargingStartsTodayAndEndsTomorrow:

                console.log('Next car charging schedule is today and ends tomorrow'.green);

                dischargeStartTime1 = chargeEndTime;
                dischargeEndTime1 = chargeStartTime;

                dischargeStartTime2 = "00:00";
                dischargeEndTime2 = "00:00";

                break;
            case ChargingStartAndEnd.ChargingStartsTomorrowAndEndsTomorrow:

                console.log('Next car charging schedule is tomorrow'.yellow);

                dischargeStartTime1 = "00:00";
                dischargeEndTime1 = "00:00";
                dischargeStartTime2 = "00:00";
                dischargeEndTime2 = "00:00";

                break;
        }

    }

    return {
        ...currentDischargeSchedule,
        timeDisf1: dischargeStartTime1,
        timeDise1: dischargeEndTime1,
        timeDisf2: dischargeStartTime2,
        timeDise2: dischargeEndTime2,
    };
}

const getRoundedTimeToNearest15Minutes = (scheduleDate: Date, round: Rounded15Minutes): string => {
    let fullDate = dayjs(scheduleDate);
    const minutes = fullDate.minute();
    const roundedMinutes = (round == Rounded15Minutes.RoundUp ? Math.ceil(minutes / 15) : Math.floor(minutes / 15)) * 15;
    return fullDate.set('minute', roundedMinutes).format('HH:mm');
}

const getLastContinuousChargeSlot = (chargeSchedules: FlexPlannedDispatchType[]): FlexPlannedDispatchType => {
    let brokenSlot = false;
    let currentSlotIndex = 0;
    let thisChargeSlot: FlexPlannedDispatchType;
    let nextChargeSlot: FlexPlannedDispatchType;
    let finalContinuousChargeSlot = chargeSchedules[0];

    while (!brokenSlot && (currentSlotIndex + 1) < chargeSchedules.length) {

        thisChargeSlot = chargeSchedules[currentSlotIndex];
        nextChargeSlot = chargeSchedules[currentSlotIndex + 1];
        if (dayjs(thisChargeSlot.end).diff(dayjs(nextChargeSlot.start), 'minute') === 0) {
            finalContinuousChargeSlot = nextChargeSlot;
        } else {
            brokenSlot = true;
        }

        currentSlotIndex++;
    }

    return finalContinuousChargeSlot;
}

const isChargeSlotToday = (chargeSlot: Date): boolean => {
    const now = dayjs();
    const chargeDay = dayjs(chargeSlot);

    return now.isSame(chargeDay, 'day');
}

const getStartStopSchedule = (chargingSchedule: FlexPlannedDispatchType): ChargingStartAndEnd => {
    if (isChargeSlotToday(chargingSchedule.start) && isChargeSlotToday(chargingSchedule.end)) {
        return ChargingStartAndEnd.ChargingStartsTodayAndEndsToday;
    } else if (isChargeSlotToday(chargingSchedule.start) && !isChargeSlotToday(chargingSchedule.end)) {
        return ChargingStartAndEnd.ChargingStartsTodayAndEndsTomorrow;
    } else {
        return ChargingStartAndEnd.ChargingStartsTomorrowAndEndsTomorrow;
    }

}

enum ChargingStartAndEnd {
    ChargingStartsTodayAndEndsToday,
    ChargingStartsTodayAndEndsTomorrow,
    ChargingStartsTomorrowAndEndsTomorrow
}

enum Rounded15Minutes {
    RoundUp, RoundDown
}


export default getDischargeSchedule;