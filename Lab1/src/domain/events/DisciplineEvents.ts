import { ActivityType } from "../enums/ActivityType";
import { DisciplineType } from "../enums/DisciplineType";

export interface ActivitiesChangedEvent {
  discipline: DisciplineType;
  oldActivities: ActivityType[];
  newActivities: ActivityType[];
}

export interface ActivityTeachersChangedEvent {
  discipline: DisciplineType;
  activity: ActivityType;
  oldTeacherIds: string[];
  newTeacherIds: string[];
}

export interface AdmissionChangedEvent {
  discipline: DisciplineType;
  studentId: string;
  studentName: string;
  target: ActivityType.MT | ActivityType.EX;
  isAllowed: boolean;
  reason: string;
}