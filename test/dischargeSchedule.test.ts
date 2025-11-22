import getDischargeSchedule from '../src/lib/dischargeSchedule';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { FlexPlannedDispatchType } from '../src/types/flexPlannedDispatchTypes';


const baseDischargeSchedule = {
    ctrDis: 1,
    timeDisf1: '00:00',
    timeDise1: '00:00',
    timeDisf2: '00:00',
    timeDise2: '00:00',
    batUseCap: 11.0,
};

describe('getDischargeSchedule', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns correct discharge schedule when charge starts today and ends tomorrow', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-11-16T12:00:00Z'));

        const chargeSchedules = [
            {
                start: '2025-11-16T21:30:00+00:00',
                end: '2025-11-17T01:30:00+00:00',
                type: 'SMART',
                energyAddedKwh: '-14.00',
            },
        ];

        const result = getDischargeSchedule(chargeSchedules as any, baseDischargeSchedule as any);

        expect(result).toEqual({
            ...baseDischargeSchedule,
            timeDisf1: '01:30',
            timeDise1: '21:30',
            timeDisf2: '00:00',
            timeDise2: '00:00',
        });
    });

    it('returns correct discharge schedule when charge starts today and ends today', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-11-16T01:00:00Z'));

        const chargeSchedules = [
            {
                start: '2025-11-16T01:30:00+00:00',
                end: '2025-11-16T02:00:00+00:00',
                type: 'SMART',
                energyAddedKwh: '-3.50',
            },
        ];

        const result = getDischargeSchedule(chargeSchedules as any, baseDischargeSchedule as any);

        expect(result).toEqual({
            ...baseDischargeSchedule,
            timeDisf1: '00:00',
            timeDise1: '01:30',
            timeDisf2: '02:00',
            timeDise2: '00:00',
        });
    });

    it('returns correct discharge schedule when charge starts and ends tomorrow', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-11-16T12:00:00Z'));

        const chargeSchedules = [
            {
                start: '2025-11-17T01:30:00+00:00',
                end: '2025-11-17T02:00:00+00:00',
                type: 'SMART',
                energyAddedKwh: '-3.50',
            },
        ];

        const result = getDischargeSchedule(chargeSchedules as any, baseDischargeSchedule as any);

        expect(result).toEqual({
            ...baseDischargeSchedule,
            timeDisf1: '00:00',
            timeDise1: '00:00',
            timeDisf2: '00:00',
            timeDise2: '00:00',
        });
    });

    it('returns correct merged discharge schedule when charge starts today and ends today', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-11-16T01:00:00Z'));

        const chargeSchedules = [
            {
                start: '2025-11-16T01:30:00+00:00',
                end: '2025-11-16T02:00:00+00:00',
                type: 'SMART',
                energyAddedKwh: '-3.50',
            },
            {
                start: '2025-11-16T02:00:00+00:00',
                end: '2025-11-16T03:30:00+00:00',
                type: 'SMART',
                energyAddedKwh: '-3.50',
            },
        ];

        const result = getDischargeSchedule(chargeSchedules as any, baseDischargeSchedule as any);

        expect(result).toEqual({
            ...baseDischargeSchedule,
            timeDisf1: '00:00',
            timeDise1: '01:30',
            timeDisf2: '03:30',
            timeDise2: '00:00',
        });
    });


    it('returns correct merged discharge schedule when charge starts today and ends today from actual schedule', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-11-17T01:00:00Z'));

        const chargeSchedules = [
            {
                start: '2025-11-17T02:30:00+00:00',
                end: '2025-11-17T04:00:00+00:00',
                type: 'SMART',
                energyAddedKwh: '-10.50'
            },
            {
                start: '2025-11-17T04:00:00+00:00',
                end: '2025-11-17T04:29:00+00:00',
                type: 'SMART',
                energyAddedKwh: '-0.1656'
            },
        ];

        const result = getDischargeSchedule(chargeSchedules as any, baseDischargeSchedule as any);

        expect(result).toEqual({
            ...baseDischargeSchedule,
            timeDisf1: '00:00',
            timeDise1: '02:30',
            timeDisf2: '04:30',
            timeDise2: '00:00',
        });
    });

    it('returns correct merged discharge schedule when charge starts today and ends tomorrow', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-11-16T12:00:00Z'));

        const chargeSchedules = [
            {
                start: '2025-11-16T21:30:00+00:00',
                end: '2025-11-17T01:30:00+00:00',
                type: 'SMART',
                energyAddedKwh: '-14.00',
            },
            {
                start: '2025-11-17T01:30:00+00:00',
                end: '2025-11-17T03:30:00+00:00',
                type: 'SMART',
                energyAddedKwh: '-14.00',
            },
        ];

        const result = getDischargeSchedule(chargeSchedules as any, baseDischargeSchedule as any);

        expect(result).toEqual({
            ...baseDischargeSchedule,
            timeDisf1: '03:30',
            timeDise1: '21:30',
            timeDisf2: '00:00',
            timeDise2: '00:00',
        });
    });

    it('returns removed discharge schedule when no schedules exist', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-11-16T12:00:00Z'));
        const setDischargeSchedule = {
            ctrDis: 1,
            timeDisf1: '05:00',
            timeDise1: '07:00',
            timeDisf2: '10:00',
            timeDise2: '15:00',
            batUseCap: 11.0,
        };

        const chargeSchedules = [] as FlexPlannedDispatchType[];

        const result = getDischargeSchedule(chargeSchedules as FlexPlannedDispatchType[], setDischargeSchedule as any);

        expect(result).toEqual({
            ...setDischargeSchedule,
            timeDisf1: '00:00',
            timeDise1: '00:00',
            timeDisf2: '00:00',
            timeDise2: '00:00',
        });
    });

    it('returns removed discharge schedule when no schedules which are upcoming', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-11-16T12:00:00Z'));

        const chargeSchedules = [
            {
                start: '2025-11-16T01:30:00+00:00',
                end: '2025-11-16T02:00:00+00:00',
                type: 'SMART',
                energyAddedKwh: '-3.50',
            },
        ];

        const result = getDischargeSchedule(chargeSchedules as any, baseDischargeSchedule as any);

        expect(result).toEqual({
            ...baseDischargeSchedule,
            timeDisf1: '00:00',
            timeDise1: '00:00',
            timeDisf2: '00:00',
            timeDise2: '00:00',
        });
    });

    it('returns correct filtered discharge schedule when charge starts today and ends today but there are old schedules present', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-11-16T02:00:00Z'));

        const chargeSchedules = [
            {
                start: '2025-11-16T01:30:00+00:00',
                end: '2025-11-16T02:00:00+00:00',
                type: 'SMART',
                energyAddedKwh: '-3.50',
            },
            {
                start: '2025-11-16T02:00:00+00:00',
                end: '2025-11-16T03:30:00+00:00',
                type: 'SMART',
                energyAddedKwh: '-3.50',
            },
        ];

        const result = getDischargeSchedule(chargeSchedules as any, baseDischargeSchedule as any);

        expect(result).toEqual({
            ...baseDischargeSchedule,
            timeDisf1: '00:00',
            timeDise1: '02:00',
            timeDisf2: '03:30',
            timeDise2: '00:00',
        });
    });

    it('returns corrected discharge schedule to the nearest 15 minutes', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-11-16T12:00:00Z'));

        const chargeSchedules = [
            {
                start: '2025-11-16T21:25:00+00:00',
                end: '2025-11-17T01:35:00+00:00',
                type: 'SMART',
                energyAddedKwh: '-14.00',
            },
        ];

        const result = getDischargeSchedule(chargeSchedules as any, baseDischargeSchedule as any);

        expect(result).toEqual({
            ...baseDischargeSchedule,
            timeDisf1: '01:45',
            timeDise1: '21:15',
            timeDisf2: '00:00',
            timeDise2: '00:00',
        });
    });

    it('returns corrected discharge schedule to the nearest 15 minutes', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-11-16T12:00:00Z'));

        const chargeSchedules = [
            {
                start: '2025-11-16T21:27:00+00:00',
                end: '2025-11-16T22:40:00+00:00',
                type: 'SMART',
                energyAddedKwh: '-14.00',
            },
        ];

        const result = getDischargeSchedule(chargeSchedules as any, baseDischargeSchedule as any);

        expect(result).toEqual({
            ...baseDischargeSchedule,
            timeDisf1: '00:00',
            timeDise1: '21:15',
            timeDisf2: '22:45',
            timeDise2: '00:00',
        });
    });
});
