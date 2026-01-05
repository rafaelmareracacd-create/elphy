export type Rating = "again" | "hard" | "good" | "easy";

export interface CardState {
    interval: number; // in days
    easeFactor: number;
    nextReview: Date;
}

/**
 * Custom Adaptive Repetition Algorithm (ARA)
 * Based on SM-2 but modified to penalize high latency ("Slow thinking").
 *
 * @param rating User feedback: "again", "hard", "good", "easy"
 * @param lastInterval Previous interval in days
 * @param lastEase Previous ease factor
 * @param latencyMs Time taken to answer in milliseconds
 */
export function calculateNextReview(
    rating: Rating,
    lastInterval: number,
    lastEase: number,
    latencyMs: number
): CardState {
    let newInterval = 0;
    let newEase = lastEase;

    // 1. Latency Penalty Logic
    // If user marks "easy" but takes > 9 seconds, we suspect weak connection.
    // Penalize ease factor by 10% (0.10 drop or 10% of value? implementation choice: drop raw value slightly)
    if (rating === "easy" && latencyMs > 9000) {
        newEase = Math.max(1.3, newEase - 0.15); // Significant penalty
        // Downgrade effective rating logic or just apply penalty? We apply penalty to Ease.
    }

    // 2. SM-2 Standard Logic (Simplified)
    // Rating conversion: again=0, hard=3, good=4, easy=5 (SM-2 uses 0-5)
    // We map our buttons: Again(0), Hard(3), Good(4), Easy(5)
    let quality = 0;
    switch (rating) {
        case "again": quality = 0; break;
        case "hard": quality = 3; break;
        case "good": quality = 4; break;
        case "easy": quality = 5; break;
    }

    if (quality >= 3) {
        // Correct response
        if (lastInterval === 0) {
            newInterval = 1;
        } else if (lastInterval === 1) {
            newInterval = 6;
        } else {
            newInterval = Math.round(lastInterval * lastEase);
        }
    } else {
        // Incorrect response (Again)
        newInterval = 0; // Reset to 0 (review same day/immediately) (or 1 depending on strictness)
        // SM-2 often resets interval, but keeps ease unchanged or lowers it?
        // SM-2: NewEase = OldEase + (0.1-(5-q)*(0.08+(5-q)*0.02))
        // We will stick to a simpler update for now if "Again"
    }

    // Update Ease Factor
    // Formula: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
    newEase = newEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    // Clamp to minimum 1.3 (SM-2 recommendation) and round to 2 decimals to avoid floating-point precision issues
    newEase = Math.max(1.3, Math.round(newEase * 100) / 100);

    // 3. Calculate Next Date
    // If interval is 0, we might want it "Now" or "Tomorrow". Let's say 0 means < 1 day (minutes).
    // For simplicity in this engine, we return Date objects.
    const now = new Date();
    const nextReviewDate = new Date();

    if (newInterval === 0) {
        // Again: Review in 1 minute? Or same day. Let's say +10 minutes
        nextReviewDate.setMinutes(now.getMinutes() + 10);
    } else {
        nextReviewDate.setDate(now.getDate() + newInterval);
    }

    return {
        interval: newInterval,
        easeFactor: newEase,
        nextReview: nextReviewDate,
    };
}
