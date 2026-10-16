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
    }
    const items = await q.order("desc").collect();
    let res = items.map((i) => ({
      ...i,
      id: i.customId || i._id,
    }));
    if (args.phone) {
      res = res.filter((i) => i.phone.replace(/[^0-9]/g, "") === args.phone.replace(/[^0-9]/g, ""));
    }
    return res;
  },
});

// 문의 등록
export const create = mutation({
  args: {
    customId: v.optional(v.string()),
    name: v.string(),
    phone: v.string(),
    title: v.optional(v.string()),
    category: v.optional(v.string()),
    preferredTime: v.optional(v.string()),
    content: v.string(),
    status: v.optional(v.string()),
    memo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const customId = args.customId || "INQ-" + Date.now().toString(36).toUpperCase();
    const id = await ctx.db.insert("inquiries", {
      ...args,
      customId,
      status: args.status || "상담대기",
      createdAt: Date.now(),
    });
    return { id, customId };
  },
});

// 문의 상태 변경
export const updateStatus = mutation({
  args: {
    id: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const inquiries = await ctx.db.query("inquiries").collect();
    const target = inquiries.find((i) => i.customId === args.id || i._id === args.id);
    if (!target) throw new Error("문의 내역을 찾을 수 없습니다: " + args.id);
    await ctx.db.patch(target._id, { status: args.status });
    return { success: true };
  },
});

// 관리자 메모 업데이트
export const updateMemo = mutation({
  args: {
    id: v.string(),
    memo: v.string(),
  },
  handler: async (ctx, args) => {
    const inquiries = await ctx.db.query("inquiries").collect();
    const target = inquiries.find((i) => i.customId === args.id || i._id === args.id);
    if (!target) throw new Error("문의 내역을 찾을 수 없습니다: " + args.id);
    await ctx.db.patch(target._id, { memo: args.memo });
    return { success: true };
  },
});
