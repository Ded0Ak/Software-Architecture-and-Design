import * as readline from "readline";
import { Activity } from "../domain/entities/Activity";
import { Discipline } from "../domain/entities/Discipline";
import { Group } from "../domain/entities/Group";
import { Student } from "../domain/entities/Student";
import { Subgroup } from "../domain/entities/Subgroup";
import { Teacher } from "../domain/entities/Teacher";
import { ActivityType } from "../domain/enums/ActivityType";
import { DisciplineType } from "../domain/enums/DisciplineType";
import { ScheduleService } from "../domain/services/ScheduleService";
import { UniversityDisciplineFactory } from "../domain/factories/UniversityDisciplineFactory";

import { Observer } from "../domain/observer/Observer";
import { Subscription } from "../domain/observer/Subscription";
import {
  ActivitiesChangedEvent,
  ActivityTeachersChangedEvent,
  AdmissionChangedEvent,
  WorkSubmittedEvent,
} from "../domain/events/DisciplineEvents";

type GroupBundle = {
  students: Student[];
  group: Group;
  subgroupA: Subgroup;
  subgroupB: Subgroup;
};

function ask(rl: readline.Interface, q: string): Promise<string> {
  return new Promise((resolve) => rl.question(q, resolve));
}

function getDeviceLabel(s: Student): string {
  const parts: string[] = [];
  if (s.hasComputer) parts.push("ПК");
  if (s.hasLaptop) parts.push("Ноутбук");
  return parts.length ? parts.join("+") : "немає";
}

function printStudents(students: Student[]): void {
  console.log("\nСписок студентів:");
  for (const s of students) {
    console.log(`- ${s.id}: ${s.name} | пристрій: ${getDeviceLabel(s)}`);
  }
}

function printSubgroups(bundle: GroupBundle): void {
  console.log("\nПідгрупи:");
  console.log(`- ${bundle.subgroupA.name}: ${bundle.subgroupA.getStudents().map((s) => s.id).join(", ")}`);
  console.log(`- ${bundle.subgroupB.name}: ${bundle.subgroupB.getStudents().map((s) => s.id).join(", ")}`);
}

function buildStudentsForCourse(course: number): Student[] {
  const students: Student[] = [];
  for (let i = 1; i <= 20; i++) {
    const hasComputer = i <= 10;
    const hasLaptop = i > 10;
    students.push(new Student(`C${course}S${i}`, `Студент ${course}-${i}`, hasComputer, hasLaptop));
  }
  return students;
}

function buildGroupBundleByCourse(course: number): GroupBundle {
  const students = buildStudentsForCourse(course);
  const group = new Group(`G${course}`, `SE-${course}1`, course, students);
  const subgroupA = new Subgroup(`SG${course}A`, `SE-${course}1-A`, students.slice(0, 10));
  const subgroupB = new Subgroup(`SG${course}B`, `SE-${course}1-B`, students.slice(10, 20));
  return { students, group, subgroupA, subgroupB };
}

function printCurrentState(discipline: Discipline | null, course: number): void {
  if (!discipline) {
    console.log(`\n=== МЕНЮ (курс=${course}, дисципліна=не обрана) ===`);
  } else {
    console.log(`\n=== МЕНЮ (курс=${course}, дисципліна=${discipline.type}) ===`);
  }
}

function disciplineHasActivity(discipline: Discipline, type: ActivityType): boolean {
  return discipline.getActivities().some((a) => a.type === type);
}

function getActivity(discipline: Discipline, type: ActivityType): Activity | undefined {
  return discipline.getActivities().find((a) => a.type === type);
}

function buildSlotKey(discipline: DisciplineType, activity: ActivityType): string {
  return `${discipline}:${activity}`;
}

async function main(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const lecturer = new Teacher("T1", "Іваненко");
  const labTeacher1 = new Teacher("T2", "Петренко");
  const labTeacher2 = new Teacher("T3", "Шевченко");

  const schedule = new ScheduleService();
  const factory = new UniversityDisciplineFactory(lecturer, labTeacher1, labTeacher2);

  let currentCourse = 1;
  let bundle = buildGroupBundleByCourse(currentCourse);
  let discipline: Discipline | null = null;

  let eventsEnabled = true;

  let admissionSub: Subscription | null = null;
  let activitiesSub: Subscription | null = null;
  let teachersSub: Subscription | null = null;
  let workSub1: Subscription | null = null;
  let workSub2: Subscription | null = null;
  let workSub3: Subscription | null = null;

  const admissionObserver: Observer<AdmissionChangedEvent> = {
    update: (e) => console.log("[ПОДІЯ admissionChanged]:", e),
  };
  const activitiesObserver: Observer<ActivitiesChangedEvent> = {
    update: (e) => console.log("[ПОДІЯ activitiesChanged]:", e),
  };
  const teachersObserver: Observer<ActivityTeachersChangedEvent> = {
    update: (e) => console.log("[ПОДІЯ activityTeachersChanged]:", e),
  };

  class TeacherWorkObserver implements Observer<WorkSubmittedEvent> {
    constructor(private readonly teacher: Teacher, private readonly filter?: ActivityType) {}
    update(event: WorkSubmittedEvent): void {
      if (this.filter && event.activity !== this.filter) return;
      console.log(
        `[СПОВІЩЕННЯ ДЛЯ ${this.teacher.name}]: ${event.studentName} здав(ла) ${event.activity}.`
      );
    }
  }

  function subscribeDisciplineEvents(d: Discipline): void {
    if (!eventsEnabled) return;

    admissionSub = d.onAdmissionChanged(admissionObserver);
    activitiesSub = d.onActivitiesChanged(activitiesObserver);
    teachersSub = d.onActivityTeachersChanged(teachersObserver);

    workSub1 = d.onWorkSubmitted(new TeacherWorkObserver(labTeacher1, ActivityType.LAB));
    workSub2 = d.onWorkSubmitted(new TeacherWorkObserver(labTeacher2, ActivityType.LAB));
    workSub3 = d.onWorkSubmitted(new TeacherWorkObserver(lecturer, ActivityType.CP));
  }

  function clearDisciplineEvents(): void {
    admissionSub?.unsubscribe();
    activitiesSub?.unsubscribe();
    teachersSub?.unsubscribe();
    workSub1?.unsubscribe();
    workSub2?.unsubscribe();
    workSub3?.unsubscribe();
    admissionSub = activitiesSub = teachersSub = workSub1 = workSub2 = workSub3 = null;
  }

  function reserveAllTeachers(d: Discipline): void {
    for (const activity of d.getActivities()) {
      const slotKey = buildSlotKey(d.type, activity.type);
      for (const t of activity.getTeachers()) {
        schedule.assignTeacherToSlot(t, slotKey);
      }
    }
  }

  function releaseAllTeachers(d: Discipline): void {
    for (const activity of d.getActivities()) {
      const slotKey = buildSlotKey(d.type, activity.type);
      for (const t of activity.getTeachers()) {
        schedule.releaseTeacherSlot(t, slotKey);
      }
    }
  }

  let running = true;
  while (running) {
    printCurrentState(discipline, bundle.group.courseYear);

    console.log("1. Показати студентів (з пристроями)");
    console.log("2. Показати підгрупи");
    console.log("3. Обрати/створити дисципліну");
    console.log("4. Здати LAB (за ID)");
    console.log("5. Здати CP (за ID)");
    console.log("6. Перевірити допуск до MT/EX");
    console.log("7. Перевірити автоматичний залік");
    console.log("8. Показати активності дисципліни");
    console.log("9. Змінити склад активностей (додати/прибрати CP)");
    console.log("10. Змінити викладачів для активності");
    console.log("11. Увімкнути/вимкнути сповіщення");
    console.log("12. Змінити курс групи (1/2/3/4)");
    console.log("0. Вихід");

    const cmd = (await ask(rl, "Оберіть дію: ")).trim();

    try {
      switch (cmd) {
        case "1":
          printStudents(bundle.students);
          break;

        case "2":
          printSubgroups(bundle);
          break;

        case "3": {
          const course = bundle.group.courseYear;
          if (course >= 3) {
            console.log("На 3-4 курсі PB/OOP/ADS недоступні.");
            break;
          }

          console.log("\nОберіть дисципліну:");
          console.log("1) PB (лише 1 курс)");
          console.log("2) OOP (1-2 курс)");
          console.log("3) ADS (лише 2 курс)");
          console.log("0) Скасувати");

          const choice = (await ask(rl, "Ваш вибір: ")).trim();
          if (choice === "0") break;

          const map: Record<string, DisciplineType> = {
            "1": DisciplineType.PB,
            "2": DisciplineType.OOP,
            "3": DisciplineType.ADS,
          };

          const type = map[choice];
          if (!type) {
            console.log("Невірний вибір.");
            break;
          }

          if (discipline) {
            releaseAllTeachers(discipline);
            clearDisciplineEvents();
          }

          const created = factory.createDiscipline(type, bundle.group, [bundle.subgroupA, bundle.subgroupB]);
          created.startForGroup();

          reserveAllTeachers(created);

          discipline = created;
          subscribeDisciplineEvents(discipline);

          console.log(`Дисципліну ${type} створено.`);
          break;
        }

        case "4": {
          if (!discipline) break;
          if (!disciplineHasActivity(discipline, ActivityType.LAB)) {
            console.log("LAB відсутня.");
            break;
          }
          const id = (await ask(rl, "ID: ")).trim();
          const student = bundle.students.find((s) => s.id === id);
          if (!student) {
            console.log("Студента не знайдено.");
            break;
          }
          discipline.submitWork(student, ActivityType.LAB);
          console.log("LAB здано.");
          break;
        }

        case "5": {
          if (!discipline) break;
          if (!disciplineHasActivity(discipline, ActivityType.CP)) {
            console.log("CP відсутня.");
            break;
          }
          const id = (await ask(rl, "ID: ")).trim();
          const student = bundle.students.find((s) => s.id === id);
          if (!student) {
            console.log("Студента не знайдено.");
            break;
          }
          discipline.submitWork(student, ActivityType.CP);
          console.log("CP здано.");
          break;
        }

        case "6": {
          if (!discipline) break;
          const id = (await ask(rl, "ID: ")).trim();
          const student = bundle.students.find((s) => s.id === id);
          if (!student) {
            console.log("Студента не знайдено.");
            break;
          }
          const targetRaw = (await ask(rl, "MT/EX: ")).trim().toUpperCase();
          const target = targetRaw === "EX" ? ActivityType.EX : ActivityType.MT;
          const allowed = discipline.checkAdmission(student, target);
          console.log(`Допуск до ${target}: ${allowed ? "ДОЗВОЛЕНО" : "ЗАБОРОНЕНО"}`);
          break;
        }

        case "7":
          if (discipline) {
            console.log(`Автоматичний залік: ${discipline.isPassFailAutomatic() ? "ТАК" : "НІ"}`);
          }
          break;

        case "8":
          if (discipline) {
            const acts = discipline.getActivities().map((a) => a.type);
            console.log("Активності:", acts.join(", "));
          }
          break;

        case "9": {
          if (!discipline) break;

          const current = discipline.getActivities();
          const hasCP = current.some((a) => a.type === ActivityType.CP);

          if (hasCP) {
            const cp = getActivity(discipline, ActivityType.CP)!;
            const slotKey = buildSlotKey(discipline.type, ActivityType.CP);
            for (const t of cp.getTeachers()) {
              schedule.releaseTeacherSlot(t, slotKey);
            }

            const updated = current.filter((a) => a.type !== ActivityType.CP);
            discipline.setActivities(updated);
            console.log("CP прибрано.");
          } else {
            const slotKey = buildSlotKey(discipline.type, ActivityType.CP);
            schedule.assignTeacherToSlot(lecturer, slotKey);

            const updated = [...current, new Activity(ActivityType.CP, [lecturer])];
            discipline.setActivities(updated);
            console.log("CP додано.");
          }
          break;
        }

        case "10": {
          if (!discipline) break;

          console.log("Активність: 1)LEC 2)LAB 3)CP 4)MT 5)EX 6)PF");
          const a = (await ask(rl, "Варіант: ")).trim();
          const map: Record<string, ActivityType> = {
            "1": ActivityType.LEC,
            "2": ActivityType.LAB,
            "3": ActivityType.CP,
            "4": ActivityType.MT,
            "5": ActivityType.EX,
            "6": ActivityType.PF,
          };

          const activityType = map[a];
          if (!activityType) {
            console.log("Невірна активність.");
            break;
          }

          if (!disciplineHasActivity(discipline, activityType)) {
            console.log("Ця активність відсутня.");
            break;
          }

          console.log("Викладачі: 1)T1 2)T2 3)T3 4)T2+T3 5)T1+T2+T3");
          const t = (await ask(rl, "Варіант: ")).trim();
          let teachers: Teacher[] = [];

          if (t === "1") teachers = [lecturer];
          else if (t === "2") teachers = [labTeacher1];
          else if (t === "3") teachers = [labTeacher2];
          else if (t === "4") teachers = [labTeacher1, labTeacher2];
          else if (t === "5") teachers = [lecturer, labTeacher1, labTeacher2];
          else {
            console.log("Невірний варіант.");
            break;
          }

          const activity = getActivity(discipline, activityType)!;
          const oldTeachers = activity.getTeachers();
          const slotKey = buildSlotKey(discipline.type, activityType);

          for (const tOld of oldTeachers) schedule.releaseTeacherSlot(tOld, slotKey);
          try {
            for (const tNew of teachers) schedule.assignTeacherToSlot(tNew, slotKey);
          } catch (e) {
            for (const tOld of oldTeachers) schedule.assignTeacherToSlot(tOld, slotKey);
            throw e;
          }

          discipline.changeTeachersForActivity(activityType, teachers);
          console.log("Викладачів оновлено.");
          break;
        }

        case "11":
          eventsEnabled = !eventsEnabled;
          clearDisciplineEvents();
          if (discipline && eventsEnabled) subscribeDisciplineEvents(discipline);
          console.log(`Сповіщення: ${eventsEnabled ? "УВІМКНЕНО" : "ВИМКНЕНО"}`);
          break;

        case "12": {
          const raw = (await ask(rl, "Курс (1/2/3/4): ")).trim();
          const nextCourse = Number(raw);
          if (![1, 2, 3, 4].includes(nextCourse)) break;

          if (discipline) {
            releaseAllTeachers(discipline);
            clearDisciplineEvents();
          }

          currentCourse = nextCourse;
          bundle = buildGroupBundleByCourse(currentCourse);
          discipline = null;

          console.log(`Курс змінено на ${currentCourse}.`);
          if (currentCourse >= 3) {
            console.log("На 3-4 курсі PB/OOP/ADS недоступні.");
          } else {
            console.log("Можете обрати дисципліну через пункт 3.");
          }
          break;
        }

        case "0":
          running = false;
          break;

        default:
          console.log("Невідома команда.");
      }
    } catch (e) {
      console.log("Помилка:", (e as Error).message);
    }
  }

  rl.close();
}

main().catch((e) => console.error(e));