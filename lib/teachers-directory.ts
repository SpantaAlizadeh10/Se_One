/**
 * Mock directory of teachers and their availability slots, shared between:
 *  - the student dashboard's "Find a Teacher" page (browses everyone's slots)
 *  - the teacher dashboard's "My Availability" page (manages one teacher's own slots)
 *
 * In production this would come from a real endpoint, e.g.:
 *   GET  /api/teachers                 -> list of teacher profiles + open slots
 *   POST /api/teachers/:id/slots       -> teacher adds an availability slot
 *   DELETE /api/teachers/:id/slots/:id -> teacher removes a slot
 *   POST /api/bookings                 -> student books a slot
 * Each page below manages its own local copy of this data (useState), same
 * as the rest of the dashboard's mock content — there's no shared store or
 * persistence across pages/sessions yet.
 */

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
  subject: string;
  level: string;
  rating: number;
  bio: string;
  slots: AvailabilitySlot[];
};

// The teacher currently logged into the Teacher dashboard is represented by
// this id — swap this for the real authenticated teacher's id once wired
// to a backend.
export const CURRENT_TEACHER_ID = "tp1";

export const teacherDirectory: TeacherProfile[] = [
  {
    id: "tp1",
    name: "Ms. Harlow",
    avatar: "https://i.pravatar.cc/100?img=48",
    subject: "Speaking & Conversation",
    level: "A2 - C1",
    rating: 4.9,
    bio: "Speaking coach focused on real-world conversation practice and pronunciation.",
    slots: [
      { id: "s1", day: "Monday", time: "10:00 AM - 11:00 AM", booked: false },
      { id: "s2", day: "Monday", time: "04:00 PM - 05:00 PM", booked: true },
      { id: "s3", day: "Wednesday", time: "02:00 PM - 03:00 PM", booked: false },
      { id: "s4", day: "Thursday", time: "11:00 AM - 12:00 PM", booked: false }
    ]
  },
  {
    id: "tp2",
    name: "Coach Daniel",
    avatar: "https://i.pravatar.cc/100?img=32",
    subject: "Grammar & Writing",
    level: "B1 - C1",
    rating: 4.8,
    bio: "Grammar specialist who breaks down tricky structures into simple rules.",
    slots: [
      { id: "s5", day: "Tuesday", time: "09:00 AM - 10:00 AM", booked: false },
      { id: "s6", day: "Tuesday", time: "01:00 PM - 02:00 PM", booked: false },
      { id: "s7", day: "Friday", time: "10:00 AM - 11:00 AM", booked: true }
    ]
  },
  {
    id: "tp3",
    name: "Amara Bello",
    avatar: "https://i.pravatar.cc/100?img=21",
    subject: "IELTS Preparation",
    level: "B2 - C1",
    rating: 5.0,
    bio: "Former IELTS examiner, helps students target their band score efficiently.",
    slots: [
      { id: "s8", day: "Sunday", time: "06:00 PM - 07:00 PM", booked: false },
      { id: "s9", day: "Sunday", time: "07:30 PM - 08:30 PM", booked: false },
      { id: "s10", day: "Wednesday", time: "05:00 PM - 06:00 PM", booked: false }
    ]
  },
  {
    id: "tp4",
    name: "Leo Marchetti",
    avatar: "https://i.pravatar.cc/100?img=15",
    subject: "Beginner English",
    level: "A1 - A2",
    rating: 4.7,
    bio: "Patient and encouraging — great fit for absolute beginners.",
    slots: [
      { id: "s11", day: "Monday", time: "09:00 AM - 10:00 AM", booked: false },
      { id: "s12", day: "Thursday", time: "09:00 AM - 10:00 AM", booked: false },
      { id: "s13", day: "Saturday", time: "12:00 PM - 01:00 PM", booked: false }
    ]
  }
];
