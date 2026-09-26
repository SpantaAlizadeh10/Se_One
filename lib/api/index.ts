/**
 * API Client Index
 * Central export point for all API clients
 */

// Core
export { apiFetch } from "./client";

// Authentication
export {
  login,
  register,
  fetchCurrentUser,
  logoutApi,
  requestOtp,
  verifyOtp,
  requestPasswordReset,
  type AuthUser,
  type AuthResponse,
} from "./auth";

// Courses
export {
  getCourses,
  type Course,
} from "./courses";

// Enrollment
export {
  getUserEnrollments,
  getEnrollment,
  enrollInCourse,
  cancelEnrollment,
  getEnrollmentProgress,
  type Enrollment,
  type EnrollmentResponse,
  type CourseProgress,
} from "./enrollment";

// Modules
export {
  getCourseModules,
  getModule,
  type Module,
} from "./modules";

// Lessons
export {
  getModuleLessons,
  getLesson,
  completeLesson,
  getLessonProgress,
  updateLessonProgress,
  type Lesson,
  type LessonProgress,
} from "./lessons";

// Progress
export {
  getUserProgress,
  getCourseProgress,
  getAchievements,
  claimAchievement,
  type UserProgress,
  type CourseProgressSummary,
  type Achievement,
} from "./progress";

// Learning
export {
  getCurrentLearningState,
  startLearningSession,
  continueLearningSession,
  endLearningSession,
  getLearningRecommendations,
  type CurrentLearningState,
  type LearningSession,
  type SessionSummary,
  type Recommendation,
} from "./learning";

// Teachers
export {
  getTeachers,
} from "./teachers";

// Re-export teacher types from the directory
export type {
  TeacherProfile,
  AvailabilitySlot,
} from "@/lib/teachers-directory";

// Blog
export {
  getBlogPosts,
  getCambridgeBlogPosts,
  type BlogPost,
} from "./blog";

// Admin
export {
  getAdminDashboardStats,
  listAdminStudents,
  getAdminStudent,
  createAdminStudent,
  updateAdminStudent,
  setAdminStudentStatus,
  deleteAdminStudent,
  getAdminStudentEnrollments,
  getAdminStudentProgress,
  adminEnrollStudent,
  adminCancelStudentEnrollment,
  listAdminTeachers,
  getAdminTeacher,
  createAdminTeacher,
  updateAdminTeacher,
  setAdminTeacherStatus,
  deleteAdminTeacher,
  getAdminTeacherStudents,
  getAdminTeacherAvailability,
  setAdminTeacherAvailability,
  listAdminCourses,
  patchAdminCoursePricing,
  updateAdminCourse,
  listAdminCourseModules,
  createAdminCourseModule,
  updateAdminCourseModule,
  deleteAdminCourseModule,
  listAdminModuleLessons,
  createAdminModuleLesson,
  updateAdminLesson,
  deleteAdminLesson,
  type AdminDashboardStats,
  type AdminStudent,
  type StudentAccountStatus,
  type AdminTeacher,
  type TeacherWorkflowStatus,
  type AdminTeacherStudentLink,
  type AdminAvailabilitySlot,
  type AdminCourse,
  type AdminCourseModule,
  type AdminLesson,
  type AdminBlogPost,
  type PagedResult,
  type ListQuery,
} from "./admin";

// Wishlist
export {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  type WishlistItem,
} from "./wishlist";

// Reviews & Ratings
export {
  getCourseReviews,
  getCourseRatingSummary,
  createReview,
  getUserReviews,
  getReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  unmarkReviewHelpful,
  type Review,
  type CourseRatingSummary,
  type CreateReviewInput,
  type UpdateReviewInput,
} from "./reviews";

// Messaging
export {
  getConversations,
  searchConversations,
  createConversation,
  getConversation,
  getMessages,
  sendMessage,
  markConversationAsRead,
  markMessageAsRead,
  getTypingStatus,
  setTypingStatus,
  type Message,
  type Conversation,
  type CreateConversationInput,
  type SendMessageInput,
} from "./messaging";

// Assignments
export {
  getTeacherAssignments,
  createAssignment,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  getStudentAssignments,
  getStudentAssignment,
  submitAssignment,
  getStudentSubmissions,
  getSubmission,
  updateSubmission,
  type Assignment,
  type Submission,
  type CreateAssignmentInput,
  type UpdateAssignmentInput,
  type CreateSubmissionInput,
  type GradeSubmissionInput,
} from "./assignments";

// Practice / Exercises
export {
  getPracticeContent,
  getPractice,
  createPractice,
  updatePractice,
  deletePractice,
  startAttempt,
  submitAttempt,
  getPracticeAttempts,
  getAttempt,
  getPracticeHistory,
  getStreakInfo,
  getPracticeLeaderboard,
  type PracticeQuestion,
  type PracticeContent,
  type PracticeAttempt,
  type PracticeHistory,
  type StreakInfo,
  type CreatePracticeInput,
  type StartAttemptInput,
  type SubmitAttemptInput,
} from "./practice";

// User Settings/Profile
export {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  removeAvatar,
  changePassword,
  getTwoFactorStatus,
  enableTwoFactor,
  verifyTwoFactor,
  disableTwoFactor,
  regenerateBackupCodes,
  getNotificationPreferences,
  updateNotificationPreferences,
  requestAccountDeletion,
  confirmAccountDeletion,
  cancelAccountDeletion,
  type UserProfile,
  type NotificationPreferences,
  type TwoFactorStatus,
  type UpdateProfileInput,
  type ChangePasswordInput,
} from "./settings";

// Notifications
export {
  getNotifications,
  getNotificationStats,
  getNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearNotifications,
  executeNotificationAction,
  createTestNotification,
  type Notification,
  type NotificationStats,
} from "./notifications";

// Contact / Support
export {
  submitContactForm,
  getSupportTickets,
  createSupportTicket,
  getSupportTicket,
  updateSupportTicket,
  closeSupportTicket,
  reopenSupportTicket,
  addSupportMessage,
  getSupportMessages,
  uploadSupportAttachment,
  getFAQ,
  type SupportTicket,
  type SupportMessage,
  type ContactFormSubmission,
  type CreateTicketInput,
  type CreateMessageInput,
} from "./support";

// Newsletter
export {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getNewsletterPreferences,
  updateNewsletterPreferences,
  subscribeFromBlog,
  getSubscribers,
  getSubscriber,
  updateSubscriber,
  deleteSubscriber,
  importSubscribers,
  getCampaigns,
  createCampaign,
  getCampaign,
  updateCampaign,
  sendCampaign,
  deleteCampaign,
  getNewsletterStats,
  type NewsletterSubscriber,
  type NewsletterCampaign,
  type SubscribeInput,
} from "./newsletter";

// Course Search/Filtering
export {
  searchCourses,
  getSearchSuggestions,
  getCourseFilters,
  getFeaturedCourses,
  getTrendingCourses,
  getSimilarCourses,
  type CourseSearchResult,
  type SearchFilters,
  type SearchSortOption,
  type SearchResults,
} from "./search";

// Student Dashboard Data
export {
  getUpcomingClasses,
  getCalendarEvents,
  getRecentActivity,
  getStudyStatistics,
  getDashboardOverview,
  type UpcomingClass,
  type CalendarEvent,
  type RecentActivity,
  type StudyStatistics,
} from "./student-dashboard";

// Teacher Dashboard Data
export {
  getTeacherClasses,
  getTeacherSchedule,
  getTeacherStudents,
  getTeacherEarnings,
  getTeacherAnalytics,
  getTeacherDashboardOverview,
  type TeacherClass,
  type TeacherStudent,
  type TeacherEarnings,
  type TeacherAnalytics,
} from "./teacher-dashboard";
