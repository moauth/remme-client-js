import * as forge from "node-forge";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { ITransactionResponse } from "./interface";
import { BatchStateUpdateDto } from "./models";

declare global {
    interface Window {
        WebSocket: any;
    }
}

let WS;
if (typeof window !== "undefined" && window.WebSocket !== "undefined") {
    WS = window.WebSocket;
} else {
    WS = W3CWebSocket;
}

declare module "node-forge" {
    export namespace pki {
        function certificationRequestToPem(cert: Certificate, maxline?: number): PEM;
        function certificationRequestFromPem(pem: PEM, computeHash?: boolean, strict?: boolean): Certificate;
        function createCertificationRequest(): Certificate;
    }
}

class BaseTransactionResponse implements ITransactionResponse {
    public batchId: string;
    private _socket: any;
    private _socketAddress: string;

    public constructor(socketAddress: string) {
        this._socketAddress = `ws://${socketAddress}/ws`;
    }

    public connectToWebSocket(callback: any): void {
        if (this._socket) {
            this.closeWebSocket();
        }
        this._socket = new WS(this._socketAddress);
        this._socket.onopen = () => {
            this._socket.send(this.getSocketQuery());
        };
        this._socket.onmessage = (e) => {
            const response: BatchStateUpdateDto = JSON.parse(e.data);
            if (response.type === "message" && Object.getOwnPropertyNames(response.data).length !== 0) {
                callback(null, response.data.batch_statuses);
            }
        };
        this._socket.onerror = (err) => {
            callback(err);
        };
    }

    public closeWebSocket(): void {
        if (!this._socket) {
            throw new Error("WebSocket is not running");
        }
        this._socket.send(this.getSocketQuery(false));
        this._socket.close();
        this._socket = null;
    }

    private getSocketQuery(subscribe: boolean = true): string {
        const query = {
            type: "request",
            action: subscribe ? "subscribe" : "unsubscribe",
            entity: "batch_state",
            id: Math.random() * 1000,
            parameters: {
                batch_ids: [
                    this.batchId,
                ],
            },
        };
        return JSON.stringify(query);
    }
}

export {
    forge,
    BaseTransactionResponse,
};
