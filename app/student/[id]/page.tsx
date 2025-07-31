import { StudentDashboard } from "@/components/student-dashboard/student-dashboard"

export default function StudentPage({ params }: { params: { id: string } }) {
  return <StudentDashboard studentId={params.id} />
}
