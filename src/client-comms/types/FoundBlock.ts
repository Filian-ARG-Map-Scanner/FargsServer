import { DimEnum } from '../../utils/types';

export default class FoundBlock {
  blockId: string;
  dimension: DimEnum;
  x: number;
  y: number;
  z: number;
  constructor(blockId: string, dimension: DimEnum, x: number, y: number) {
    this.blockId = blockId;
    this.dimension = dimension;
    this.x = x;
    this.y = y;
    this.z = y;
  }
}
