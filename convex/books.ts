import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const books = await ctx.db.query("books").collect();

    return Promise.all(
      books.map(async (book) => ({
        ...book,
        imageUrl: book.imageId ? await ctx.storage.getUrl(book.imageId) : null,
      }))
    );
  },
});

export const get = query({
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    const book = await ctx.db.get(args.id);
    if (!book) return null;
    return {
      ...book,
      imageUrl: book.imageId ? await ctx.storage.getUrl(book.imageId) : null,
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    genre: v.string(),
    availability: v.boolean(),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("books", {
      title: args.title,
      author: args.author,
      genre: args.genre,
      availability: args.availability,
      imageId: args.imageId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("books"),
    title: v.string(),
    author: v.string(),
    genre: v.string(),
    availability: v.boolean(),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query.trim()) {
      return [];
    }

    const books = await ctx.db.query("books").collect();
    const filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(args.query.toLowerCase()) ||
        book.author.toLowerCase().includes(args.query.toLowerCase())
    );

    return Promise.all(
      filtered.map(async (book) => ({
        ...book,
        imageUrl: book.imageId ? await ctx.storage.getUrl(book.imageId) : null,
      }))
    );
  },
});
