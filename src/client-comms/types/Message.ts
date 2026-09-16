import FoundBlock from './FoundBlock';
import { MessageType } from './MessageType';
import { DimEnum } from '../../utils/types';

type Satisfies<T, U extends T> = U;

export type MessagesToContentMap = Satisfies<
  Record<MessageType, unknown>,
  {
    [MessageType.INIT]: string;
    [MessageType.REGION_REQUEST]: DimEnum;
    [MessageType.DISCONNECT]: undefined;
    [MessageType.SCAN_RESULT]: {
      x: number;
      z: number;
      index: number;
      data: FoundBlock[];
    };
    [MessageType.REGION_REQUEST_RESPONSE]: {
      x: number;
      z: number;
      width: number;
      index: number;
      isResume: boolean;
    };
    [MessageType.BLACKLIST]: { [key in DimEnum]: string[] };
    [MessageType.UPDATE_AVAILABLE]: string;
    [MessageType.REGION_COMPLETE]: undefined;
    [MessageType.DIMENSION_COMPLETE]: undefined;
  }
>;
//
// type MessageT = {
//   [K in keyof MessagesToContentMap]: {
//     from: string;
//     type: K;
//   } & MessagesToContentMap[K];
// }[keyof MessagesToContentMap];

export class Message<T extends keyof MessagesToContentMap> {
  from: string;
  type: T;
  data: MessagesToContentMap[T];

  constructor(type: T, data: MessagesToContentMap[T], from: string);
  constructor(type: T, data: MessagesToContentMap[T]);
  constructor(type: T, data: MessagesToContentMap[T], from?: string) {
    this.from = from !== undefined ? from : 'server';
    this.type = type;
    this.data = data;
  }
}
