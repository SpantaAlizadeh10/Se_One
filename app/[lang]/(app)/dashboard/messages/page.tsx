import MessagesHub from "@/components/messages/MessagesHub";

export const dynamic = "force-dynamic";

export default function MessagesPage() {
  return (
    <div>
      <p className="text-muted text-[14px] -mt-2 mb-6">
        Chat with your teachers, share exercise files, and keep course questions
        together.
      </p>
      <MessagesHub />
    </div>
  );
}
