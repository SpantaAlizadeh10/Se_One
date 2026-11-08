import TeacherClassPicker from "@/components/class-scheduling/TeacherClassPicker";
import ClassroomSessions from "@/components/classrooms/ClassroomSessions";

export default function TeacherClassesPage() {
  return (
    <div className="space-y-7">
      <TeacherClassPicker />
      <ClassroomSessions audience="teacher" allowScheduling={false} />
    </div>
  );
}
