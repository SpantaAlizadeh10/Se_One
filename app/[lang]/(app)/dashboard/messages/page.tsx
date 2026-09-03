import MessagesView from "@/components/messages/MessagesView";

export default function MessagesPage() {
  return (
    <div>
      <p className="text-muted text-[14px] -mt-2 mb-6">Chat with your teachers and course support.</p>
      <MessagesView />
    </div>
  );
}
