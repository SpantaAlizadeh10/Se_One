export type Course = {
  id: string;
  title: string;
  level: string;
  progress: number;
  gradient: string;
  price?: string;
};

export const courses: Course[] = [
  {
    id: "beginners",
    title: "English for Beginners",
    level: "Level A1 – A2",
    progress: 65,
    gradient: "from-[#CFE7E4] to-[#9FCFC9]"
  },
  {
    id: "everyday",
    title: "Everyday English",
    level: "Level A2 – B1",
    progress: 90,
    gradient: "from-[#D9D2F0] to-[#B7A8E6]"
  },
  {
    id: "advanced",
    title: "Advanced Grammar",
    level: "Level B2 – C1",
    progress: 38,
    gradient: "from-[#CDE0D6] to-[#9CC4AC]"
  }
];

export type ClassItem = {
  id: string;
  title: string;
  level: string;
  day: string;
  time: string;
  kind: "speak" | "grammar" | "write";
};

export const upcomingClasses: ClassItem[] = [
  { id: "1", title: "Speaking Class", level: "Intermediate B1", day: "Today", time: "04:00 PM", kind: "speak" },
  { id: "2", title: "Grammar Class", level: "Intermediate B1", day: "Today", time: "10:00 AM", kind: "grammar" },
  { id: "3", title: "Writing Class", level: "Upper Intermediate B1", day: "Today", time: "08:00 PM", kind: "write" }
];

export const recentActivity: ClassItem[] = upcomingClasses;

export const monthlyEarnings = [22, 7, 44, 26, 48, 32, 60, 18, 12, 42, 60, 28];
export const monthlyDownloads = [14, 20, 10, 32, 18, 40, 52, 24, 30, 16, 44, 38];
export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

export type PracticeItem = {
  id: string;
  title: string;
  skill: "Speaking" | "Grammar" | "Vocabulary" | "Listening";
  level: string;
  minutes: number;
  kind: "speak" | "grammar" | "write";
};

export const practiceItems: PracticeItem[] = [
  { id: "p1", title: "Ordering food at a café", skill: "Speaking", level: "B1", minutes: 8, kind: "speak" },
  { id: "p2", title: "Present perfect vs. past simple", skill: "Grammar", level: "B2", minutes: 12, kind: "grammar" },
  { id: "p3", title: "Everyday phrasal verbs", skill: "Vocabulary", level: "A2", minutes: 6, kind: "write" },
  { id: "p4", title: "Listening: booking a hotel room", skill: "Listening", level: "A2", minutes: 10, kind: "speak" }
];

export type Assignment = {
  id: string;
  title: string;
  course: string;
  due: string;
  status: "pending" | "submitted" | "graded";
  grade?: string;
};

export const assignments: Assignment[] = [
  { id: "a1", title: "Describe your daily routine", course: "English for Beginners", due: "Aug 14, 2026", status: "pending" },
  { id: "a2", title: "Restaurant role-play recording", course: "Everyday English", due: "Aug 15, 2026", status: "pending" },
  { id: "a3", title: "Conditional sentences worksheet", course: "Advanced Grammar", due: "Aug 10, 2026", status: "submitted" },
  { id: "a4", title: "Vocabulary quiz — travel", course: "Everyday English", due: "Aug 6, 2026", status: "graded", grade: "96/100" },
  { id: "a5", title: "Short essay: my hometown", course: "English for Beginners", due: "Aug 2, 2026", status: "graded", grade: "88/100" },
  { id: "a6", title: "Listening comprehension: news clip", course: "Advanced Grammar", due: "Jul 28, 2026", status: "graded", grade: "90/100" }
];

export type Message = {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
};

export type Conversation = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  preview: string;
  time: string;
  unread: boolean;
  online: boolean;
  messages: Message[];
};

export const conversations: Conversation[] = [
  {
    id: "c1",
    name: "Ms. Harlow",
    role: "Speaking coach",
    avatar: "https://i.pravatar.cc/64?img=48",
    preview: "Great work on the speaking exercise! One note on...",
    time: "10:42 AM",
    unread: true,
    online: true,
    messages: [
      { id: "m1", fromMe: false, text: "Hi Sepanta! I listened to your recording from the café role-play — nicely done.", time: "10:30 AM" },
      { id: "m2", fromMe: false, text: "Great work on the speaking exercise! One note on pronunciation of \"th\" sounds, we can go over it in your next session.", time: "10:31 AM" },
      { id: "m3", fromMe: true, text: "Thank you! That would be really helpful, I still mix it up sometimes.", time: "10:38 AM" },
      { id: "m4", fromMe: false, text: "No problem at all, it's a common one. I'll send a few drills before Thursday's class.", time: "10:42 AM" }
    ]
  },
  {
    id: "c2",
    name: "Coach Daniel",
    role: "Grammar coach",
    avatar: "https://i.pravatar.cc/64?img=32",
    preview: "Your grammar worksheet has been graded.",
    time: "Yesterday",
    unread: false,
    online: false,
    messages: [
      { id: "m1", fromMe: false, text: "Your grammar worksheet has been graded — 96/100, really solid work.", time: "Yesterday" },
      { id: "m2", fromMe: true, text: "That's great to hear, thank you for the quick turnaround!", time: "Yesterday" }
    ]
  },
  {
    id: "c3",
    name: "Support Team",
    role: "Billing & account",
    avatar: "https://i.pravatar.cc/64?img=5",
    preview: "Thanks for reaching out — your invoice is attached.",
    time: "Mon",
    unread: false,
    online: false,
    messages: [
      { id: "m1", fromMe: true, text: "Hi, could I get a copy of last month's invoice?", time: "Mon" },
      { id: "m2", fromMe: false, text: "Thanks for reaching out — your invoice is attached to this thread.", time: "Mon" }
    ]
  },
  {
    id: "c4",
    name: "Study Group — B1",
    role: "4 members",
    avatar: "https://i.pravatar.cc/64?img=21",
    preview: "Amara: anyone free to practice Thursday?",
    time: "Sun",
    unread: false,
    online: false,
    messages: [
      { id: "m1", fromMe: false, text: "Amara: anyone free to practice Thursday?", time: "Sun" },
      { id: "m2", fromMe: true, text: "I should be free after 6pm!", time: "Sun" }
    ]
  }
];
