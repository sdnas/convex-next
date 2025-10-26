"use client";

import BookCard from "@/components/book/BookCard";
import BookForm from "@/components/book/BookForm";
import BookTable from "@/components/book/BookTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Book } from "@/types/book";
import { useQuery } from "convex/react";
import { LayoutGrid, Plus, Search, Table } from "lucide-react";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";

export default function BookPage() {
  const books = useQuery(api.books.list) || [];
  const genres = useQuery(api.books.getGenres);

  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [paginatedBooks, setPaginatedBooks] = useState<Book[]>([]);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [sortColumn, setSortColumn] = useState<"title" | "author">("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const page = useQuery(api.books.paginateSorted, {
    paginationOpts: {
      numItems: 4,
      cursor: currentCursor,
    },
    sortBy: sortColumn ?? "title",
    sortDirection,
  });

  const hydratedBooks = paginatedBooks
    .map((b) => books.find((full) => full._id === b._id))
    .filter(Boolean) as Book[];

  const filteredBooks = hydratedBooks.filter((book) => {
    const matchesGenre =
      selectedGenre === "All" || book.genre === selectedGenre;
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  useEffect(() => {
    if (page) {
      if (page.page.length === 0 && page.isDone) {
        const prevStack = [...cursorStack];
        const prevCursor = prevStack.pop() ?? null;
        setCursorStack(prevStack);
        setCurrentCursor(prevCursor);
        setPageIndex((prev) => Math.max(1, prev - 1));
      } else {
        setPaginatedBooks(page.page);
        setIsDone(page.isDone);
      }
    }
  }, [page]);

  useEffect(() => {
    setCurrentCursor(null);
    setCursorStack([]);
    setPageIndex(1);
  }, [sortColumn, sortDirection]);

  const goToNext = () => {
    if (!page?.isDone) {
      setCursorStack((prev) => [...prev, currentCursor]);
      setCurrentCursor(page?.continueCursor ?? null);
      setPageIndex((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    const prevStack = [...cursorStack];
    const prevCursor = prevStack.pop() ?? null;
    setCursorStack(prevStack);
    setCurrentCursor(prevCursor);
    setPageIndex((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Books</h1>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "card" ? "default" : "outline"}
                    onClick={() => setViewMode("card")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>

                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    onClick={() => setViewMode("table")}
                  >
                    <Table className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={() => {
                      setEditingBook(null);
                      setIsModalOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Book
                  </Button>

                  <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                  >
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
            </div>

            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              {/* Filter */}
              <div>
                <Select
                  value={selectedGenre}
                  onValueChange={(value) => setSelectedGenre(value)}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="All Genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Genres</SelectItem>
                    {genres?.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books by title or author..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredBooks.length > 0 ? (
              <>
                {viewMode === "card" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBooks.map((book) => (
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
                    books={filteredBooks}
                    onEdit={(book) => {
                      setEditingBook(book);
                      setIsModalOpen(true);
                    }}
                    onSort={(column: keyof Book) => {
                      if (column === "title" || column === "author") {
                        if (sortColumn === column) {
                          setSortDirection((prev) =>
                            prev === "asc" ? "desc" : "asc"
                          );
                        } else {
                          setSortColumn(column);
                          setSortDirection("asc");
                        }
                      }
                    }}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {searchQuery.trim()
                    ? "No books found matching your search."
                    : "No books in your library yet."}
                </p>
              </div>
            )}

            {paginatedBooks.length > 0 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={goToPrev}
                        aria-disabled={cursorStack.length === 0}
                        className={
                          cursorStack.length === 0
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    <PaginationItem>
                      <span className="px-4 py-2 text-sm font-medium text-muted-foreground">
                        Page {pageIndex}
                      </span>
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => {
                          if (!page?.isDone) goToNext();
                        }}
                        aria-disabled={page?.isDone}
                        className={
                          page?.isDone ? "pointer-events-none opacity-50" : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
