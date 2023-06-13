import type { TestFixture, Page } from '@playwright/test';
import type { WebSocket } from 'ws';
import { WebSocketServer } from 'ws';

import type { AddressCoinBalanceHistoryItem } from 'types/api/address';
import type { NewBlockSocketResponse } from 'types/api/block';
import type { SmartContractVerificationResponse } from 'types/api/contract';
import type { TokenTransfer } from 'types/api/tokenTransfer';
import type { Transaction } from 'types/api/transaction';

import * as app from 'playwright/utils/app';

type ReturnType = () => Promise<WebSocket>;

type Channel = [string, string, string];

export interface SocketServerFixture {
  createSocket: ReturnType;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createSocket: TestFixture<ReturnType, { page: Page}> = async({ page }, use) => {
  const socketServer = new WebSocketServer({ port: app.socketPort });

  const connectionPromise = new Promise<WebSocket>((resolve) => {
    socketServer.on('connection', (socket: WebSocket) => {
      resolve(socket);
    });
  });

  await use(() => connectionPromise);

  socketServer.close();
};

export const joinChannel = async(socket: WebSocket, channelName: string) => {
  return new Promise<[string, string, string]>((resolve, reject) => {
    socket.on('message', (msg) => {
      try {
        const payload = JSON.parse(msg.toString()) as Array<string>;

        if (channelName === payload[2] && payload[3] === 'phx_join') {
          socket.send(JSON.stringify([
            payload[0],
            payload[1],
            payload[2],
            'phx_reply',
            { response: {}, status: 'ok' },
          ]));

          resolve([ payload[0], payload[1], payload[2] ]);
        }
      } catch (error) {
        reject(error);
      }
    });
  });
};

export function sendMessage(socket: WebSocket, channel: Channel, msg: 'coin_balance', payload: { coin_balance: AddressCoinBalanceHistoryItem }): void;
export function sendMessage(socket: WebSocket, channel: Channel, msg: 'token_balance', payload: { block_number: number }): void;
export function sendMessage(socket: WebSocket, channel: Channel, msg: 'transaction', payload: { transaction: number }): void;
export function sendMessage(socket: WebSocket, channel: Channel, msg: 'transaction', payload: { transactions: Array<Transaction> }): void;
export function sendMessage(socket: WebSocket, channel: Channel, msg: 'pending_transaction', payload: { pending_transaction: number }): void;
export function sendMessage(socket: WebSocket, channel: Channel, msg: 'pending_transaction', payload: { pending_transactions: Array<Transaction> }): void;
export function sendMessage(socket: WebSocket, channel: Channel, msg: 'new_block', payload: NewBlockSocketResponse): void;
export function sendMessage(socket: WebSocket, channel: Channel, msg: 'verification_result', payload: SmartContractVerificationResponse): void;
export function sendMessage(socket: WebSocket, channel: Channel, msg: 'total_supply', payload: { total_supply: number}): void;
export function sendMessage(socket: WebSocket, channel: Channel, msg: 'changed_bytecode', payload: Record<string, never>): void;
export function sendMessage(socket: WebSocket, channel: Channel, msg: 'token_transfer', payload: { token_transfers: Array<TokenTransfer> }): void;
export function sendMessage(socket: WebSocket, channel: Channel, msg: string, payload: unknown): void {
  socket.send(JSON.stringify([
    ...channel,
    msg,
    payload,
  ]));
}
