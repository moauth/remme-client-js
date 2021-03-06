import { BaseData, BaseHeader, BaseResponse, IBaseResponse } from "./Response";
export interface TransactionHeader extends BaseHeader {
    batcher_public_key: string;
    dependencies: string[];
    family_name: string;
    family_version: string;
    inputs: string[];
    nonce: string;
    outputs: string[];
    payload_sha512: string;
}
export interface TransactionData extends BaseData<TransactionHeader> {
    payload: string;
    transactionProtobuf?: any;
    protobuf?: any;
    transactionType?: string;
}
export declare class TransactionList extends BaseResponse<TransactionData[]> {
    constructor(data: IBaseResponse<TransactionData[]>);
}
export declare class Transaction extends BaseResponse<TransactionData> {
    constructor(data: IBaseResponse<TransactionData>);
}
