import { ActivityType } from "../enums/ActivityType";
import { DisciplineType } from "../enums/DisciplineType";
import { DomainError } from "../errors/DomainError";
import {
  ActivitiesChangedEvent,
  ActivityTeachersChangedEvent,
  AdmissionChangedEvent,
  WorkSubmittedEvent,
} from "../events/DisciplineEvents";
import { Activity } from "./Activity";
import { Group } from "./Group";
import { Student } from "./Student";
import { Subgroup } from "./Subgroup";
import { Teacher } from "./Teacher";

import { EventSubject } from "../observer/EventSubject";
import { Observer } from "../observer/Observer";
import { Subscription } from "../observer/Subscription";

export class Discipline {
  public readonly type: DisciplineType;
  public readonly totalClassroomHours: number;

  private activities: Map<ActivityType, Activity> = new Map();
  private readonly group: Group;
  private readonly subgroups: Subgroup[];

  private admissionChanged = new EventSubject<AdmissionChangedEvent>();
  private activitiesChanged = new EventSubject<ActivitiesChangedEvent>();
  private activityTeachersChanged = new EventSubject<ActivityTeachersChangedEvent>();
  private workSubmitted = new EventSubject<WorkSubmittedEvent>();

  constructor(
    type: DisciplineType,
    totalClassroomHours: number,
    group: Group,
    subgroups: Subgroup[],
    activities: Activity[]
  ) {
    this.type = type;
    this.totalClassroomHours = totalClassroomHours;
    this.group = group;
    this.subgroups = subgroups;

    this.validateCreationRules(type, totalClassroomHours, group, subgroups, activities);
    activities.forEach((a) => this.activities.set(a.type, a));
  }

  public onAdmissionChanged(observer: Observer<AdmissionChangedEvent>): Subscription {
    return this.admissionChanged.subscribe(observer);
  }

  public onActivitiesChanged(observer: Observer<ActivitiesChangedEvent>): Subscription {
    return this.activitiesChanged.subscribe(observer);
  }

  public onActivityTeachersChanged(
    observer: Observer<ActivityTeachersChangedEvent>
  ): Subscription {
    return this.activityTeachersChanged.subscribe(observer);
  }

  public onWorkSubmitted(observer: Observer<WorkSubmittedEvent>): Subscription {
    return this.workSubmitted.subscribe(observer);
  }

  private validateCreationRules(
    type: DisciplineType,
    totalClassroomHours: number,
    group: Group,
    subgroups: Subgroup[],
    activities: Activity[]
  ): void {
    if (totalClassroomHours < 64) {
      throw new DomainError(`Дисципліна ${type} має містити щонайменше 64 аудиторні години.`);
    }

    if (group.courseYear >= 3) {
      throw new DomainError(`Група ${group.name} (курс ${group.courseYear}) не може вивчати ${type}.`);
    }

    if (type === DisciplineType.PB && group.courseYear !== 1) {
      throw new DomainError(`Основи програмування можна вивчати лише на 1 курсі.`);
    }

    if (type === DisciplineType.ADS && group.courseYear !== 2) {
      throw new DomainError(`Алгоритми та структури даних можна вивчати лише на 2 курсі.`);
    }

    if (type === DisciplineType.OOP && group.courseYear !== 1 && group.courseYear !== 2) {
      throw new DomainError(`ООП можна вивчати лише на 1-2 курсах.`);
    }

    if (group.hasStudiedDiscipline(type)) {
      throw new DomainError(`Дисципліну ${type} уже було вивчено цією групою.`);
    }

    for (const student of group.getStudents()) {
      if (!student.hasDeviceForStudy()) {
        throw new DomainError(
          `Студент ${student.name} не має комп'ютера або ноутбука. Вивчення неможливе.`
        );
      }
    }

    const hasLab = activities.some((a) => a.type === ActivityType.LAB);
    if (hasLab && subgroups.length === 0) {
      throw new DomainError(`Лабораторні активності вимагають наявності підгруп.`);
    }

    const uniqueTeachers = new Set<string>();
    activities.forEach((a) => a.getTeachers().forEach((t) => uniqueTeachers.add(t.id)));

    if (uniqueTeachers.size < 1) {
      throw new DomainError(`Дисципліну має викладати щонайменше один викладач.`);
    }

    const maxTeachers = subgroups.length + 1;
    if (uniqueTeachers.size > maxTeachers) {
      throw new DomainError(
        `Занадто багато викладачів (${uniqueTeachers.size}). Максимально дозволено: ${maxTeachers}.`
      );
    }

    const hasPassFail = activities.some((a) => a.type === ActivityType.PF);
    if (hasPassFail && type !== DisciplineType.PB) {
      throw new DomainError(`Залік дозволений лише для дисципліни Основи програмування.`);
    }
  }

  getActivities(): Activity[] {
    return Array.from(this.activities.values());
  }

  setActivities(newActivities: Activity[]): void {
    const oldActivities = this.getActivities().map((a) => a.type);
    this.activities.clear();
    newActivities.forEach((a) => this.activities.set(a.type, a));

    const payload: ActivitiesChangedEvent = {
      discipline: this.type,
      oldActivities,
      newActivities: newActivities.map((a) => a.type),
    };
    this.activitiesChanged.notify(payload);
  }

  changeTeachersForActivity(activityType: ActivityType, teachers: Teacher[]): void {
    const activity = this.activities.get(activityType);
    if (!activity) {
      throw new DomainError(`Активність ${activityType} відсутня в дисципліні ${this.type}.`);
    }

    const oldTeacherIds = activity.getTeachers().map((t) => t.id);
    activity.setTeachers(teachers);

    const payload: ActivityTeachersChangedEvent = {
      discipline: this.type,
      activity: activityType,
      oldTeacherIds,
      newTeacherIds: teachers.map((t) => t.id),
    };
    this.activityTeachersChanged.notify(payload);
  }

  submitWork(student: Student, workType: ActivityType.LAB | ActivityType.CP): void {
    student.passWork(this.type, workType);

    const payload: WorkSubmittedEvent = {
      discipline: this.type,
      studentId: student.id,
      studentName: student.name,
      activity: workType,
    };

    this.workSubmitted.notify(payload);
  }

  checkAdmission(student: Student, target: ActivityType.MT | ActivityType.EX): boolean {
    const allowed = student.hasRequiredSemesterWorks(this.type);
    const reason = allowed
      ? "Допуск надано: семестрові роботи здано."
      : "Допуск відхилено: немає зданих семестрових робіт.";

    const payload: AdmissionChangedEvent = {
      discipline: this.type,
      studentId: student.id,
      studentName: student.name,
      target,
      isAllowed: allowed,
      reason,
    };

    this.admissionChanged.notify(payload);
    return allowed;
  }

  isPassFailAutomatic(): boolean {
    return this.type === DisciplineType.PB && this.activities.has(ActivityType.PF);
  }

  startForGroup(): void {
    this.group.markDisciplineStudied(this.type);
  }
}