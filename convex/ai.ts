"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { Buffer } from "buffer";

export const aiGeneratedImage = action({
  args: {
    title: v.string(),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    const prompt = `A professionally designed book cover for the title "${args.title}" by "${args.author}". The image should be visually compelling and suitable for print, with symbolic or thematic elements that reflect the essence of the book. It should feature clean, readable typography for the title and author name, a balanced composition, and a harmonious color palette. The design should be genre-neutral, polished, and bookstore-ready, evoking curiosity without including literal prompt text or abstract distortions.`;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/leonardo/phoenix-1.0`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          width: 640,
          height: 960,
          guidance: 10,
          num_steps: 30,
          negative_prompt:
            "blurry, abstract, surreal, distorted, unreadable text, prompt instructions, watermark, UI elements",
        }),
      }
    );

    const result = await response.arrayBuffer();
    const base64 = Buffer.from(result).toString("base64");

    return { base64 };
  },
});
