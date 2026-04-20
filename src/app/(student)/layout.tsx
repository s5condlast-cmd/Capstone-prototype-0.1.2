import StudentLayout from "@/components/StudentLayout";

export default function StudentRoutesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <StudentLayout activeNav="dashboard">{children}</StudentLayout>;
}
