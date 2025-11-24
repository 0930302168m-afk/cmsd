export type ProgressLevel = 0 | 25 | 50 | 75 | 100;

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  dueDate: Date;
  progress: ProgressLevel;
  priority: 'Low' | 'Medium' | 'High';
  notes: string;
  isTracked: boolean;
}

export interface Subject {
  id: string;
  name: string;
  teacherName: string;
  teacherImage: string;
  color: string; // Tailwind class for text/bg accents
  icon: string;
}

export enum Screen {
  DASHBOARD = 'DASHBOARD',
  ASSIGNMENT_LIST = 'ASSIGNMENT_LIST',
  PROGRESS_UPDATE = 'PROGRESS_UPDATE',
  NEW_ASSIGNMENT = 'NEW_ASSIGNMENT',
  CALENDAR = 'CALENDAR',
  SUMMARY = 'SUMMARY',
  NOTIFICATIONS = 'NOTIFICATIONS'
}

export interface NotificationItem {
  id: string;
  message: string;
  type: 'urgent' | 'reminder' | 'update';
  timestamp: Date;
}