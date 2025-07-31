import { TeacherDashboard } from "@/components/teacher-dashboard/teacher-dashboard"

export default function TeacherPage({ params }: { params: { id: string } }) {
  return <TeacherDashboard teacherId={params.id} />
}
