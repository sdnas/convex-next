"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Image } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "./ui/separator";

export function Book() {
  const books = useQuery(api.books.list) || [];
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = useQuery(api.books.search, { query: searchQuery });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const displayBooks = searchQuery.trim() ? searchResults || [] : books;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Books</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingBook(null)}>
              <Plus className="w-4 h-4" />
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBook ? "Edit Book" : "Add New Book"}
              </DialogTitle>
            </DialogHeader>
            <BookForm
              book={editingBook}
              onClose={() => {
                setIsDialogOpen(false);
                setEditingBook(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search books by title or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayBooks.map((book) => (
          <BookCard
            key={book._id}
            book={book}
            onEdit={() => {
              setEditingBook(book);
              setIsDialogOpen(true);
            }}
          />
        ))}
      </div>

      {displayBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {searchQuery.trim()
              ? "No books found matching your search."
              : "No books in your library yet."}
          </p>
        </div>
      )}
    </div>
  );
}

function BookCard({ book, onEdit }) {
  const removeBook = useMutation(api.books.remove);
  const updateBook = useMutation(api.books.update);

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
    <Card className="overflow-hidden">
      {book.imageUrl && (
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
        <p className="text-sm text-muted-foreground">by {book.author}</p>
        <p className="text-sm text-muted-foreground">{book.description}</p>
        <p className="text-xs text-muted-foreground">{book.genre}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge
          className={
            book.availability
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }
        >
          {book.availability ? "Available" : "Unavailable"}
        </Badge>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAvailability}
            className="flex-1"
          >
            {book.availability ? "Mark Unavailable" : "Mark Available"}
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BookForm({ book, onClose }) {
  const [title, setTitle] = useState(book?.title || "");
  const [author, setAuthor] = useState(book?.author || "");
  const [description, setDescription] = useState(book?.description || "");
  const [genre, setGenre] = useState(book?.genre || "");
  const [availability, setAvailability] = useState(book?.availability ?? true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createBook = useMutation(api.books.create);
  const updateBook = useMutation(api.books.update);
  const generateUploadUrl = useMutation(api.books.generateUploadUrl);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !genre.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageId = book?.imageId;

      if (selectedImage) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });
        const json = await result.json();
        if (!result.ok) {
          throw new Error(`Upload failed: ${JSON.stringify(json)}`);
        }
        imageId = json.storageId;
      }

      if (book) {
        await updateBook({
          id: book._id,
          title: title.trim(),
          author: author.trim(),
          description: description.trim(),
          genre: genre.trim(),
          availability,
          imageId,
        });
        toast.success("Book updated successfully");
      } else {
        await createBook({
          title: title.trim(),
          author: author.trim(),
          descripton: description.trim(),
          genre: genre.trim(),
          availability,
          imageId,
        });
        toast.success("Book created successfully");
      }

      onClose();
    } catch (error) {
      toast.error(book ? "Failed to update book" : "Failed to create book");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="author">Author *</Label>
        <Input
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="genre">Genre *</Label>
        <Input
          id="genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="e.g., Fiction, Mystery, Romance"
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="availability"
          checked={availability}
          onCheckedChange={setAvailability}
        />
        <Label htmlFor="availability">Available</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Book Cover Image</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
        />
      </div>

      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-sm text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>

      <div className="space-y-2">
        <Button className="w-full" variant="outline">
          <Image /> Generate Cover
        </Button>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Saving..." : book ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
