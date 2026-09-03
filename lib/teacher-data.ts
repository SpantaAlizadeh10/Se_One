export type TeacherClass = {
  id: string;
  title: string;
  level: string;
  students: number;
  day: string;
  time: string;
  gradient: string;
};

export const teacherClasses: TeacherClass[] = [
  { id: "tc1", title: "English for Beginners", level: "A1 - A2", students: 18, day: "Mon / Wed", time: "04:00 PM", gradient: "from-[#CFE7E4] to-[#9FCFC9]" },
  { id: "tc2", title: "Everyday English", level: "A2 - B1", students: 22, day: "Tue / Thu", time: "10:00 AM", gradient: "from-[#D9D2F0] to-[#B7A8E6]" },
  { id: "tc3", title: "Advanced Speaking", level: "B2 - C1", students: 14, day: "Sat", time: "08:00 PM", gradient: "from-[#CDE0D6] to-[#9CC4AC]" },
  { id: "tc4", title: "IELTS Preparation", level: "C1", students: 9, day: "Sun", time: "06:00 PM", gradient: "from-[#F4D9C6] to-[#E8AE85]" }
];

export type TeacherStudent = {
  id: string;
  name: string;
  className: string;
  level: string;
  progress: number;
  avatar: string;
};

export const teacherStudents: TeacherStudent[] = [
  { id: "s1", name: "Sepanta Rostami", className: "English for Beginners", level: "A1", progress: 65, avatar: "https://i.pravatar.cc/64?img=13" },
  { id: "s2", name: "Amara Bello", className: "Everyday English", level: "B1", progress: 82, avatar: "https://i.pravatar.cc/64?img=21" },
  { id: "s3", name: "Leo Marchetti", className: "Advanced Speaking", level: "C1", progress: 44, avatar: "https://i.pravatar.cc/64?img=15" },
  { id: "s4", name: "Nadia Karimi", className: "English for Beginners", level: "A2", progress: 58, avatar: "https://i.pravatar.cc/64?img=47" },
  { id: "s5", name: "Tomas Novak", className: "IELTS Preparation", level: "C1", progress: 90, avatar: "https://i.pravatar.cc/64?img=33" },
  { id: "s6", name: "Yuki Sato", className: "Everyday English", level: "B1", progress: 71, avatar: "https://i.pravatar.cc/64?img=48" }
];

export type ScheduleSlot = {
  id: string;
  day: string;
  title: string;
  time: string;
  level: string;
};

export const weeklySchedule: ScheduleSlot[] = [
  { id: "w1", day: "Monday", title: "English for Beginners", time: "04:00 PM - 05:00 PM", level: "A1 - A2" },
  { id: "w2", day: "Tuesday", title: "Everyday English", time: "10:00 AM - 11:00 AM", level: "A2 - B1" },
  { id: "w3", day: "Wednesday", title: "English for Beginners", time: "04:00 PM - 05:00 PM", level: "A1 - A2" },
  { id: "w4", day: "Thursday", title: "Everyday English", time: "10:00 AM - 11:00 AM", level: "A2 - B1" },
  { id: "w5", day: "Saturday", title: "Advanced Speaking", time: "08:00 PM - 09:00 PM", level: "B2 - C1" },
  { id: "w6", day: "Sunday", title: "IELTS Preparation", time: "06:00 PM - 07:30 PM", level: "C1" }
];
