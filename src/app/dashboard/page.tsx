import StudyStatus from "@/components/dashboard/StudyStatus";

export default function DashboardPage() {
    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-6">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StudyStatus />
                <div className="p-6 border rounded-lg shadow-sm bg-card">
                    <h3 className="font-semibold mb-2">Recent Activity</h3>
                    <p className="text-muted-foreground text-sm">No recent activity.</p>
                </div>
                <div className="p-6 border rounded-lg shadow-sm bg-card">
                    <h3 className="font-semibold mb-2">Upcoming Tasks</h3>
                    <p className="text-muted-foreground text-sm">No tasks scheduled.</p>
                </div>
            </div>
        </div>
    );
}
