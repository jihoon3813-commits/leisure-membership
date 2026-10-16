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

    items.sort((a, b) => {
      const orderA = a.displayOrder !== undefined ? a.displayOrder : 999999;
      const orderB = b.displayOrder !== undefined ? b.displayOrder : 999999;
      return orderA - orderB;
    });

    return items.map((h) => ({
      ...h,
      id: h.customId || h._id,
    }));
  },
});

// 단일 상품 조회
export const getById = query({
  args: { id: v.id("hotels") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return null;
    return { ...doc, id: doc.customId || doc._id };
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

// 상품 등록 및 수정 (Upsert by customId)
export const upsert = mutation({
  args: {
    customId: v.string(),
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
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("hotels")
      .withIndex("by_customId", (q) => q.eq("customId", args.customId))
      .first();

    if (existing) {
      const { customId, ...fields } = args;
      await ctx.db.patch(existing._id, fields);
      return { id: existing._id, action: "updated" };
    } else {
      const id = await ctx.db.insert("hotels", args);
      return { id, action: "created" };
    }
  },
});

// 숙박시설 순서 일괄 업데이트
export const updateOrders = mutation({
  args: {
    orders: v.array(
      v.object({
        id: v.string(),
        displayOrder: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.orders) {
      const doc = await ctx.db
        .query("hotels")
        .withIndex("by_customId", (q) => q.eq("customId", item.id))
        .first();
      if (doc) {
        await ctx.db.patch(doc._id, { displayOrder: item.displayOrder });
      }
    }
    return { success: true };
  },
});

// 상품 수정 (ID 기준)
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

// 상품 삭제 (ID 기준)
export const remove = mutation({
  args: { id: v.id("hotels") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// 상품 삭제 (customId 기준)
export const removeByCustomId = mutation({
  args: { customId: v.string() },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("hotels")
      .withIndex("by_customId", (q) => q.eq("customId", args.customId))
      .first();
    if (item) {
      await ctx.db.delete(item._id);
      return { success: true };
    }
    return { success: false, notFound: true };
  },
});

// 대량 데이터 초기화 (Seed, 중복 방지)
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
    let seeded = 0;
    for (const hotel of args.hotels) {
      if (hotel.customId) {
        const exists = await ctx.db
          .query("hotels")
          .withIndex("by_customId", (q) => q.eq("customId", hotel.customId))
          .first();
        if (exists) {
          continue; // 이미 존재하면 건너뜀
        }
      }
      await ctx.db.insert("hotels", hotel);
      seeded++;
    }
    return { count: seeded };
  },
});
