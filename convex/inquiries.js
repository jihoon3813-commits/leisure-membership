import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 문의 목록 조회
export const list = query({
  args: {
    status: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("inquiries");
    if (args.status && args.status !== "all") {
      q = q.withIndex("by_status", (idx) => idx.eq("status", args.status));
    } else if (args.phone) {
      q = q.withIndex("by_phone", (idx) => idx.eq("phone", args.phone));
    }
    return await q.order("desc").collect();
  },
});

// 문의 등록
export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inquiries", {
      ...args,
      status: "waiting",
      createdAt: Date.now(),
    });
  },
});

// 문의 답변 처리
export const answer = mutation({
  args: {
    id: v.id("inquiries"),
    reply: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      reply: args.reply,
      status: "answered",
    });
  },
});
