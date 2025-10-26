"use client";

import { api } from "@/convex/_generated/api";
import { Book } from "@/types/book";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

type BookTableProps = {
  books: Book[];
  onEdit: (book: Book) => void;
  onSort: (column: keyof Book) => void;
  sortColumn: keyof Book | null;
  sortDirection: "asc" | "desc";
};

export default function BookTable({
  books,
  onEdit,
  onSort,
  sortColumn,
  sortDirection,
}: BookTableProps) {
  const removeBook = useMutation(api.books.remove);

  const handleDelete = async (book: Book) => {
    if (confirm("Are you sure you want to delete this book?")) {
      try {
        await removeBook({ id: book._id });
        toast.success("Book deleted successfully");
      } catch (error) {
        toast.error("Failed to delete book");
      }
    }
  };

  return (
    <div className="overflow-x-auto border border-muted rounded-md">
      <table className="w-full table-auto text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-2 text-left">Cover</th>
            <th
              className="px-4 py-2 text-left cursor-pointer"
              onClick={() => onSort("title")}
            >
              Title{" "}
              {sortColumn === "title" && (sortDirection === "asc" ? "↑" : "↓")}
            </th>

            <th
              className="px-4 py-2 text-left cursor-pointer"
              onClick={() => onSort("author")}
            >
              Author{" "}
              {sortColumn === "author" && (sortDirection === "asc" ? "↑" : "↓")}
            </th>
            <th className="px-4 py-2 text-left">Genre</th>
            <th className="px-4 py-2 text-left">Availability</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No books available.
              </td>
            </tr>
          ) : (
            books.map((book) => (
              <tr
                key={book._id}
                className="border-t hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-2">
                  {book.imageUrl ? (
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="h-12 w-8 object-cover rounded"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No Image
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 max-w-xs truncate" title={book.title}>
                  {book.title}
                </td>
                <td className="px-4 py-2 max-w-xs truncate" title={book.author}>
                  {book.author}
                </td>
                <td className="px-4 py-2 max-w-xs truncate" title={book.genre}>
                  {book.genre}
                </td>
                <td className="px-4 py-2">
                  <Badge
                    className={
                      book.availability
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }
                  >
                    {book.availability ? "Available" : "Unavailable"}
                  </Badge>
                </td>
                <td className="px-4 py-2 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(book)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(book)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
