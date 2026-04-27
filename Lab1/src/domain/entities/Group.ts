import { DisciplineType } from "../enums/DisciplineType";
import { DomainError } from "../errors/DomainError";
import { Student } from "./Student";

export class Group {
  public readonly id: string;
  public readonly name: string;
  public readonly courseYear: number;
  private readonly students: Student[];
  private readonly studiedDisciplines: Set<DisciplineType> = new Set();

  constructor(id: string, name: string, courseYear: number, students: Student[]) {
    if (courseYear < 1) {
      throw new DomainError("Курс групи має бути >= 1.");
    }
    this.id = id;
    this.name = name;
    this.courseYear = courseYear;
    this.students = students;
  }

  getStudents(): Student[] {
    return [...this.students];
  }

  markDisciplineStudied(discipline: DisciplineType): void {
    if (this.studiedDisciplines.has(discipline)) {
      throw new DomainError(`Дисципліну ${discipline} уже було вивчено групою ${this.name}.`);
    }
    this.studiedDisciplines.add(discipline);
  }

  hasStudiedDiscipline(discipline: DisciplineType): boolean {
    return this.studiedDisciplines.has(discipline);
  }
}