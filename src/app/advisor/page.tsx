"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function AdvisorIndex() {
  const router = useRouter();
  useEffect(() => { router.replace("/advisor/dashboard"); }, [router]);
  return null;
}
