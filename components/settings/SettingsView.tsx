"use client";

import { useState } from "react";
import Image from "next/image";
import { User, Bell, Lock } from "lucide-react";
import Toggle from "@/components/settings/Toggle";

const tabs = [
  { id: "profile", label: "Profile", Icon: User },
  { id: "notifications", label: "Notifications", Icon: Bell },
  { id: "security", label: "Security", Icon: Lock }
] as const;

type TabId = (typeof tabs)[number]["id"];

const fieldClass =
  "border border-line rounded-[10px] px-3.5 py-2.5 text-[13.5px] bg-cream outline-none focus:border-gold focus:bg-white transition-colors w-full";
const labelClass = "text-[12.5px] font-semibold text-ink70";

export default function SettingsView() {
  const [tab, setTab] = useState<TabId>("profile");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 lg:gap-6 items-start">
      <div className="bg-white border border-line rounded-md p-2.5 shadow-card flex lg:flex-col gap-1.5 lg:gap-0 overflow-x-auto thin-scroll">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2.5 shrink-0 lg:w-full text-start px-3 py-2.5 rounded-[10px] text-[13.5px] mb-0 lg:mb-0.5 whitespace-nowrap ${
              tab === id ? "bg-ink text-white font-semibold" : "text-ink70 font-medium hover:bg-cream"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div>
        {tab === "profile" && (
          <div className="bg-white border border-line rounded-lg shadow-card p-5 sm:p-7">
            <h3 className="text-[18px] font-semibold mb-1">Profile</h3>
            <p className="text-muted text-[13px] mb-6">
              This information is visible to your teachers and study group.
            </p>

            <div className="flex items-center gap-4 mb-6.5 pb-6.5 border-b border-line" style={{ marginBottom: 26, paddingBottom: 26 }}>
              <Image
                src="https://i.pravatar.cc/120?img=13"
                alt="Sepanta"
                width={66}
                height={66}
                className="rounded-full object-cover"
              />
              <div className="flex gap-2.5">
                <button className="bg-white border border-line text-ink px-3.5 py-2.5 rounded-[9px] text-[12.5px] font-semibold hover:border-ink transition-colors">
                  Upload new photo
                </button>
                <button className="bg-white border border-danger/30 text-danger px-3.5 py-2.5 rounded-[9px] text-[12.5px] font-semibold">
                  Remove
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mb-4.5" style={{ gap: 18 }}>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>First name</label>
                <input defaultValue="Sepanta" className={fieldClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Last name</label>
                <input defaultValue="Rostami" className={fieldClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Email address</label>
                <input type="email" dir="ltr" defaultValue="sepanta@example.com" className={fieldClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Phone number</label>
                <input type="tel" defaultValue="+49 151 000 0000" className={fieldClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Current level</label>
                <select className={fieldClass} defaultValue="B1">
                  <option value="A1">A1 — Beginner</option>
                  <option value="B1">B1 — Intermediate</option>
                  <option value="C1">C1 — Advanced</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Time zone</label>
                <select className={fieldClass} defaultValue="CET">
                  <option value="CET">Central European Time (CET)</option>
                  <option value="GMT">Greenwich Mean Time (GMT)</option>
                  <option value="ET">Eastern Time (ET)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className={labelClass}>Bio</label>
                <textarea
                  className={fieldClass}
                  rows={3}
                  defaultValue="Learning English for work and travel. Aiming for a B2 certificate by the end of the year."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button className="bg-white border border-line text-ink px-3.5 py-2.5 rounded-[9px] text-[12.5px] font-semibold">
                Cancel
              </button>
              <button className="bg-ink text-white px-5 py-3 rounded-[11px] text-[13.5px] font-semibold hover:bg-blueDeep transition-colors">
                Save changes
              </button>
            </div>
          </div>
        )}

        {tab === "notifications" && (
          <div className="bg-white border border-line rounded-lg shadow-card p-5 sm:p-7">
            <h3 className="text-[18px] font-semibold mb-1">Notifications</h3>
            <p className="text-muted text-[13px] mb-6">
              Choose what you&apos;d like to be notified about, and how.
            </p>

            {[
              { title: "Upcoming class reminders", desc: "Get a reminder 30 minutes before class starts.", on: true },
              { title: "Assignment due dates", desc: "Alerts when an assignment is due within 24 hours.", on: true },
              { title: "New messages", desc: "Notify me when a teacher or coach messages me.", on: true },
              { title: "Grades & feedback", desc: "Notify me as soon as an assignment is graded.", on: true },
              { title: "Product news & tips", desc: "Occasional emails about new courses and features.", on: false }
            ].map((row, i, arr) => (
              <div
                key={row.title}
                className={`flex items-center justify-between py-4 ${i !== arr.length - 1 ? "border-b border-line" : ""}`}
              >
                <div>
                  <div className="text-[13.5px] font-semibold">{row.title}</div>
                  <div className="text-[12px] text-muted mt-0.5">{row.desc}</div>
                </div>
                <Toggle defaultChecked={row.on} />
              </div>
            ))}

            <div className="flex justify-end mt-4">
              <button className="bg-ink text-white px-5 py-3 rounded-[11px] text-[13.5px] font-semibold hover:bg-blueDeep transition-colors">
                Save preferences
              </button>
            </div>
          </div>
        )}

        {tab === "security" && (
          <div className="bg-white border border-line rounded-lg shadow-card p-5 sm:p-7">
            <h3 className="text-[18px] font-semibold mb-1">Security</h3>
            <p className="text-muted text-[13px] mb-6">
              Keep your account safe with a strong password and extra verification.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mb-6" style={{ gap: 18 }}>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className={labelClass}>Current password</label>
                <input type="password" dir="ltr" defaultValue="••••••••••" className={fieldClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>New password</label>
                <input type="password" dir="ltr" placeholder="Enter new password" className={fieldClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Confirm new password</label>
                <input type="password" dir="ltr" placeholder="Re-enter new password" className={fieldClass} />
              </div>
            </div>
            <div className="flex justify-end mb-6">
              <button className="bg-ink text-white px-5 py-3 rounded-[11px] text-[13.5px] font-semibold hover:bg-blueDeep transition-colors">
                Update password
              </button>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-line mb-2">
              <div>
                <div className="text-[13.5px] font-semibold">Two-factor authentication</div>
                <div className="text-[12px] text-muted mt-0.5">
                  Add an extra step when signing in from a new device.
                </div>
              </div>
              <Toggle defaultChecked />
            </div>

            <div className="border border-danger/30 bg-danger/5 rounded-md px-5 py-4.5 mt-4 flex items-center justify-between gap-4 flex-wrap" style={{ padding: "18px 20px" }}>
              <div>
                <div className="text-[13.5px] font-bold text-danger">Delete your account</div>
                <div className="text-[12px] text-ink70 mt-0.5">
                  This permanently removes your courses, progress, and messages.
                </div>
              </div>
              <button className="bg-white border border-danger/30 text-danger px-3.5 py-2.5 rounded-[9px] text-[12.5px] font-semibold whitespace-nowrap">
                Delete account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
