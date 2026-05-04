import { Student } from "../entities/Student";

export interface StudentComponent {
  getStudents(): Student[];
  size(): number;
}