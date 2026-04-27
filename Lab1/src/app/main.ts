import * as readline from "readline";
import { Activity } from "../domain/entities/Activity";
import { Discipline } from "../domain/entities/Discipline";
import { Group } from "../domain/entities/Group";
import { Student } from "../domain/entities/Student";
import { Subgroup } from "../domain/entities/Subgroup";
import { Teacher } from "../domain/entities/Teacher";
import { ActivityType } from "../domain/enums/ActivityType";
import { DisciplineType } from "../domain/enums/DisciplineType";

type GroupBundle = {
  students: Student[];
  group: Group;
  subgroupA: Subgroup;
  subgroupB: Subgroup;
};

function ask(rl: readline.Interface, q: string): Promise<string> {
  return new Promise((resolve) => rl.question(q, resolve));
}

function findStudentById(students: Student[], id: string): Student | undefined {
  return students.find((s) => s.id.toLowerCase() === id.toLowerCase());
}

function printStudents(students: Student[]): void {
  console.log("\nСписок студентів:");
  for (const s of students) {
    console.log(`- ${s.id}: ${s.name}`);
  }
}

function isDisciplineAllowedForCourse(type: DisciplineType, course: number): boolean {
  if (course >= 3) return false;
  if (type === DisciplineType.PB) return course === 1;
  if (type === DisciplineType.ADS) return course === 2;
  if (type === DisciplineType.OOP) return course === 1 || course === 2;
  return false;
}

function buildActivitiesForDiscipline(
  disciplineType: DisciplineType,
  lecturer: Teacher,
  labTeacher1: Teacher,
  labTeacher2: Teacher
): Activity[] {
  const base = [
    new Activity(ActivityType.LEC, [lecturer]),
    new Activity(ActivityType.LAB, [labTeacher1, labTeacher2]),
    new Activity(ActivityType.CP, [lecturer]),
    new Activity(ActivityType.MT, [lecturer]),
    new Activity(ActivityType.EX, [lecturer]),
  ];

  if (disciplineType === DisciplineType.PB) {
    base.push(new Activity(ActivityType.PF, [lecturer]));
  }

  return base;
}

function attachDisciplineListeners(discipline: Discipline): void {
  discipline.on("admissionChanged", (e) => console.log("[ПОДІЯ admissionChanged]:", e));
  discipline.on("activitiesChanged", (e) => console.log("[ПОДІЯ activitiesChanged]:", e));
  discipline.on("activityTeachersChanged", (e) =>
    console.log("[ПОДІЯ activityTeachersChanged]:", e)
  );
}

async function chooseDisciplineType(
  rl: readline.Interface,
  course: number
): Promise<DisciplineType | null> {
  if (course >= 3) {
    console.log("\nДля 3-4 курсу дисципліни PB/OOP/ADS недоступні за умовами завдання.");
    return null;
  }

  console.log("\nОберіть дисципліну:");
  console.log("1) PB (лише 1 курс)");
  console.log("2) OOP (1-2 курс)");
  console.log("3) ADS (лише 2 курс)");
  console.log("0) Скасувати");

  const choice = (await ask(rl, "Ваш вибір: ")).trim();
  if (choice === "0") return null;

  let type: DisciplineType | null = null;
  if (choice === "1") type = DisciplineType.PB;
  if (choice === "2") type = DisciplineType.OOP;
  if (choice === "3") type = DisciplineType.ADS;

  if (!type) {
    console.log("Невірний вибір.");
    return null;
  }

  if (!isDisciplineAllowedForCourse(type, course)) {
    console.log("Ця дисципліна недоступна для поточного курсу.");
    return null;
  }

  return type;
}

function buildStudentsForCourse(course: number): Student[] {
  const students: Student[] = [];
  for (let i = 1; i <= 20; i++) {
    students.push(new Student(`C${course}S${i}`, `Студент ${course}-${i}`, true, false));
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
    console.log(`\n МЕНЮ (курс: ${course}, дисципліна: не обрана)`);
  } else {
    console.log(`\n МЕНЮ (курс: ${course}, дисципліна: ${discipline.type})`);
  }
}

async function main(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const lecturer = new Teacher("T1", "Іваненко");
  const labTeacher1 = new Teacher("T2", "Петренко");
  const labTeacher2 = new Teacher("T3", "Шевченко");

  let currentCourse = 1;
  let bundle = buildGroupBundleByCourse(currentCourse);
  let discipline: Discipline | null = null;

  let running = true;
  while (running) {
    printCurrentState(discipline, bundle.group.courseYear);

    console.log("1. Показати студентів");
    console.log("2. Обрати дисципліну");
    console.log("3. Здати LAB (за ID студента)");
    console.log("4. Здати CP (за ID студента)");
    console.log("5. Перевірити допуск до MT/EX (за ID студента)");
    console.log("6. Перевірити автоматичний залік");
    console.log("7. Показати активності дисципліни");
    console.log("8. Змінити курс групи (1/2/3/4)");
    console.log("0. Вихід");

    const cmd = (await ask(rl, "Оберіть дію: ")).trim();

    try {
      switch (cmd) {
        case "1": {
          printStudents(bundle.students);
          break;
        }

        case "2": {
          const type = await chooseDisciplineType(rl, bundle.group.courseYear);
          if (!type) {
            console.log("Створення дисципліни скасовано.");
            break;
          }

          if (discipline) {
            discipline.removeAllListeners();
          }

          const created = new Discipline(
            type,
            96,
            bundle.group,
            [bundle.subgroupA, bundle.subgroupB],
            buildActivitiesForDiscipline(type, lecturer, labTeacher1, labTeacher2)
          );
          created.startForGroup();

          discipline = created;
          attachDisciplineListeners(discipline);

          console.log(
            `Дисципліну ${discipline.type} успішно створено для курсу ${bundle.group.courseYear}.`
          );
          break;
        }

        case "3": {
          if (!discipline) {
            console.log("Спочатку оберіть дисципліну.");
            break;
          }

          const id = (await ask(rl, "Введіть ID студента (наприклад, C1S1): ")).trim();
          const student = findStudentById(bundle.students, id);
          if (!student) {
            console.log("Студента не знайдено.");
            break;
          }

          student.passWork(discipline.type, ActivityType.LAB);
          console.log(`${student.name} здав(ла) LAB.`);
          break;
        }

        case "4": {
          if (!discipline) {
            console.log("Спочатку оберіть дисципліну.");
            break;
          }

          const id = (await ask(rl, "Введіть ID студента (наприклад, C1S1): ")).trim();
          const student = findStudentById(bundle.students, id);
          if (!student) {
            console.log("Студента не знайдено.");
            break;
          }

          student.passWork(discipline.type, ActivityType.CP);
          console.log(`${student.name} здав(ла) CP.`);
          break;
        }

        case "5": {
          if (!discipline) {
            console.log("Спочатку оберіть дисципліну.");
            break;
          }

          const id = (await ask(rl, "Введіть ID студента (наприклад, C1S1): ")).trim();
          const student = findStudentById(bundle.students, id);
          if (!student) {
            console.log("Студента не знайдено.");
            break;
          }

          const targetRaw = (await ask(rl, "Оберіть ціль (MT/EX): ")).trim().toUpperCase();
          const target = targetRaw === "EX" ? ActivityType.EX : ActivityType.MT;

          const allowed = discipline.checkAdmission(student, target);
          console.log(`Допуск до ${target}: ${allowed ? "ДОЗВОЛЕНО" : "ЗАБОРОНЕНО"}`);
          break;
        }

        case "6": {
          if (!discipline) {
            console.log("Спочатку оберіть дисципліну.");
            break;
          }

          console.log(`Автоматичний залік: ${discipline.isPassFailAutomatic() ? "ТАК" : "НІ"}`);
          break;
        }

        case "7": {
          if (!discipline) {
            console.log("Спочатку оберіть дисципліну.");
            break;
          }

          const acts = discipline.getActivities().map((a) => a.type);
          console.log("Активності дисципліни:", acts.join(", "));
          break;
        }

        case "8": {
          const raw = (await ask(rl, "Введіть курс (1/2/3/4): ")).trim();
          const nextCourse = Number(raw);

          if (![1, 2, 3, 4].includes(nextCourse)) {
            console.log("Курс має бути 1, 2, 3 або 4.");
            break;
          }

          currentCourse = nextCourse;
          bundle = buildGroupBundleByCourse(currentCourse);

          if (discipline) {
            discipline.removeAllListeners();
            discipline = null;
          }

          console.log(`Курс змінено на ${currentCourse}. Сформовано нову групу та студентів.`);

          if (currentCourse >= 3) {
            console.log("На 3-4 курсі дисципліни PB/OOP/ADS недоступні за умовами завдання.");
          } else {
            console.log("Тепер можете обрати дисципліну через пункт 2.");
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