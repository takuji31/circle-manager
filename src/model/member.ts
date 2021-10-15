import { Circle } from "./circle";
export class Member {
  readonly trainerName: string;
  constructor(
    public readonly id: string,
    public readonly name: string,
    trainerName: string | null,
    public readonly circle: Circle,
    public readonly nextMonthCircle: Circle | null,
    public readonly thisMonthCircle: Circle | null
  ) {
    this.trainerName = trainerName ?? name;
  }
}
