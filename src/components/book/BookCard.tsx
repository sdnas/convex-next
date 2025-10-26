"use client";

import { Badge } from "@/components/ui/badge";
import { Book } from "@/types/book";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";

type BookCardProps = {
  book: Book;
  onEdit: () => void;
};

export default function BookCard({ book, onEdit }: BookCardProps) {
  const updateBook = useMutation(api.books.update);
  const removeBook = useMutation(api.books.remove);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this book?")) {
      try {
        await removeBook({ id: book._id });
        toast.success("Book deleted successfully");
      } catch (error) {
        toast.error("Failed to delete book");
      }
    }
  };

  const toggleAvailability = async () => {
    try {
      await updateBook({
        id: book._id,
        title: book.title,
        author: book.author,
        description: book.description,
        genre: book.genre,
        availability: !book.availability,
        imageId: book.imageId,
      });
      toast.success(
        `Book marked as ${!book.availability ? "available" : "unavailable"}`
      );
    } catch (error) {
      toast.error("Failed to update book");
    }
  };

  return (
    <Card className="flex flex-col h-full rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="relative aspect-[3/4] w-full bg-muted flex items-center justify-center">
        {book.imageUrl && (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="max-h-full max-w-full object-contain p-2"
          />
        )}

        <Badge
          className={`absolute top-2 left-2 text-xs rounded-full px-2 py-1 ${book.availability ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {book.availability ? "Available" : "Unavailable"}
        </Badge>
      </div>

      <div className="flex flex-col flex-1 justify-between">
        <CardHeader className="space-y-1 px-4 pt-4 pb-2">
          <CardTitle className="text-lg font-semibold line-clamp-2 min-h-[3rem]">
            {book.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-1">
            by {book.author}
          </p>
        </CardHeader>

        <CardContent className="mt-auto">
          <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3.75rem]">
            {book.description}
          </p>
          <Badge className="bg-indigo-100 text-indigo-700 rounded-full px-2 py-1 text-xs">
            {book.genre}
          </Badge>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAvailability}
              className="flex-1"
            >
              {book.availability ? "Mark Unavailable" : "Mark Available"}
            </Button>

            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>

            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
