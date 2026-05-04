import { DomainError } from "../errors/DomainError";
import { Student } from "./Student";
import { StudentComponent } from "../composite/StudentComponent";

export class Subgroup implements StudentComponent {
  public readonly id: string;
  public readonly name: string;
  private readonly students: Student[];

  constructor(id: string, name: string, students: Student[]) {
    if (students.length < 10) {
      throw new DomainError(`Підгрупа ${name} не може містити менше 10 студентів.`);
    }
    this.id = id;
    this.name = name;
    this.students = students;
  }

  getStudents(): Student[] {
    return [...this.students];
  }

  size(): number {
    return this.students.length;
  }
}