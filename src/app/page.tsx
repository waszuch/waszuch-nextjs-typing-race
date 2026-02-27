"use client";

import { useAuth } from "@/components/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { user, isLoading, error } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Typing Race</h1>
      <p className="text-muted-foreground">
        Real-time typing competition — coming soon.
      </p>

      {isLoading && <Skeleton className="h-6 w-48" />}

      {error && (
        <p className="text-sm text-destructive">Auth error: {error}</p>
      )}

      {user && (
        <Badge variant="secondary">
          Connected as {user.id.slice(0, 8)}...
        </Badge>
      )}
    </main>
  );
}
