import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 예약 목록 조회
export const list = query({
  args: {
    status: v.optional(v.string()),
    userPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("reservations");
    if (args.status && args.status !== "all") {
      q = q.withIndex("by_status", (idx) => idx.eq("status", args.status));
    } else if (args.userPhone) {
      q = q.withIndex("by_userPhone", (idx) => idx.eq("userPhone", args.userPhone));
    }
    const items = await q.order("desc").collect();
    return items;
  },
});

// 예약 생성
export const create = mutation({
  args: {
    hotelId: v.optional(v.string()),
    hotelName: v.string(),
    userName: v.string(),
    userPhone: v.string(),
    couponCode: v.string(),
    checkIn: v.string(),
    checkOut: v.string(),
    guests: v.number(),
    requestMemo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. 쿠폰 사용 여부 확인 및 사용 처리
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.couponCode.trim().toUpperCase()))
      .first();

    if (coupon) {
      if (coupon.status === "used") {
        throw new Error("이미 사용된 쿠폰 번호입니다.");
      }
    }

    // 2. 예약 내역 저장
    const reservationId = await ctx.db.insert("reservations", {
      ...args,
      status: "confirmed",
      createdAt: Date.now(),
    });

    // 3. 쿠폰 상태 업데이트
    if (coupon) {
      await ctx.db.patch(coupon._id, {
        status: "used",
        usedDate: new Date().toISOString(),
        usedFor: reservationId,
        assignedTo: args.userName,
        assignedPhone: args.userPhone,
      });
    }

    return reservationId;
  },
});

// 예약 상태 변경 (승인, 취소 등)
export const updateStatus = mutation({
  args: {
    id: v.id("reservations"),
    status: v.string(), // "confirmed", "cancelled", "pending"
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
