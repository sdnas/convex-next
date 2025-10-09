import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  books: defineTable({
    title: v.string(),
    author: v.string(),
    description: v.string(),
    genre: v.string(),
    availability: v.boolean(),
    imageId: v.optional(v.id("_storage")),
  })
    .index("by_title", ["title"])
    .index("by_author", ["author"])
    .index("by_description", ["description"])
    .index("by_genre", ["genre"])
    .index("by_availability", ["availability"]),
});
