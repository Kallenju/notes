export interface Note {
  id: string;
  title: string | null;
  text: string | null;
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}
