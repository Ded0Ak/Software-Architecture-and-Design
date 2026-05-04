import { Activity } from "../entities/Activity";
import { Teacher } from "../entities/Teacher";
import { ActivityType } from "../enums/ActivityType";
import { DisciplineType } from "../enums/DisciplineType";
import { DisciplineFactory } from "./DisciplineFactory";

export class UniversityDisciplineFactory extends DisciplineFactory {
  constructor(
    private readonly lecturer: Teacher,
    private readonly labTeacher1: Teacher,
    private readonly labTeacher2: Teacher
  ) {
    super();
  }

  protected createActivities(type: DisciplineType): Activity[] {
    const base = [
      new Activity(ActivityType.LEC, [this.lecturer]),
      new Activity(ActivityType.LAB, [this.labTeacher1, this.labTeacher2]),
      new Activity(ActivityType.CP, [this.lecturer]),
      new Activity(ActivityType.MT, [this.lecturer]),
      new Activity(ActivityType.EX, [this.lecturer]),
    ];

    if (type === DisciplineType.PB) {
      base.push(new Activity(ActivityType.PF, [this.lecturer]));
    }

    return base;
  }
}