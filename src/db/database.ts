import Dexie, { type Table } from "dexie";
import type {
  Attempt,
  Progress,
  Session,
  Bookmark,
  Settings,
  Goal,
} from "../types";
export class DojoDB extends Dexie {
  answerAttempts!: Table<Attempt, string>;
  questionProgress!: Table<Progress, string>;
  studySessions!: Table<Session, string>;
  bookmarks!: Table<Bookmark, string>;
  glossaryBookmarks!: Table<Bookmark, string>;
  userSettings!: Table<Settings, string>;
  studyGoals!: Table<Goal, string>;
  privateMaterials!: Table<
    {
      id: string;
      name: string;
      file: Blob;
      addedAt: number;
      page: number;
      checkedQuestions?: number[];
    },
    string
  >;
  constructor(name = "az900-dojo") {
    super(name);
    this.version(1).stores({
      answerAttempts: "id,questionId,answeredAt,sessionId,mode",
      questionProgress: "questionId,lastAnsweredAt",
      studySessions: "id,status,updatedAt",
      bookmarks: "id",
      glossaryBookmarks: "id",
      userSettings: "id",
      studyGoals: "id",
    });
    this.version(2)
      .stores({ privateMaterials: "id,addedAt" })
      .upgrade((tx) =>
        tx
          .table("userSettings")
          .toCollection()
          .modify((s) => {
            s.autoAdvanceSeconds ??= 5;
          }),
      );
  }
}
export const db = new DojoDB();
