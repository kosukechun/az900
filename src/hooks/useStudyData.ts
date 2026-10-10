import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";
import { defaultSettings } from "../types";
export function useStudyData() {
  const data = useLiveQuery(async () => {
    const [
      attempts,
      progress,
      sessions,
      bookmarks,
      glossaryBookmarks,
      settings,
      goal,
    ] = await Promise.all([
      db.answerAttempts.toArray(),
      db.questionProgress.toArray(),
      db.studySessions.toArray(),
      db.bookmarks.toArray(),
      db.glossaryBookmarks.toArray(),
      db.userSettings.get("preferences"),
      db.studyGoals.get("daily"),
    ]);
    return {
      attempts: attempts.sort((a, b) => a.answeredAt - b.answeredAt),
      progress,
      sessions: sessions.sort((a, b) => b.updatedAt - a.updatedAt),
      bookmarks,
      glossaryBookmarks,
      settings: settings ?? defaultSettings,
      goal: goal ?? { id: "daily" as const, count: 10 },
    };
  }, []);
  return data;
}
