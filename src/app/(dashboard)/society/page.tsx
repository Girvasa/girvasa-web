"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SocietyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/settings");
  }, [router]);

  return null;
}
