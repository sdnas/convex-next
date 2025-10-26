import { Id } from "@/convex/_generated/dataModel";

export type Book = {
  _id: Id<"books">;
  title: string;
  author: string;
  description: string;
  genre: string;
  availability: boolean;
  imageId?: Id<"_storage">;
  imageUrl?: string | null;
};
