import AssignmentsTable from "@/components/assignments/AssignmentsTable";

export default function AssignmentsPage() {
  return (
    <div>
      <p className="text-muted text-[14px] -mt-2 mb-6">
        Track what&apos;s due, what&apos;s in review, and what&apos;s graded.
      </p>
      <AssignmentsTable />
    </div>
  );
}
