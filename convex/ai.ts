"use node";

import { api } from "./_generated/api";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { Buffer } from "buffer";
import { Id } from "./_generated/dataModel";

export const aiGeneratedImage = action({
  args: {
    title: v.string(),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    const prompt = `Design a cover layout for a titled "${args.title}" by ${args.author}. The title should be clearly written on the cover in readable, professional typography. The design should reflect the theme of the book and look like a real published cover, not a 3D book. example format title, author background image or title image author`;

    const response = await fetch(
      "https://api.cloudflare.com/client/v4/accounts/d87c54744874fb0bdb0ce388e69d16e2/ai/run/@cf/leonardo/phoenix-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          width: 640,
          height: 1024,
          guidance: 10,
          num_steps: 30,
          negative_prompt: "blurry, distorted, unreadable text",
        }),
      }
    );

    const result = await response.arrayBuffer();
    const base64 = Buffer.from(result).toString("base64");

    return { base64 };

    // const uploadUrl = await ctx.runMutation(api.books.generateUploadUrl);
    // const uploadRes = await fetch(uploadUrl, {
    //   method: "POST",
    //   headers: { "Content-Type": "image/jpeg" },
    //   body: base64,
    // });

    // const uploadJson = await uploadRes.json();

    // return { imageId: uploadJson.storageId as Id<"_storage"> };
  },
});
