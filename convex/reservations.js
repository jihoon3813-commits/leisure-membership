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
    }
    const items = await q.order("desc").collect();
    let res = items.map((r) => ({
      ...r,
      id: r.customId || r._id,
      phone: r.phone || r.userPhone || "",
    }));
    if (args.userPhone) {
      res = res.filter((r) => r.phone.replace(/[^0-9]/g, "") === args.userPhone.replace(/[^0-9]/g, ""));
    }
    return res;
  },
});

// 예약 생성
export const create = mutation({
  args: {
    customId: v.optional(v.string()),
    hotelId: v.optional(v.string()),
    hotelName: v.string(),
    hotelLocation: v.optional(v.string()),
    userName: v.string(),
    phone: v.optional(v.string()),
    userPhone: v.optional(v.string()),
    couponCode: v.optional(v.string()),
    checkIn: v.string(),
    checkOut: v.string(),
    nights: v.optional(v.number()),
    guests: v.optional(v.number()),
    adults: v.optional(v.number()),
    children: v.optional(v.number()),
    address: v.optional(v.string()),
    addressDetail: v.optional(v.string()),
    postcode: v.optional(v.string()),
    totalPrice: v.optional(v.number()),
    finalPayment: v.optional(v.number()),
    requests: v.optional(v.string()),
    requestMemo: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const reservationStatus = args.status || "접수대기";
    const customId = args.customId || "RES-" + Date.now().toString(36).toUpperCase();

    // 1. 쿠폰이 포함되어 있다면 사용 처리
    if (args.couponCode) {
      const codeClean = args.couponCode.trim().toUpperCase();
      const coupon = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", codeClean))
        .first();

      if (coupon) {
        await ctx.db.patch(coupon._id, {
          status: "USED",
          usedAt: new Date().toISOString().substring(0, 16).replace("T", " "),
          reservationId: customId,
        });
      }
    }

    // 2. 예약 내역 저장
    const id = await ctx.db.insert("reservations", {
      ...args,
      customId: customId,
      status: reservationStatus,
      createdAt: Date.now(),
    });

    return { id, customId };
  },
});

// 예약 상태 변경 (접수대기, 확정완료, 취소 등)
export const updateStatus = mutation({
  args: {
    id: v.string(), // customId 또는 _id
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const reservations = await ctx.db.query("reservations").collect();
    const target = reservations.find((r) => r.customId === args.id || r._id === args.id);
    if (!target) {
      throw new Error(`예약 번호를 찾을 수 없습니다: ${args.id}`);
    }
    await ctx.db.patch(target._id, { status: args.status });
    return { success: true };
  },
});
