type alphaResponse<T> = {
    code: number;
    msg: string;
    expMsg: string;
    data: T;
    extra: any;
}