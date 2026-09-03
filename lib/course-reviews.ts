/**
 * Mock reviews per course. Kept in English only (consistent with the
 * rest of the dashboard's deep mock content — see README), since this
 * is illustrative demo data, not UI chrome.
 */

export type CourseReview = {
  id: string;
  name: string;
  rating: number; // 1-5
  comment: string;
  date: string;
};

export const courseReviews: Record<string, CourseReview[]> = {
  beginners: [
    { id: "r1", name: "Priya N.", rating: 5, comment: "Perfect starting point — the pace never felt overwhelming.", date: "2026-06-02" },
    { id: "r2", name: "Marco D.", rating: 4, comment: "Great basics, would love a few more speaking exercises.", date: "2026-05-14" },
    { id: "r3", name: "Fatima R.", rating: 5, comment: "My confidence with everyday words improved so much.", date: "2026-04-29" }
  ],
  everyday: [
    { id: "r4", name: "Lucas B.", rating: 5, comment: "Exactly what I needed for daily conversations at work.", date: "2026-06-10" },
    { id: "r5", name: "Hana K.", rating: 5, comment: "The listening exercises are really practical.", date: "2026-05-22" },
    { id: "r6", name: "Omar T.", rating: 4, comment: "Solid course, teachers give useful feedback.", date: "2026-05-03" }
  ],
  advanced: [
    { id: "r7", name: "Elena V.", rating: 5, comment: "Finally speaking with confidence in professional settings.", date: "2026-06-18" },
    { id: "r8", name: "Ravi S.", rating: 4, comment: "Challenging in a good way — pushed my fluency forward.", date: "2026-05-30" }
  ],
  ielts: [
    { id: "r9", name: "Chen W.", rating: 5, comment: "Hit my target band score after this course. Highly recommend.", date: "2026-06-05" },
    { id: "r10", name: "Julia M.", rating: 5, comment: "The mock tests were incredibly close to the real exam.", date: "2026-05-19" },
    { id: "r11", name: "Ahmed F.", rating: 4, comment: "Great strategies, wish there were more writing samples.", date: "2026-04-27" }
  ]
};

export function getAverageRating(courseId: string): { average: number; count: number } {
  const reviews = courseReviews[courseId] ?? [];
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}
