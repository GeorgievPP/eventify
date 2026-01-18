export type HistoryItemsDiff = {
  added: { postId: string; title: string; quantity: number }[];
  removed: { postId: string; title: string; quantity: number }[];
  changed: { title: string; before: number; after: number }[];
};
