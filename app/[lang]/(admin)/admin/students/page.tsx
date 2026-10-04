"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Trash2,
  Plus,
  Edit,
  Mail,
  MoreVertical,
  Ban,
  Check,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { isApiConfigured } from "@/lib/is-api-configured";
import {
  createAdminStudent,
  deleteAdminStudent,
  listAdminStudents,
  setAdminStudentStatus,
  updateAdminStudent,
} from "@/lib/api/admin";
import AdminDataSourceBanner from "@/components/admin/AdminDataSourceBanner";

type StudentWithStatus = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedDate: string;
  coursesEnrolled: number;
  status: "active" | "suspended" | "banned";
};

export default function AdminStudentsPage() {
  const { t, href } = useLanguage();
  const s = t("adminStudentsPage");

  const [students, setStudents] = useState<StudentWithStatus[]>([]);
  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] =
    useState<StudentWithStatus | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "suspended" | "banned"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!isApiConfigured()) {
      setApiError(
        "Backend API URL is not configured. Student data is unavailable.",
      );
      setIsLoading(false);
      return;
    }

    listAdminStudents({ pageSize: 100 })
      .then((result) => {
        setStudents(
          result.items.map((student) => ({
            id: student.id,
            name: student.fullName,
            email: student.email,
            avatar: student.avatarUrl || "https://i.pravatar.cc/64?img=1",
            joinedDate: student.joinedAt,
            coursesEnrolled: student.coursesEnrolled,
            status: student.status,
          })),
        );
      })
      .catch((error) =>
        setApiError(
          error instanceof Error ? error.message : "Could not load students",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = students.filter((st) => {
    const matchesQuery =
      st.name.toLowerCase().includes(query.toLowerCase()) ||
      st.email.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = filterStatus === "all" || st.status === filterStatus;
    return matchesQuery && matchesStatus;
  });

  const remove = async (id: string) => {
    if (!isApiConfigured()) return;
    if (!window.confirm(s.confirmDelete)) return;
    try {
      await deleteAdminStudent(id);
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Could not delete student",
      );
      return;
    }
    setStudents((prev) => prev.filter((st) => st.id !== id));
  };

  const setStatus = async (id: string, status: StudentWithStatus["status"]) => {
    if (!isApiConfigured()) return;
    try {
      await setAdminStudentStatus(id, status);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Could not update student status",
      );
      return;
    }
    setStudents((prev) =>
      prev.map((st) => (st.id === id ? { ...st, status } : st)),
    );
  };

  const suspendStudent = (id: string) => setStatus(id, "suspended");

  const banStudent = async (id: string) => {
    if (!window.confirm("Are you sure you want to ban this student?")) return;
    await setStatus(id, "banned");
  };

  const activateStudent = (id: string) => setStatus(id, "active");

  const addStudent = async (student: Omit<StudentWithStatus, "id">) => {
    if (!isApiConfigured()) return;
    try {
      const created = await createAdminStudent({
        fullName: student.name,
        email: student.email,
        password: `SEone-${Date.now()}`,
      });
      setStudents((prev) => [
        ...prev,
        {
          id: created.id,
          name: created.fullName,
          email: created.email,
          avatar: created.avatarUrl || student.avatar,
          joinedDate: created.joinedAt,
          coursesEnrolled: created.coursesEnrolled,
          status: created.status,
        },
      ]);
      setShowAddModal(false);
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Could not create student",
      );
    }
  };

  const updateStudent = async (
    id: string,
    updates: Partial<StudentWithStatus>,
  ) => {
    if (!isApiConfigured()) return;
    try {
      await updateAdminStudent(id, {
        fullName: updates.name,
        email: updates.email,
        avatarUrl: updates.avatar,
      });
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Could not update student",
      );
      return;
    }
    setStudents((prev) =>
      prev.map((st) => (st.id === id ? { ...st, ...updates } : st)),
    );
    setEditingStudent(null);
  };

  const getStatusBadge = (status: StudentWithStatus["status"]) => {
    const styles = {
      active: "bg-sage text-sageDeep",
      suspended: "bg-[#FDEFE0] text-[#B8792E]",
      banned: "bg-danger/10 text-danger",
    };
    const labels = {
      active: "Active",
      suspended: "Suspended",
      banned: "Banned",
    };
    return (
      <span
        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "active").length,
    suspended: students.filter((s) => s.status === "suspended").length,
    banned: students.filter((s) => s.status === "banned").length,
  };

  return (
    <div>
      <AdminDataSourceBanner apiError={apiError} />
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-line rounded-md p-4 shadow-card">
          <div className="text-[11px] text-muted mb-1">Total Students</div>
          <div className="font-serif text-[22px] font-semibold">
            {stats.total}
          </div>
        </div>
        <div className="bg-white border border-line rounded-md p-4 shadow-card">
          <div className="text-[11px] text-muted mb-1">Active</div>
          <div className="font-serif text-[22px] font-semibold text-sageDeep">
            {stats.active}
          </div>
        </div>
        <div className="bg-white border border-line rounded-md p-4 shadow-card">
          <div className="text-[11px] text-muted mb-1">Suspended</div>
          <div className="font-serif text-[22px] font-semibold text-[#B8792E]">
            {stats.suspended}
          </div>
        </div>
        <div className="bg-white border border-line rounded-md p-4 shadow-card">
          <div className="text-[11px] text-muted mb-1">Banned</div>
          <div className="font-serif text-[22px] font-semibold text-danger">
            {stats.banned}
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-2.5 rounded-full border border-line bg-white px-4 py-2.5 shadow-card sm:max-w-[320px]">
          <Search size={16} className="text-muted shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={s.searchPlaceholder}
            className="flex-1 min-w-0 outline-none text-[13.5px] placeholder:text-muted bg-transparent"
          />
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="min-w-0 flex-1 rounded-full border border-line bg-white px-3 py-2.5 text-[13.5px] outline-none focus:border-blue sm:flex-none sm:px-4"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
          {isApiConfigured() && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-blue px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-blueDeep sm:flex-none"
            >
              <Plus size={16} />
              Add Student
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-line rounded-lg shadow-card overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-cream border-b border-line">
              {[
                s.colName,
                s.colEmail,
                s.colJoined,
                s.colCourses,
                "Status",
                s.colActions,
              ].map((h) => (
                <th
                  key={h}
                  className="text-start text-[11px] font-bold tracking-wider uppercase text-muted px-5 py-3.5"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((st) => (
              <tr
                key={st.id}
                className="border-b border-line last:border-none hover:bg-cream/60"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Image
                      src={st.avatar}
                      alt={st.name}
                      width={34}
                      height={34}
                      className="rounded-full object-cover shrink-0"
                    />
                    <div>
                      <Link
                        href={href(`/admin/students/${st.id}`)}
                        className="text-[13.5px] font-semibold block text-blue hover:underline"
                      >
                        {st.name}
                      </Link>
                      <span className="text-[11px] text-muted">{st.id}</span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-ink70">
                  {st.email}
                </td>
                <td className="px-5 py-3.5 text-[13px] text-ink70">
                  {st.joinedDate}
                </td>
                <td className="px-5 py-3.5 text-[13px] text-ink70">
                  {st.coursesEnrolled}
                </td>
                <td className="px-5 py-3.5">{getStatusBadge(st.status)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    {st.status === "active" && (
                      <>
                        <button
                          onClick={() => suspendStudent(st.id)}
                          className="inline-flex items-center gap-1 text-[12px] font-bold text-[#B8792E] bg-[#FDEFE0] hover:bg-[#FDEFE0]/80 px-3 py-1.5 rounded-full transition-colors"
                          title="Suspend"
                        >
                          <Ban size={13} />
                        </button>
                        <button
                          onClick={() => banStudent(st.id)}
                          className="inline-flex items-center gap-1 text-[12px] font-bold text-danger bg-danger/10 hover:bg-danger/15 px-3 py-1.5 rounded-full transition-colors"
                          title="Ban"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                    {st.status !== "active" && (
                      <button
                        onClick={() => activateStudent(st.id)}
                        className="inline-flex items-center gap-1 text-[12px] font-bold text-sageDeep bg-sage hover:bg-sage/80 px-3 py-1.5 rounded-full transition-colors"
                        title="Activate"
                      >
                        <Check size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => setEditingStudent(st)}
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue bg-blue/10 hover:bg-blue/15 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => remove(st.id)}
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold text-danger bg-danger/10 hover:bg-danger/15 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-[13.5px] text-muted"
                >
                  Loading students…
                </td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-[13.5px] text-muted"
                >
                  {s.noResults}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-card max-w-md w-full p-6">
            <h3 className="font-serif text-[20px] font-semibold mb-4">
              Add New Student
            </h3>
            <AddStudentForm
              onSubmit={addStudent}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-card max-w-md w-full p-6">
            <h3 className="font-serif text-[20px] font-semibold mb-4">
              Edit Student
            </h3>
            <EditStudentForm
              student={editingStudent}
              onSubmit={(updates) => updateStudent(editingStudent.id, updates)}
              onCancel={() => setEditingStudent(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AddStudentForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (student: Omit<StudentWithStatus, "id">) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: "https://i.pravatar.cc/64?img=1",
    status: "active" as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      joinedDate: new Date().toISOString().split("T")[0],
      coursesEnrolled: 0,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-[13px] font-bold text-ink mb-2">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue"
            required
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-ink mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue"
            required
          />
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-line rounded-xl text-[13.5px] font-semibold hover:bg-cream transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 bg-blue text-white rounded-xl text-[13.5px] font-semibold hover:bg-blueDeep transition-colors"
        >
          Add Student
        </button>
      </div>
    </form>
  );
}

function EditStudentForm({
  student,
  onSubmit,
  onCancel,
}: {
  student: StudentWithStatus;
  onSubmit: (updates: Partial<StudentWithStatus>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: student.name,
    email: student.email,
    coursesEnrolled: student.coursesEnrolled,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-[13px] font-bold text-ink mb-2">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue"
            required
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-ink mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue"
            required
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-ink mb-2">
            Courses Enrolled
          </label>
          <input
            type="number"
            value={formData.coursesEnrolled}
            onChange={(e) =>
              setFormData({
                ...formData,
                coursesEnrolled: parseInt(e.target.value),
              })
            }
            className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue"
            min="0"
          />
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-line rounded-xl text-[13.5px] font-semibold hover:bg-cream transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 bg-blue text-white rounded-xl text-[13.5px] font-semibold hover:bg-blueDeep transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
