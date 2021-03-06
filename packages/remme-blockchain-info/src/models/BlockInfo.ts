export interface IBlockInfo {
    blockNum: number;
    timestamp: number;
    previousHeaderSignature: string;
    headerSignature: string;
    signerPublicKey: string;
}

export interface IBlockInfoResponse {
    block_number: number;
    timestamp: number;
    previous_header_signature: string;
    header_signature: string;
    signer_public_key: string;
}

export class BlockInfo implements IBlockInfo {
    public blockNum: number;
    public timestamp: number;
    public previousHeaderSignature: string;
    public headerSignature: string;
    public signerPublicKey: string;

    constructor(data: IBlockInfoResponse) {
        this.blockNum = data.block_number;
        this.timestamp = data.timestamp;
        this.previousHeaderSignature = data.previous_header_signature;
        this.headerSignature = data.header_signature;
        this.signerPublicKey = data.signer_public_key;
    }
}
