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
  teachingLanguage: "english" | "german";
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
    avatar: "/images/Women teacher1.jpeg",
    teachingLanguage: "english",
    subject: "Speaking & Conversation",
    level: "A2 - C1",
    rating: 4.9,
    bio: "Speaking coach focused on real-world conversation practice and pronunciation.",
    slots: [
      { id: "s1", day: "Monday", time: "10:00 AM - 11:00 AM", booked: false },
      { id: "s2", day: "Monday", time: "04:00 PM - 05:00 PM", booked: true },
      {
        id: "s3",
        day: "Wednesday",
        time: "02:00 PM - 03:00 PM",
        booked: false,
      },
      { id: "s4", day: "Thursday", time: "11:00 AM - 12:00 PM", booked: false },
    ],
  },
  {
    id: "tp2",
    name: "Coach Daniel",
    avatar: "/images/Man teacher2.jpeg",
    teachingLanguage: "english",
    subject: "Grammar & Writing",
    level: "B1 - C1",
    rating: 4.8,
    bio: "Grammar specialist who breaks down tricky structures into simple rules.",
    slots: [
      { id: "s5", day: "Tuesday", time: "09:00 AM - 10:00 AM", booked: false },
      { id: "s6", day: "Tuesday", time: "01:00 PM - 02:00 PM", booked: false },
      { id: "s7", day: "Friday", time: "10:00 AM - 11:00 AM", booked: true },
    ],
  },
  {
    id: "tp3",
    name: "Amara Bello",
    avatar: "/images/Man teacher 3.jpeg",
    teachingLanguage: "english",
    subject: "IELTS Preparation",
    level: "B2 - C1",
    rating: 5.0,
    bio: "Former IELTS examiner, helps students target their band score efficiently.",
    slots: [
      { id: "s8", day: "Sunday", time: "06:00 PM - 07:00 PM", booked: false },
      { id: "s9", day: "Sunday", time: "07:30 PM - 08:30 PM", booked: false },
      {
        id: "s10",
        day: "Wednesday",
        time: "05:00 PM - 06:00 PM",
        booked: false,
      },
    ],
  },
  {
    id: "tp4",
    name: "Leo Marchetti",
    avatar: "/images/Women teacher2.jpeg",
    teachingLanguage: "english",
    subject: "Beginner English",
    level: "A1 - A2",
    rating: 4.7,
    bio: "Patient and encouraging — great fit for absolute beginners.",
    slots: [
      { id: "s11", day: "Monday", time: "09:00 AM - 10:00 AM", booked: false },
      {
        id: "s12",
        day: "Thursday",
        time: "09:00 AM - 10:00 AM",
        booked: false,
      },
      {
        id: "s13",
        day: "Saturday",
        time: "12:00 PM - 01:00 PM",
        booked: false,
      },
    ],
  },
  {
    id: "tp5",
    name: "Anna Keller",
    avatar: "/images/Women teacher3.jpeg",
    teachingLanguage: "german",
    subject: "German A1 - B2",
    level: "A1 - B2",
    rating: 4.9,
    bio: "German teacher focused on practical conversation, pronunciation, and confident everyday communication.",
    slots: [
      { id: "s14", day: "Tuesday", time: "04:00 PM - 05:00 PM", booked: false },
      {
        id: "s15",
        day: "Thursday",
        time: "06:00 PM - 07:00 PM",
        booked: false,
      },
      { id: "s16", day: "Saturday", time: "10:00 AM - 11:00 AM", booked: true },
    ],
  },
  {
    id: "tp6",
    name: "Maria Schmidt",
    avatar: "/images/Women teacher 4.jpeg",
    teachingLanguage: "german",
    subject: "German Conversation",
    level: "A2 - C1",
    rating: 4.8,
    bio: "Conversation teacher helping learners speak naturally in travel, work, and daily life.",
    slots: [
      { id: "s17", day: "Monday", time: "05:00 PM - 06:00 PM", booked: false },
      {
        id: "s18",
        day: "Wednesday",
        time: "09:00 AM - 10:00 AM",
        booked: false,
      },
      { id: "s19", day: "Friday", time: "03:00 PM - 04:00 PM", booked: false },
    ],
  },
  {
    id: "tp7",
    name: "Jonas Weber",
    avatar: "/images/Man teacher.jpeg",
    teachingLanguage: "german",
    subject: "German Grammar",
    level: "B1 - C1",
    rating: 4.7,
    bio: "Patient grammar coach who makes German sentence structure clear and practical.",
    slots: [
      { id: "s20", day: "Tuesday", time: "10:00 AM - 11:00 AM", booked: false },
      { id: "s21", day: "Thursday", time: "02:00 PM - 03:00 PM", booked: true },
      {
        id: "s22",
        day: "Saturday",
        time: "01:00 PM - 02:00 PM",
        booked: false,
      },
    ],
  },
  {
    id: "tp8",
    name: "Sophie Braun",
    avatar: "/images/Women teacher 5.jpeg",
    teachingLanguage: "german",
    subject: "German Exam Preparation",
    level: "A1 - B2",
    rating: 4.9,
    bio: "Exam preparation specialist focused on Goethe and TELC test strategies.",
    slots: [
      { id: "s23", day: "Monday", time: "07:00 PM - 08:00 PM", booked: false },
      {
        id: "s24",
        day: "Wednesday",
        time: "04:00 PM - 05:00 PM",
        booked: false,
      },
      { id: "s25", day: "Sunday", time: "11:00 AM - 12:00 PM", booked: false },
    ],
  },
];
