"use client";

import { useEffect, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image,
  Table,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "./ui/separator";
import Modal from "./Modal";

export function Book() {
  const books = useQuery(api.books.list) || [];
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = useQuery(api.books.search, { query: searchQuery });
  const [editingBook, setEditingBook] = useState(null);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortField, setSortField] = useState("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredBooks = (
    searchQuery.trim() ? searchResults || [] : books
  ).filter((book) => selectedGenre === "All" || book.genre === selectedGenre);

  const displayBooks = filteredBooks;

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    const aVal = a[sortField]?.toString().toLowerCase() ?? "";
    const bVal = b[sortField]?.toString().toLowerCase() ?? "";

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBooks = sortedBooks.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(displayBooks.length / itemsPerPage);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Books</h1>
        <div className="flex items-center gap-4">
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
          </div>

          <Button
            onClick={() => {
              setEditingBook(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Book
          </Button>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingBook ? "Edit Book" : "Add New Book"}
              </h2>
              <BookForm
                book={editingBook}
                onClose={() => {
                  setIsModalOpen(false);
                  setEditingBook(null);
                }}
              />
            </div>
          </Modal>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div>
          <select
            value={selectedGenre}
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              setCurrentPage(1);
            }}
            className="w-[300px] border px-3 py-2 rounded"
          >
            <option value="All">All Genres</option>
            {[...new Set(books.map((b) => b.genre))].map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search books by title or author..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 w-full"
          />
        </div>
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
                    setIsModalOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <BookTable
              books={currentBooks}
              onEdit={(book) => {
                setEditingBook(book);
                setIsModalOpen(true);
              }}
              onSort={handleSort}
              sortField={sortField}
              sortOrder={sortOrder}
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
          className={`absolute top-2 left-2 text-xs rounded-full px-2 py-1
        ${
          book.availability
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }
      `}
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

        <CardContent className="flex flex-col flex-1 px-4 pb-4 space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3.75rem]">
            {book.description}
          </p>

          <div className="mt-auto">
            <Badge className="bg-indigo-100 text-indigo-700 rounded-full px-2 py-1 text-xs">
              {book.genre}
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
      </div>
    </Card>
  );
}

function BookTable({ books, onEdit, onSort, sortField, sortOrder }) {
  const removeBook = useMutation(api.books.remove);
  const handleDelete = async (book) => {
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
            <th className="px-4 py-2 text-left" onClick={() => onSort("title")}>
              Title{" "}
              {sortField === "title" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </th>
            <th className="px-4 py-2 text-left">Author</th>
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

function BookForm({ book, onClose }) {
  const [title, setTitle] = useState(book?.title || "");
  const [author, setAuthor] = useState(book?.author || "");
  const [description, setDescription] = useState(book?.description || "");
  const [genre, setGenre] = useState(book?.genre || "");
  const [availability, setAvailability] = useState(book?.availability ?? true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageId, setImageId] = useState(null);
  const [generatedImageFile, setGeneratedImageFile] = useState(null);
  const [generatedImagePreview, setGeneratedImagePreview] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const createBook = useMutation(api.books.create);
  const updateBook = useMutation(api.books.update);
  const generateUploadUrl = useMutation(api.books.generateUploadUrl);
  const generateCoverImage = useAction(api.ai.aiGeneratedImage);
  const imageUrl = useQuery(
    api.books.getStorageUrl,
    imageId ? { id: imageId } : "skip"
  );

  const fileInputRef = useRef(null);

  const onSelectImage = (file) => {
    setSelectedImage(file);
    setGeneratedImageFile(null);
    setGeneratedImagePreview(null);
  };

  useEffect(() => {
    if (!selectedImage) {
      setSelectedImagePreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedImage);
    setSelectedImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

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

    setIsGenerating(true);

    try {
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

      setSelectedImage(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setGeneratedImageFile(file);

      setGeneratedImagePreview(URL.createObjectURL(file));

      toast.success("Cover generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate cover");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto"
    >
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div>
            <Label
              htmlFor="title"
              className="text-gray-500 mb-1 block text-sm font-medium"
            >
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border border-gray-300 rounded-md px-4 py-3 w-full transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <Label
              htmlFor="author"
              className="text-gray-500 mb-1 block text-sm font-medium"
            >
              Author *
            </Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              className="border border-gray-300 rounded-md px-4 py-3 w-full transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <Label
              htmlFor="genre"
              className="text-gray-500 mb-1 block text-sm font-medium"
            >
              Genre *
            </Label>
            <Input
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g., Fiction, Mystery, Romance"
              required
              className="border border-gray-300 rounded-md px-4 py-3 w-full transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <Label
              htmlFor="description"
              className="text-gray-500 mb-1 block text-sm font-medium"
            >
              Description *
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="border border-gray-300 rounded-md p-4 w-full max-h-40 resize-y transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="availability"
              checked={availability}
              onCheckedChange={setAvailability}
              className="w-5 h-5 text-indigo-600"
            />
            <Label htmlFor="availability" className="text-gray-600">
              Available
            </Label>
          </div>
        </div>

        <div className="w-full md:w-1/3 space-y-6">
          <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            {selectedImagePreview ? (
              <img
                src={selectedImagePreview}
                alt="Selected Book Cover"
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
              />
            ) : imageUrl || generatedImagePreview || book?.imageUrl ? (
              <img
                src={imageUrl || generatedImagePreview || book?.imageUrl}
                alt="Book Cover"
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Image Preview
              </div>
            )}
          </div>

          <Input
            ref={fileInputRef}
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => onSelectImage(e.target.files?.[0] || null)}
            className="w-full"
          />

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-sm text-gray-400 uppercase tracking-wide">
              or
            </span>
            <Separator className="flex-1" />
          </div>

          <Button
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-md hover:shadow-xl transition-shadow rounded-lg px-6 py-3"
            variant="none"
            disabled={isSubmitting || isGenerating}
            onClick={handleGenerateCover}
          >
            <Image className="w-5 h-5 mr-2" />
            {isGenerating ? "Generating..." : "Generate Cover"}
          </Button>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isGenerating}
          className="flex-1 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          {isSubmitting
            ? "Saving..."
            : isGenerating
              ? "Generating..."
              : book
                ? "Update"
                : "Create"}
        </Button>
      </div>
    </form>
  );
}
