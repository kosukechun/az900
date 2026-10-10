import { createContext, useContext } from "react";
import type { Question, Term, Category } from "./types";
export const ContentContext = createContext<{
  questions: Question[];
  terms: Term[];
  categories: Category[];
}>({ questions: [], terms: [], categories: [] });
export const useContent = () => useContext(ContentContext);
