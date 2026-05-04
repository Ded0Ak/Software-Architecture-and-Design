import { DomainError } from "../errors/DomainError";
import { Teacher } from "../entities/Teacher";

export class ScheduleService {
  assignTeacherToSlot(teacher: Teacher, slotKey: string): void {
    if (!teacher.canTeachAt(slotKey)) {
      throw new DomainError(
        `Викладач ${teacher.name} не може одночасно вести кілька дисциплін.`
      );
    }
    teacher.reserveSlot(slotKey);
  }

  releaseTeacherSlot(teacher: Teacher, slotKey: string): void {
    teacher.releaseSlot(slotKey);
  }
}