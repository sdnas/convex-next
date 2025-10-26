"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { Book } from "@/types/book";

type BookFormProps = {
  book: Book | null;
  onClose: () => void;
};

export default function BookForm({ book, onClose }: BookFormProps) {
  const [title, setTitle] = useState(book?.title || "");
  const [author, setAuthor] = useState(book?.author || "");
  const [description, setDescription] = useState(book?.description || "");
  const [genre, setGenre] = useState(book?.genre || "");
  const [availability, setAvailability] = useState(book?.availability ?? true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageId, setImageId] = useState(null);
  const [generatedImageFile, setGeneratedImageFile] = useState<File | null>(
    null
  );
  const [generatedImagePreview, setGeneratedImagePreview] = useState<
    string | null
  >(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const createBook = useMutation(api.books.create);
  const updateBook = useMutation(api.books.update);
  const generateUploadUrl = useMutation(api.books.generateUploadUrl);
  const generateCoverImage = useAction(api.ai.aiGeneratedImage);
  const imageUrl = useQuery(
    api.books.getStorageUrl,
    imageId ? { id: imageId } : "skip"
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvailabilityChange = (checked: CheckedState) => {
    setAvailability(checked === true);
  };

  const onSelectImage = (file: File | null) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        ...(finalImageId ? { imageId: finalImageId } : {}),
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
              onCheckedChange={handleAvailabilityChange}
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
                src={
                  imageUrl ??
                  generatedImagePreview ??
                  book?.imageUrl ??
                  undefined
                }
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
            variant="ghost"
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
