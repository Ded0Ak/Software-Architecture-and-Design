import { ActivityType } from "../enums/ActivityType";
import { Teacher } from "./Teacher";

export class Activity {
  public readonly type: ActivityType;
  private teachers: Teacher[] = [];

  constructor(type: ActivityType, teachers: Teacher[] = []) {
    this.type = type;
    this.teachers = [...teachers];
  }

  getTeachers(): Teacher[] {
    return [...this.teachers];
  }

  setTeachers(teachers: Teacher[]): void {
    this.teachers = [...teachers];
  }
}