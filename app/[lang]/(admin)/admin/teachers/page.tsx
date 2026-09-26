"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Trash2,
  Star,
  Plus,
  Edit,
  Check,
  X,
  MoreVertical,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { TeacherProfile } from "@/lib/teachers-directory";
import { isApiConfigured } from "@/lib/is-api-configured";
import {
  createAdminTeacher,
  deleteAdminTeacher,
  listAdminTeachers,
  setAdminTeacherStatus,
  updateAdminTeacher,
} from "@/lib/api/admin";
import AdminDataSourceBanner from "@/components/admin/AdminDataSourceBanner";

type TeacherWithStatus = TeacherProfile & {
  status: "active" | "pending" | "suspended";
};

export default function AdminTeachersPage() {
  const { t, href } = useLanguage();
  const s = t("adminTeachersPage");

  const [teachers, setTeachers] = useState<TeacherWithStatus[]>([]);
  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] =
    useState<TeacherWithStatus | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!isApiConfigured()) {
      setApiError(
        "Backend API URL is not configured. Teacher data is unavailable.",
      );
      setIsLoading(false);
      return;
    }

    listAdminTeachers({ pageSize: 100 })
      .then((result) => {
        setTeachers(
          result.items.map((teacher) => ({
            id: teacher.id,
            name: teacher.fullName,
            avatar: teacher.avatarUrl || "/images/Women teacher1.jpeg",
            teachingLanguage: teacher.teachingLanguage,
            subject: teacher.subject,
            level: teacher.level,
            rating: teacher.rating,
            bio: teacher.bio,
            slots: [],
            status: teacher.status,
          })),
        );
      })
      .catch((error) =>
        setApiError(
          error instanceof Error ? error.message : "Could not load teachers",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = teachers.filter(
    (tc) =>
      tc.name.toLowerCase().includes(query.toLowerCase()) ||
      tc.subject.toLowerCase().includes(query.toLowerCase()),
  );

  const remove = async (id: string) => {
    if (!isApiConfigured()) return;
    if (!window.confirm(s.confirmDelete)) return;
    try {
      await deleteAdminTeacher(id);
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Could not delete teacher",
      );
      return;
    }
    setTeachers((prev) => prev.filter((tc) => tc.id !== id));
  };

  const setStatus = async (id: string, status: TeacherWithStatus["status"]) => {
    if (!isApiConfigured()) return;
    try {
      await setAdminTeacherStatus(id, status);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Could not update teacher status",
      );
      return;
    }
    setTeachers((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, status } : tc)),
    );
  };

  const approveTeacher = (id: string) => setStatus(id, "active");

  const suspendTeacher = (id: string) => setStatus(id, "suspended");

  const addTeacher = async (teacher: Omit<TeacherWithStatus, "id">) => {
    if (!isApiConfigured()) return;
    try {
      const created = await createAdminTeacher({
        fullName: teacher.name,
        email: `${teacher.name.toLowerCase().replace(/\s+/g, ".")}@seone.local`,
        subject: teacher.subject,
        level: teacher.level,
        teachingLanguage: teacher.teachingLanguage,
        bio: teacher.bio,
        avatarUrl: teacher.avatar,
      });
      setTeachers((prev) => [
        ...prev,
        {
          id: created.id,
          name: created.fullName,
          avatar: created.avatarUrl || teacher.avatar,
          teachingLanguage: created.teachingLanguage,
          subject: created.subject,
          level: created.level,
          rating: created.rating,
          bio: created.bio,
          slots: [],
          status: created.status,
        },
      ]);
      setShowAddModal(false);
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Could not create teacher",
      );
    }
  };

  const updateTeacher = async (
    id: string,
    updates: Partial<TeacherWithStatus>,
  ) => {
    if (!isApiConfigured()) return;
    try {
      await updateAdminTeacher(id, {
        fullName: updates.name,
        avatarUrl: updates.avatar,
        teachingLanguage: updates.teachingLanguage,
        subject: updates.subject,
        level: updates.level,
        bio: updates.bio,
      });
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Could not update teacher",
      );
      return;
    }
    setTeachers((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, ...updates } : tc)),
    );
    setEditingTeacher(null);
  };

  const getStatusBadge = (status: TeacherWithStatus["status"]) => {
    const styles = {
      active: "bg-sage text-sageDeep",
      pending: "bg-[#FDEFE0] text-[#B8792E]",
      suspended: "bg-danger/10 text-danger",
    };
    const labels = {
      active: "Active",
      pending: "Pending",
      suspended: "Suspended",
    };
    return (
      <span
        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div>
      <AdminDataSourceBanner apiError={apiError} />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5 bg-white border border-line rounded-full px-4 py-2.5 shadow-card max-w-[320px]">
          <Search size={16} className="text-muted shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={s.searchPlaceholder}
            className="flex-1 min-w-0 outline-none text-[13.5px] placeholder:text-muted bg-transparent"
          />
        </div>
        {isApiConfigured() && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue text-white rounded-full px-4 py-2.5 text-[13.5px] font-semibold hover:bg-blueDeep transition-colors"
          >
            <Plus size={16} />
            Add Teacher
          </button>
        )}
      </div>

      <div className="bg-white border border-line rounded-lg shadow-card overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-cream border-b border-line">
              {[
                s.colName,
                s.colSubject,
                s.colLevel,
                s.colRating,
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
            {filtered.map((tc) => (
              <tr
                key={tc.id}
                className="border-b border-line last:border-none hover:bg-cream/60"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Image
                      src={tc.avatar}
                      alt={tc.name}
                      width={34}
                      height={34}
                      className="rounded-full object-cover shrink-0"
                    />
                    <div>
                      <Link
                        href={href(`/admin/teachers/${tc.id}`)}
                        className="text-[13.5px] font-semibold block text-blue hover:underline"
                      >
                        {tc.name}
                      </Link>
                      <span className="text-[11px] text-muted">
                        {tc.teachingLanguage}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-ink70">
                  {tc.subject}
                </td>
                <td className="px-5 py-3.5 text-[13px] text-ink70">
                  {tc.level}
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink70">
                    <Star size={13} className="text-gold" fill="currentColor" />
                    {tc.rating.toFixed(1)}
                  </span>
                </td>
                <td className="px-5 py-3.5">{getStatusBadge(tc.status)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    {tc.status === "pending" && (
                      <button
                        onClick={() => approveTeacher(tc.id)}
                        className="inline-flex items-center gap-1 text-[12px] font-bold text-sageDeep bg-sage hover:bg-sage/80 px-3 py-1.5 rounded-full transition-colors"
                      >
                        <Check size={13} />
                        Approve
                      </button>
                    )}
                    {tc.status === "active" && (
                      <button
                        onClick={() => suspendTeacher(tc.id)}
                        className="inline-flex items-center gap-1 text-[12px] font-bold text-danger bg-danger/10 hover:bg-danger/15 px-3 py-1.5 rounded-full transition-colors"
                      >
                        <X size={13} />
                        Suspend
                      </button>
                    )}
                    <button
                      onClick={() => setEditingTeacher(tc)}
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue bg-blue/10 hover:bg-blue/15 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <Edit size={13} />
                      Edit
                    </button>
                    <button
                      onClick={() => remove(tc.id)}
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold text-danger bg-danger/10 hover:bg-danger/15 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <Trash2 size={13} />
                      {s.deleteBtn}
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
                  Loading teachers…
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

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-card max-w-md w-full p-6">
            <h3 className="font-serif text-[20px] font-semibold mb-4">
              Add New Teacher
            </h3>
            <AddTeacherForm
              onSubmit={addTeacher}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-card max-w-md w-full p-6">
            <h3 className="font-serif text-[20px] font-semibold mb-4">
              Edit Teacher
            </h3>
            <EditTeacherForm
              teacher={editingTeacher}
              onSubmit={(updates) => updateTeacher(editingTeacher.id, updates)}
              onCancel={() => setEditingTeacher(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AddTeacherForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (teacher: Omit<TeacherWithStatus, "id">) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<{
    name: string;
    subject: string;
    level: string;
    teachingLanguage: "english" | "german";
    bio: string;
    avatar: string;
  }>({
    name: "",
    subject: "",
    level: "",
    teachingLanguage: "english",
    bio: "",
    avatar: "/images/Women teacher1.jpeg",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      rating: 0,
      slots: [],
      status: "pending" as const,
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
            Subject
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue"
            required
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-ink mb-2">
            Level
          </label>
          <input
            type="text"
            value={formData.level}
            onChange={(e) =>
              setFormData({ ...formData, level: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue"
            required
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-ink mb-2">
            Teaching Language
          </label>
          <select
            value={formData.teachingLanguage}
            onChange={(e) =>
              setFormData({
                ...formData,
                teachingLanguage: e.target.value as "english" | "german",
              })
            }
            className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue"
          >
            <option value="english">English</option>
            <option value="german">German</option>
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-ink mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue h-24 resize-none"
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
          Add Teacher
        </button>
      </div>
    </form>
  );
}

function EditTeacherForm({
  teacher,
  onSubmit,
  onCancel,
}: {
  teacher: TeacherWithStatus;
  onSubmit: (updates: Partial<TeacherWithStatus>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<{
    name: string;
    subject: string;
    level: string;
    teachingLanguage: "english" | "german";
    bio: string;
    rating: number;
  }>({
    name: teacher.name,
    subject: teacher.subject,
    level: teacher.level,
    teachingLanguage: teacher.teachingLanguage,
    bio: teacher.bio,
    rating: teacher.rating,
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
            Subject
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue"
            required
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-ink mb-2">
            Level
          </label>
          <input
            type="text"
            value={formData.level}
            onChange={(e) =>
              setFormData({ ...formData, level: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue"
            required
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-ink mb-2">
            Rating
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={formData.rating}
            onChange={(e) =>
              setFormData({ ...formData, rating: parseFloat(e.target.value) })
            }
            className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue"
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-ink mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue h-24 resize-none"
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
