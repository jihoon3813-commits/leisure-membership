import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 기타 상품 목록 조회
export const list = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("otherProducts");
    if (args.category && args.category !== "all") {
      q = q.withIndex("by_category", (idx) => idx.eq("category", args.category));
    }
    const items = await q.collect();
    return items.map((p) => ({
      ...p,
      id: p.customId || p._id,
    }));
  },
});

// 기타 상품 등록 / 수정 (Upsert)
export const upsert = mutation({
  args: {
    customId: v.string(),
    category: v.string(),
    name: v.string(),
    location: v.string(),
    region: v.string(),
    price: v.number(),
    originalPrice: v.number(),
    discount: v.number(),
    images: v.array(v.string()),
    tag: v.optional(v.string()),
    desc: v.optional(v.string()),
    benefit: v.optional(v.string()),
    isMain: v.optional(v.boolean()),
    rating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("otherProducts")
      .withIndex("by_customId", (q) => q.eq("customId", args.customId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return { id: existing._id, action: "updated" };
    } else {
      const id = await ctx.db.insert("otherProducts", args);
      return { id, action: "created" };
    }
  },
});

// 기타 상품 삭제
export const remove = mutation({
  args: { customId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("otherProducts")
      .withIndex("by_customId", (q) => q.eq("customId", args.customId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { success: true };
    }
    return { success: false };
  },
});
