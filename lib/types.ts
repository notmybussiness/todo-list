export type Filter = "all" | "active" | "completed";

export type Todo = {
  id: string;
  text: string;
  note: string | null;
  start_at: string | null;
  due_at: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type ActionResult = {
  ok: boolean;
  message: string;
};
