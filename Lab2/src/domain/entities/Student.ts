import { ActivityType } from "../enums/ActivityType";
import { DisciplineType } from "../enums/DisciplineType";
import { DomainError } from "../errors/DomainError";

export class Student {
  public readonly id: string;
  public readonly name: string;
  public hasComputer: boolean;
  public hasLaptop: boolean;

  private passedWorksByDiscipline: Map<DisciplineType, Set<ActivityType>> = new Map();

  constructor(id: string, name: string, hasComputer: boolean, hasLaptop: boolean) {
    this.id = id;
    this.name = name;
    this.hasComputer = hasComputer;
    this.hasLaptop = hasLaptop;
  }

  hasDeviceForStudy(): boolean {
    return this.hasComputer || this.hasLaptop;
  }

  passWork(discipline: DisciplineType, workType: ActivityType): void {
    if (workType !== ActivityType.LAB && workType !== ActivityType.CP) {
      throw new DomainError(
        `Активність ${workType} не вважається семестровою роботою для допуску.`
      );
    }

    if (!this.passedWorksByDiscipline.has(discipline)) {
      this.passedWorksByDiscipline.set(discipline, new Set<ActivityType>());
    }

    this.passedWorksByDiscipline.get(discipline)!.add(workType);
  }

  hasRequiredSemesterWorks(discipline: DisciplineType): boolean {
    const works = this.passedWorksByDiscipline.get(discipline);
    if (!works) return false;
    return works.has(ActivityType.LAB) || works.has(ActivityType.CP);
  }
}