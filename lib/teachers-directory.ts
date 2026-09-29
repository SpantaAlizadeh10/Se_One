export type AvailabilitySlot = {
  id: string;
  day: string;
  time: string;
  booked: boolean;
};

export type TeacherProfile = {
  id: string;
  name: string;
  avatar: string;
  teachingLanguage: "english" | "german";
  subject: string;
  level: string;
  rating: number;
  bio: string;
  videoUrl?: string;
  slots: AvailabilitySlot[];
};
