/**
 * Mock data for the admin dashboard's Students/Teachers tables.
 * Students are admin-only (there's no separate "student directory"
 * elsewhere in the app). Teachers reuse lib/teachers-directory.ts —
 * that's already the canonical list of teacher accounts.
 */

export type AdminStudent = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedDate: string;
  coursesEnrolled: number;
};

export const adminStudents: AdminStudent[] = [
  { id: "as1", name: "Sepanta Rostami", email: "sepanta@example.com", avatar: "https://i.pravatar.cc/64?img=13", joinedDate: "2026-03-14", coursesEnrolled: 3 },
  { id: "as2", name: "Amara Bello", email: "amara@example.com", avatar: "https://i.pravatar.cc/64?img=21", joinedDate: "2026-02-02", coursesEnrolled: 2 },
  { id: "as3", name: "Leo Marchetti", email: "leo@example.com", avatar: "https://i.pravatar.cc/64?img=15", joinedDate: "2026-04-19", coursesEnrolled: 1 },
  { id: "as4", name: "Nadia Karimi", email: "nadia@example.com", avatar: "https://i.pravatar.cc/64?img=47", joinedDate: "2026-01-27", coursesEnrolled: 4 },
  { id: "as5", name: "Tomas Novak", email: "tomas@example.com", avatar: "https://i.pravatar.cc/64?img=33", joinedDate: "2026-05-03", coursesEnrolled: 2 },
  { id: "as6", name: "Yuki Sato", email: "yuki@example.com", avatar: "https://i.pravatar.cc/64?img=48", joinedDate: "2026-03-30", coursesEnrolled: 1 }
];
