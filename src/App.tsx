import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6">
      <Button className="gap-2" size="lg">
        <Sparkles aria-hidden="true" />
        Hello, world!
      </Button>
    </main>
  );
}