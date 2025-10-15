"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image,
  Table,
  LayoutGrid,
  Divide,
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "./ui/separator";
import { Id } from "../../convex/_generated/dataModel";

export function Book() {
  const books = useQuery(api.books.list) || [];
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = useQuery(api.books.search, { query: searchQuery });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const displayBooks = searchQuery.trim() ? searchResults || [] : books;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBooks = displayBooks.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(displayBooks.length / itemsPerPage);

  return (
    // <div className="container mx-auto p-6 space-y-6">
    //   <div className="flex justify-between items-center">
    //     <h1 className="text-3xl font-bold">Books</h1>
    //     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
    //       <DialogTrigger asChild>
    //         <Button onClick={() => setEditingBook(null)}>
    //           <Plus className="w-4 h-4" />
    //           Add Book
    //         </Button>
    //       </DialogTrigger>
    //       <DialogContent className="w-full max-w-screen-xl">
    //         <DialogHeader>
    //           <DialogTitle>
    //             {editingBook ? "Edit Book" : "Add New Book"}
    //           </DialogTitle>
    //         </DialogHeader>
    //         <BookForm
    //           book={editingBook}
    //           onClose={() => {
    //             setIsDialogOpen(false);
    //             setEditingBook(null);
    //           }}
    //         />
    //       </DialogContent>
    //     </Dialog>
    //   </div>

    //   <div className="relative max-w-md">
    //     <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
    //     <Input
    //       placeholder="Search books by title or author..."
    //       value={searchQuery}
    //       onChange={(e) => setSearchQuery(e.target.value)}
    //       className="pl-10"
    //     />
    //   </div>

    //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    //     {displayBooks.map((book) => (
    //       <BookCard
    //         key={book._id}
    //         book={book}
    //         onEdit={() => {
    //           setEditingBook(book);
    //           setIsDialogOpen(true);
    //         }}
    //       />
    //     ))}
    //   </div>

    //   {displayBooks.length === 0 && (
    //     <div className="text-center py-12">
    //       <p className="text-muted-foreground text-lg">
    //         {searchQuery.trim()
    //           ? "No books found matching your search."
    //           : "No books in your library yet."}
    //       </p>
    //     </div>
    //   )}
    // </div>
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Books</h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            onClick={() => setViewMode("card")}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Card View
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            onClick={() => setViewMode("table")}
          >
            <Table className="w-4 h-4 mr-2" />
            Table View
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingBook(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Book
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-screen-xl">
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
          </Dialog>{" "}
        </div>
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

      {displayBooks.length > 0 ? (
        <div>
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentBooks.map((book) => (
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
          ) : (
            <BookTable
              books={currentBooks}
              onEdit={(book) => {
                setEditingBook(book);
                setIsDialogOpen(true);
              }}
            />
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    size="sm"
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
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
    // <Card className="overflow-hidden">
    //   {book.imageUrl && (
    //     <div className="aspect-[3/4] overflow-hidden">
    //       <img
    //         src={book.imageUrl}
    //         alt={book.title}
    //         className="w-full h-full object-cover"
    //       />
    //     </div>
    //   )}
    //   <CardHeader className="pb-2">
    //     <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
    //     <p className="text-sm text-muted-foreground">by {book.author}</p>
    //     <p className="text-sm text-muted-foreground">{book.description}</p>
    //     <p className="text-xs text-muted-foreground">{book.genre}</p>
    //   </CardHeader>
    //   <CardContent className="space-y-3">
    //     <Badge
    //       className={
    //         book.availability
    //           ? "bg-green-500 text-white"
    //           : "bg-red-500 text-white"
    //       }
    //     >
    //       {book.availability ? "Available" : "Unavailable"}
    //     </Badge>

    //     <div className="flex gap-2">
    //       <Button
    //         variant="outline"
    //         size="sm"
    //         onClick={toggleAvailability}
    //         className="flex-1"
    //       >
    //         {book.availability ? "Mark Unavailable" : "Mark Available"}
    //       </Button>
    //       <Button variant="outline" size="sm" onClick={onEdit}>
    //         <Edit className="w-4 h-4" />
    //       </Button>
    //       <Button variant="outline" size="sm" onClick={handleDelete}>
    //         <Trash2 className="w-4 h-4" />
    //       </Button>
    //     </div>
    //   </CardContent>
    // </Card>
    <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {book.imageUrl && (
        <div className="aspect-[3/4] overflow-hidden rounded-t-md">
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="space-y-1 px-4 pt-4 pb-2">
        <CardTitle className="text-lg font-semibold line-clamp-2">
          {book.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">by {book.author}</p>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {book.description}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-indigo-100 text-indigo-700 rounded-full px-2 py-1 text-xs">
            {book.genre}
          </Badge>
          <Badge
            className={
              book.availability
                ? "bg-green-100 text-green-700 rounded-full px-2 py-1 text-xs"
                : "bg-red-100 text-red-700 rounded-full px-2 py-1 text-xs"
            }
          >
            {book.availability ? "Available" : "Unavailable"}
          </Badge>
        </div>
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
    </Card>
  );
}

function BookTable({ books, onEdit }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-muted rounded-md">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Author</th>
            <th className="px-4 py-2 text-left">Genre</th>
            <th className="px-4 py-2 text-left">Availability</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book._id} className="border-t">
              <td className="px-4 py-2">{book.title}</td>
              <td className="px-4 py-2">{book.author}</td>
              <td className="px-4 py-2">{book.genre}</td>
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
                  onClick={() => {
                    if (confirm("Delete this book?")) {
                      // call your mutation here
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
  const [imageId, setImageId] = useState(null);
  const [generatedImageFile, setGeneratedImageFile] = useState(null);
  const [generatedImagePreview, setGeneratedImagePreview] = useState(null);

  const createBook = useMutation(api.books.create);
  const updateBook = useMutation(api.books.update);
  const generateUploadUrl = useMutation(api.books.generateUploadUrl);
  const generateCoverImage = useAction(api.ai.aiGeneratedImage);
  const imageUrl = useQuery(
    api.books.getStorageUrl,
    imageId ? { id: imageId } : "skip"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !genre.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageId = imageId ?? book?.imageId ?? null;

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
        finalImageId = json.storageId;
      } else if (generatedImageFile) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": "image/jpeg" },
          body: generatedImageFile,
        });
        const json = await result.json();
        if (!result.ok) throw new Error("Upload failed");
        finalImageId = json.storageId;
      }

      const bookData = {
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        genre: genre.trim(),
        availability,
        imageId: finalImageId,
      };

      if (book) {
        await updateBook({
          id: book._id,
          ...bookData,
        });
        toast.success("Book updated successfully");
      } else {
        await createBook(bookData);
        toast.success("Book created successfully");
      }

      onClose();
    } catch (error) {
      toast.error(book ? "Failed to update book" : "Failed to create book");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateCover = async () => {
    if (!title.trim() || !author.trim()) {
      toast.error("Please enter title and author first");
      return;
    }

    setIsSubmitting(true);

    try {
      // const { imageId } = await generateCoverImage({
      //   title: title.trim(),
      //   author: author.trim(),
      // });
      // setImageId(imageId);

      const { base64 } = await generateCoverImage({
        title: title.trim(),
        author: author.trim(),
      });

      const imageBlob = await (
        await fetch(`data:image/jpeg;base64,${base64}`)
      ).blob();
      const file = new File([imageBlob], "ai-cover.jpg", {
        type: "image/jpeg",
      });

      setGeneratedImageFile(file);

      setGeneratedImagePreview(URL.createObjectURL(file));

      toast.success("Cover generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate cover");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
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
        </div>

        <div className="w-1/3 space-y-4">
          {/* <div className="aspect-[3/4] bg-muted rounded-md flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Selected Book Cover"
                className="object-cover w-full h-full"
              />
            ) : book?.imageUrl ? (
              <img
                src={book.imageUrl}
                alt={book.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-muted-foreground">Image Preview</span>
            )}
          </div> */}

          <div className="aspect-[3/4] bg-muted rounded-md flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Uploaded Book Cover"
                className="object-cover w-full h-full"
              />
            ) : generatedImagePreview ? (
              <img
                src={generatedImagePreview}
                alt="AI Generated Book Cover"
                className="object-cover w-full h-full"
              />
            ) : book?.imageUrl ? (
              <img
                src={book.imageUrl}
                alt={book.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-muted-foreground">Image Preview</span>
            )}
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
            <Button
              className="w-full"
              variant="outline"
              disabled={isSubmitting}
              onClick={handleGenerateCover}
            >
              <Image /> Generate Cover
            </Button>
          </div>
        </div>
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
