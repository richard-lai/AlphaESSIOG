type FlexPlannedDispatchType = {
    start: Date;
    end: Date;
    type: string;
    energyAddedKwh: string
}

type FlexPlannedDispatchTypes = {
    flexPlannedDispatches: FlexPlannedDispatchType[];
}

export { FlexPlannedDispatchType as FlexPlannedDispatchType, FlexPlannedDispatchTypes as flexPlannedDispatchTypes};