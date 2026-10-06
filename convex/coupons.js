import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 전체 쿠폰 목록 조회
export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status && args.status !== "all") {
      return await ctx.db
        .query("coupons")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .collect();
    }
    return await ctx.db.query("coupons").collect();
  },
});

// 쿠폰 코드로 조회 및 유효성 검사
export const verifyCoupon = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.trim().toUpperCase()))
      .first();

    if (!coupon) {
      return { valid: false, reason: "NOT_FOUND" };
    }
    if (coupon.status === "used") {
      return { valid: false, reason: "ALREADY_USED", coupon };
    }
    return { valid: true, coupon };
  },
});

// 쿠폰 사용 처리
export const useCoupon = mutation({
  args: {
    code: v.string(),
    usedFor: v.string(), // 예약 ID 또는 설명
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.trim().toUpperCase()))
      .first();

    if (!coupon) {
      throw new Error("존재하지 않는 쿠폰입니다.");
    }
    if (coupon.status === "used") {
      throw new Error("이미 사용 완료된 쿠폰입니다.");
    }

    await ctx.db.patch(coupon._id, {
      status: "used",
      usedDate: new Date().toISOString(),
      usedFor: args.usedFor,
    });

    return { success: true };
  },
});

// 쿠폰 단일/대량 생성
export const bulkCreate = mutation({
  args: {
    coupons: v.array(
      v.object({
        code: v.string(),
        couponNumber: v.number(),
        status: v.string(),
        assignedTo: v.optional(v.string()),
        assignedPhone: v.optional(v.string()),
        assignedDate: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const c of args.coupons) {
      await ctx.db.insert("coupons", c);
    }
    return { count: args.coupons.length };
  },
});
