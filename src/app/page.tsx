import { Toaster } from "sonner";
import { Book } from "@/components/Book";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 p-8">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  return (
    <div className="max-w-6xl mx-auto">
      <Book />
    </div>
  );
}
