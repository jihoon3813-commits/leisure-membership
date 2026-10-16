import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 전체 쿠폰 목록 조회
export const list = query({
  args: {
    status: v.optional(v.string()),
    branch: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("coupons");
    if (args.status && args.status !== "all") {
      q = q.withIndex("by_status", (idx) => idx.eq("status", args.status));
    }
    let items = await q.collect();
    if (args.branch && args.branch !== "all") {
      items = items.filter((c) => c.branch === args.branch);
    }
    return items;
  },
});

// 쿠폰 통계 요약 조회
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const coupons = await ctx.db.query("coupons").collect();
    const total = coupons.length;
    let notIssued = 0;
    let issued = 0;
    let registered = 0;
    let used = 0;

    for (const c of coupons) {
      if (c.status === "NOT_ISSUED") notIssued++;
      else if (c.status === "ISSUED") issued++;
      else if (c.status === "REGISTERED") registered++;
      else if (c.status === "USED") used++;
    }

    return { total, notIssued, issued, registered, used };
  },
});

// 쿠폰 대역 발급 목록 조회
export const listAllocations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("allocations").collect();
  },
});

// 신규 대역 일괄 발급 등록
export const createAllocation = mutation({
  args: {
    id: v.string(),
    startNum: v.number(),
    endNum: v.number(),
    branch: v.string(),
    memo: v.optional(v.string()),
    count: v.number(),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("allocations", args);

    // 해당 범위 내 쿠폰들의 상태를 ISSUED로 업데이트
    const coupons = await ctx.db
      .query("coupons")
      .collect();

    for (const c of coupons) {
      const num = c.num ?? c.couponNumber ?? 0;
      if (num >= args.startNum && num <= args.endNum && c.status === "NOT_ISSUED") {
        await ctx.db.patch(c._id, {
          status: "ISSUED",
          branch: args.branch,
          memo: args.memo,
        });
      }
    }
    return { success: true };
  },
});

// 쿠폰 코드로 조회 및 유효성 검사
export const verifyCoupon = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const codeClean = args.code.trim().toUpperCase();
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", codeClean))
      .first();

    if (!coupon) {
      return { valid: false, reason: "NOT_FOUND" };
    }
    if (coupon.status === "USED") {
      return { valid: false, reason: "ALREADY_USED", coupon };
    }
    return { valid: true, coupon };
  },
});

// 회원 쿠폰 등록 (REGISTERED)
export const registerUser = mutation({
  args: {
    code: v.string(),
    userName: v.string(),
    userPhone: v.string(),
    registeredAt: v.string(),
  },
  handler: async (ctx, args) => {
    const codeClean = args.code.trim().toUpperCase();
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", codeClean))
      .first();

    if (!coupon) throw new Error("존재하지 않는 쿠폰 번호입니다.");
    if (coupon.status === "USED") throw new Error("이미 사용 완료된 쿠폰입니다.");

    await ctx.db.patch(coupon._id, {
      status: "REGISTERED",
      assignedUser: args.userName,
      assignedTo: args.userName,
      userPhone: args.userPhone,
      assignedPhone: args.userPhone,
      registeredAt: args.registeredAt,
    });

    return { success: true };
  },
});

// 쿠폰 사용 처리 (USED)
export const useCoupon = mutation({
  args: {
    code: v.string(),
    reservationId: v.optional(v.string()),
    usedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const codeClean = args.code.trim().toUpperCase();
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", codeClean))
      .first();

    if (!coupon) throw new Error("존재하지 않는 쿠폰입니다.");
    if (coupon.status === "USED") throw new Error("이미 사용 완료된 쿠폰입니다.");

    await ctx.db.patch(coupon._id, {
      status: "USED",
      usedAt: args.usedAt,
      usedDate: args.usedAt,
      reservationId: args.reservationId,
      usedFor: args.reservationId,
    });

    return { success: true };
  },
});

// 쿠폰 대량 배치 삽입 (시딩 및 동기화용)
export const bulkCreate = mutation({
  args: {
    coupons: v.array(
      v.object({
        code: v.string(),
        num: v.optional(v.number()),
        couponNumber: v.optional(v.number()),
        status: v.string(),
        branch: v.optional(v.string()),
        assignedUser: v.optional(v.string()),
        userPhone: v.optional(v.string()),
        registeredAt: v.optional(v.string()),
        usedAt: v.optional(v.string()),
        reservationId: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    let created = 0;
    for (const c of args.coupons) {
      const existing = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", c.code))
        .first();

      if (!existing) {
        await ctx.db.insert("coupons", {
          ...c,
          num: c.num ?? c.couponNumber ?? 0,
        });
        created++;
      }
    }
    return { created, totalPassed: args.coupons.length };
  },
});
