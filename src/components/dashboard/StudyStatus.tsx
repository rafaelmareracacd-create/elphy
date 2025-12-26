
"use client"

export default function StudyStatus() {
    return (
        <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">Study Status</h3>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span>Daily Goal</span>
                        <span>75%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[75%]" />
                    </div>
                </div>
                <div className="text-sm text-muted-foreground">
                    <p>🔥 12 Day Streak</p>
                    <p>📚 45 Questions Today</p>
                </div>
            </div>
        </div>
    )
}
