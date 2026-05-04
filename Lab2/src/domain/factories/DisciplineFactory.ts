import { Discipline } from "../entities/Discipline";
import { Group } from "../entities/Group";
import { Subgroup } from "../entities/Subgroup";
import { DisciplineType } from "../enums/DisciplineType";

export abstract class DisciplineFactory {
  public createDiscipline(
    type: DisciplineType,
    group: Group,
    subgroups: Subgroup[]
  ): Discipline {
    const activities = this.createActivities(type);
    return new Discipline(type, this.getTotalHours(), group, subgroups, activities);
  }

  protected abstract createActivities(type: DisciplineType): any[];
  protected getTotalHours(): number {
    return 96;
  }
}