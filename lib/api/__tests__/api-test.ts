/**
 * API Client Test File
 * 
 * This file demonstrates how to test the backend API endpoints.
 * Use this to verify your backend implementation matches the expected format.
 * 
 * To run these tests:
 * 1. Ensure your backend is running at NEXT_PUBLIC_API_BASE_URL
 * 2. Make sure you have valid test credentials
 * 3. Run this file with Node.js or integrate with your test framework
 */

import { 
  login, 
  register, 
  fetchCurrentUser, 
  logoutApi 
} from "../auth";
import { 
  getCourses 
} from "../courses";
import { 
  enrollInCourse, 
  getUserEnrollments, 
  getEnrollmentProgress 
} from "../enrollment";
import { 
  getCourseModules 
} from "../modules";
import { 
  getModuleLessons, 
  completeLesson 
} from "../lessons";
import { 
  getUserProgress,
  getAchievements 
} from "../progress";
import { 
  getCurrentLearningState,
  startLearningSession 
} from "../learning";
import { 
  getTeachers 
} from "../teachers";
import { 
  getBlogPosts 
} from "../blog";

// Test configuration
const TEST_USER = {
  email: "test@example.com",
  password: "test123",
  fullName: "Test User",
  role: "student" as const
};

const TEST_COURSE_ID = "beginners"; // Replace with actual course ID from your backend

/**
 * Test authentication flow
 */
async function testAuth() {
  console.log("🔐 Testing Authentication...");
  
  try {
    // Test registration
    console.log("  → Testing register...");
    const registerResult = await register(TEST_USER);
    console.log("  ✓ Register successful:", registerResult.user.email);
    
    // Test login
    console.log("  → Testing login...");
    const loginResult = await login(TEST_USER.email, TEST_USER.password);
    console.log("  ✓ Login successful:", loginResult.user.email);
    
    // Test current user
    console.log("  → Testing fetch current user...");
    const currentUser = await fetchCurrentUser();
    console.log("  ✓ Current user:", currentUser.email);
    
    // Test logout
    console.log("  → Testing logout...");
    await logoutApi();
    console.log("  ✓ Logout successful");
    
    return true;
  } catch (error) {
    console.error("  ✗ Auth test failed:", error);
    return false;
  }
}

/**
 * Test courses API
 */
async function testCourses() {
  console.log("📚 Testing Courses API...");
  
  try {
    console.log("  → Testing get courses...");
    const courses = await getCourses("en");
    console.log(`  ✓ Got ${courses.length} courses`);
    
    if (courses.length > 0) {
      console.log("  Sample course:", {
        id: courses[0].id,
        title: courses[0].title,
        level: courses[0].level
      });
    }
    
    return true;
  } catch (error) {
    console.error("  ✗ Courses test failed:", error);
    return false;
  }
}

/**
 * Test enrollment flow
 */
async function testEnrollment() {
  console.log("🎯 Testing Enrollment API...");
  
  try {
    // First login to get auth
    await login(TEST_USER.email, TEST_USER.password);
    
    console.log("  → Testing enroll in course...");
    const enrollment = await enrollInCourse(TEST_COURSE_ID);
    console.log("  ✓ Enrollment successful:", enrollment.enrollment.id);
    
    console.log("  → Testing get user enrollments...");
    const enrollments = await getUserEnrollments();
    console.log(`  ✓ Got ${enrollments.length} enrollments`);
    
    if (enrollments.length > 0) {
      console.log("  → Testing get enrollment progress...");
      const progress = await getEnrollmentProgress(enrollments[0].id);
      console.log("  ✓ Progress:", {
        overallProgress: progress.overallProgress,
        completedLessons: progress.completedLessons,
        totalLessons: progress.totalLessons
      });
    }
    
    return true;
  } catch (error) {
    console.error("  ✗ Enrollment test failed:", error);
    return false;
  }
}

/**
 * Test modules and lessons
 */
async function testModulesAndLessons() {
  console.log("📖 Testing Modules & Lessons API...");
  
  try {
    console.log("  → Testing get course modules...");
    const modules = await getCourseModules(TEST_COURSE_ID);
    console.log(`  ✓ Got ${modules.length} modules`);
    
    if (modules.length > 0) {
      const firstModule = modules[0];
      console.log("  → Testing get module lessons...");
      const lessons = await getModuleLessons(firstModule.id);
      console.log(`  ✓ Got ${lessons.length} lessons in module '${firstModule.title}'`);
      
      if (lessons.length > 0) {
        console.log("  → Testing complete lesson...");
        const progress = await completeLesson(lessons[0].id);
        console.log("  ✓ Lesson completion recorded:", progress.isCompleted);
      }
    }
    
    return true;
  } catch (error) {
    console.error("  ✗ Modules/Lessons test failed:", error);
    return false;
  }
}

/**
 * Test progress tracking
 */
async function testProgress() {
  console.log("📊 Testing Progress API...");
  
  try {
    console.log("  → Testing get user progress...");
    const progress = await getUserProgress();
    console.log("  ✓ User progress:", {
      totalCoursesEnrolled: progress.totalCoursesEnrolled,
      totalLessonsCompleted: progress.totalLessonsCompleted,
      currentStreak: progress.currentStreak
    });
    
    console.log("  → Testing get achievements...");
    const achievements = await getAchievements();
    console.log(`  ✓ Got ${achievements.length} achievements`);
    
    return true;
  } catch (error) {
    console.error("  ✗ Progress test failed:", error);
    return false;
  }
}

/**
 * Test learning sessions
 */
async function testLearning() {
  console.log("🎓 Testing Learning API...");
  
  try {
    console.log("  → Testing get current learning state...");
    const state = await getCurrentLearningState();
    console.log("  ✓ Current learning state:", {
      activeCourseId: state.activeCourseId,
      dailyGoalProgress: state.dailyGoalProgress
    });
    
    console.log("  → Testing start learning session...");
    const session = await startLearningSession(TEST_COURSE_ID);
    console.log("  ✓ Learning session started:", session.sessionId);
    console.log("  Current lesson:", session.lesson.title);
    
    return true;
  } catch (error) {
    console.error("  ✗ Learning test failed:", error);
    return false;
  }
}

/**
 * Test teachers API
 */
async function testTeachers() {
  console.log("👨‍🏫 Testing Teachers API...");
  
  try {
    console.log("  → Testing get teachers...");
    const teachers = await getTeachers();
    console.log(`  ✓ Got ${teachers.length} teachers`);
    
    if (teachers.length > 0) {
      console.log("  Sample teacher:", {
        name: teachers[0].name,
        subject: teachers[0].subject,
        availableSlots: teachers[0].slots.filter(s => !s.booked).length
      });
    }
    
    return true;
  } catch (error) {
    console.error("  ✗ Teachers test failed:", error);
    return false;
  }
}

/**
 * Test blog API
 */
async function testBlog() {
  console.log("📝 Testing Blog API...");
  
  try {
    console.log("  → Testing get blog posts...");
    const posts = await getBlogPosts("en");
    console.log(`  ✓ Got ${posts.length} blog posts`);
    
    if (posts.length > 0) {
      console.log("  Sample post:", {
        title: posts[0].title,
        category: posts[0].category,
        author: posts[0].author
      });
    }
    
    return true;
  } catch (error) {
    console.error("  ✗ Blog test failed:", error);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log("🚀 Starting API Tests\n");
  console.log("=".repeat(50));
  
  const results = {
    auth: await testAuth(),
    courses: await testCourses(),
    enrollment: await testEnrollment(),
    modulesLessons: await testModulesAndLessons(),
    progress: await testProgress(),
    learning: await testLearning(),
    teachers: await testTeachers(),
    blog: await testBlog()
  };
  
  console.log("=".repeat(50));
  console.log("\n📋 Test Results:");
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`  ${passed ? "✓" : "✗"} ${test}: ${passed ? "PASSED" : "FAILED"}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n${allPassed ? "🎉 All tests passed!" : "❌ Some tests failed"}`);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests };