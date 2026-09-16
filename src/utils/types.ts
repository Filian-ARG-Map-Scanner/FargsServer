export enum DimEnum {
  OVERWORLD = 'minecraft:overworld',
  END = 'minecraft:the_end',
  NETHER = 'minecraft:the_nether',
}

export class Point {
  x: number;
  z: number;
  constructor(x: number, z: number) {
    this.x = x;
    this.z = z;
  }

  multiply(x: number): this;
  multiply(x: number, y: number): this;
  multiply(x: number, z?: number) {
    this.x *= x;
    if (z !== undefined) {
      this.z *= z;
    } else {
      this.z *= x;
    }
    return this;
  }
}
