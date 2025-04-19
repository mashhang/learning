import crypto from "crypto";
function hashToDecimal(id, precision = 6) {
    const hash = crypto.createHash("sha256").update(id).digest("hex");
    const slice = hash.slice(0, 8); // take first 8 hex digits
    const intValue = parseInt(slice, 16);
    return parseFloat(((intValue % 1000000) / 100000000).toFixed(precision)); // e.g., 0.123456
}
export function prioritizeLessons(lessons) {
    const scores = lessons.map((l) => l.score);
    const completions = lessons.map((l) => (l.isCompleted ? 1 : 0));
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const normalized = scores.map((s) => (max - s) / (max - min || 1));
    const priorities = normalized.map((n, i) => {
        const base = n * (1 - completions[i]);
        const tieBreaker = hashToDecimal(lessons[i].lessonId);
        return parseFloat((base + tieBreaker).toFixed(6));
    });
    return lessons.map((lesson, i) => ({
        lessonId: lesson.lessonId,
        priority: priorities[i],
    }));
}
