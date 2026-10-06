import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 전체 호텔/상품 목록 조회
export const list = query({
  args: {
    category: v.optional(v.string()),
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let items;
    if (args.category && args.category !== "all") {
      items = await ctx.db
        .query("hotels")
        .withIndex("by_category", (q) => q.eq("category", args.category))
        .collect();
    } else {
      items = await ctx.db.query("hotels").collect();
    }

    if (args.region && args.region !== "전체") {
      items = items.filter((h) => h.region === args.region);
    }
    return items;
  },
});

// 단일 상품 조회
export const getById = query({
  args: { id: v.id("hotels") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// 상품 등록
export const create = mutation({
  args: {
    customId: v.optional(v.string()),
    name: v.string(),
    location: v.string(),
    region: v.string(),
    category: v.string(),
    price: v.number(),
    originalPrice: v.number(),
    discount: v.number(),
    images: v.array(v.string()),
    tag: v.optional(v.string()),
    isMain: v.optional(v.boolean()),
    desc: v.optional(v.string()),
    benefit: v.optional(v.string()),
    source: v.optional(v.string()),
    rating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("hotels", args);
  },
});

// 상품 수정
export const update = mutation({
  args: {
    id: v.id("hotels"),
    patch: v.object({
      name: v.optional(v.string()),
      location: v.optional(v.string()),
      region: v.optional(v.string()),
      category: v.optional(v.string()),
      price: v.optional(v.number()),
      originalPrice: v.optional(v.number()),
      discount: v.optional(v.number()),
      images: v.optional(v.array(v.string())),
      tag: v.optional(v.string()),
      isMain: v.optional(v.boolean()),
      desc: v.optional(v.string()),
      benefit: v.optional(v.string()),
      rating: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.patch);
  },
});

// 상품 삭제
export const remove = mutation({
  args: { id: v.id("hotels") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// 대량 데이터 초기화 (Seed)
export const bulkSeed = mutation({
  args: {
    hotels: v.array(
      v.object({
        customId: v.optional(v.string()),
        name: v.string(),
        location: v.string(),
        region: v.string(),
        category: v.string(),
        price: v.number(),
        originalPrice: v.number(),
        discount: v.number(),
        images: v.array(v.string()),
        tag: v.optional(v.string()),
        isMain: v.optional(v.boolean()),
        desc: v.optional(v.string()),
        benefit: v.optional(v.string()),
        source: v.optional(v.string()),
        rating: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const hotel of args.hotels) {
      await ctx.db.insert("hotels", hotel);
    }
    return { count: args.hotels.length };
  },
});
