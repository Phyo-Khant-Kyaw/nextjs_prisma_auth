"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function ProtectedPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin");
    },
  });

  if (status === "loading") {
    return <p>Loading....</p>;
  }

  return (
    <>
      <h1>Protected Client Session</h1>
      <pre>{JSON.stringify(session)}</pre>
    </>
  );
}
