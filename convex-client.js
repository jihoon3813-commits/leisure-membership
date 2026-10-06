/**
 * HD ONE LOUNGE - Convex Client SDK (Browser Compatible)
 * Standard HTTP POST Client for Convex Queries & Mutations
 */

const ConvexService = {
  // 기본 설정된 배포 URL (또는 로컬스토리지 저장값)
  STORAGE_KEY_URL: 'HD_CONVEX_DEPLOYMENT_URL',

  getUrl() {
    return localStorage.getItem(this.STORAGE_KEY_URL) || window.CONVEX_DEPLOYMENT_URL || '';
  },

  setUrl(url) {
    if (!url) {
      localStorage.removeItem(this.STORAGE_KEY_URL);
    } else {
      let cleanUrl = url.trim();
      if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
      localStorage.setItem(this.STORAGE_KEY_URL, cleanUrl);
    }
  },

  isConnected() {
    return !!this.getUrl();
  },

  /**
   * Convex Query 실행 (POST /api/query)
   * @param {string} functionPath - 예: 'hotels:list'
   * @param {object} args - 전달 인자
   */
  async query(functionPath, args = {}) {
    const url = this.getUrl();
    if (!url) throw new Error('Convex Deployment URL이 설정되지 않았습니다.');

    const endpoint = `${url}/api/query`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: functionPath,
        args: args
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Convex Query 실패 (${res.status}): ${errText}`);
    }

    const data = await res.json();
    if (data.status === 'error') {
      throw new Error(data.errorMessage || 'Convex Query Error');
    }
    return data.value;
  },

  /**
   * Convex Mutation 실행 (POST /api/mutation)
   * @param {string} functionPath - 예: 'reservations:create'
   * @param {object} args - 전달 인자
   */
  async mutation(functionPath, args = {}) {
    const url = this.getUrl();
    if (!url) throw new Error('Convex Deployment URL이 설정되지 않았습니다.');

    const endpoint = `${url}/api/mutation`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: functionPath,
        args: args
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Convex Mutation 실패 (${res.status}): ${errText}`);
    }

    const data = await res.json();
    if (data.status === 'error') {
      throw new Error(data.errorMessage || 'Convex Mutation Error');
    }
    return data.value;
  },

  /**
   * 로컬의 초기 호텔/쿠폰 데이터를 Convex로 시딩(이전)
   */
  async seedInitialData(hotels, coupons) {
    const results = {};
    if (hotels && hotels.length > 0) {
      // 50개 단위로 분할하여 전송
      const chunkSize = 50;
      let totalSeedCount = 0;
      for (let i = 0; i < hotels.length; i += chunkSize) {
        const chunk = hotels.slice(i, i + chunkSize).map(h => ({
          customId: String(h.id || ''),
          name: String(h.name || ''),
          location: String(h.location || ''),
          region: String(h.region || '기타'),
          category: String(h.category || 'hotel'),
          price: Number(h.price || 0),
          originalPrice: Number(h.originalPrice || 0),
          discount: Number(h.discount || 0),
          images: Array.isArray(h.images) ? h.images : [],
          tag: h.tag ? String(h.tag) : undefined,
          isMain: Boolean(h.isMain),
          desc: h.desc ? String(h.desc) : undefined,
          benefit: h.benefit ? String(h.benefit) : undefined,
          source: h.source ? String(h.source) : undefined,
          rating: h.rating ? Number(h.rating) : 4.8
        }));
        const res = await this.mutation('hotels:bulkSeed', { hotels: chunk });
        totalSeedCount += res.count;
      }
      results.hotelsCount = totalSeedCount;
    }

    if (coupons && coupons.length > 0) {
      const chunkSize = 100;
      let totalCouponCount = 0;
      for (let i = 0; i < coupons.length; i += chunkSize) {
        const chunk = coupons.slice(i, i + chunkSize).map(c => ({
          code: String(c.code),
          couponNumber: Number(c.couponNumber || 0),
          status: String(c.status || 'available'),
          assignedTo: c.assignedTo || undefined,
          assignedPhone: c.assignedPhone || undefined,
          assignedDate: c.assignedDate || undefined
        }));
        const res = await this.mutation('coupons:bulkCreate', { coupons: chunk });
        totalCouponCount += res.count;
      }
      results.couponsCount = totalCouponCount;
    }

    return results;
  }
};

window.ConvexService = ConvexService;
