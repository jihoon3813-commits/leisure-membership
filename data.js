/**
 * HD ONE LOUNGE - Data & Storage Management Module
 */

const COUPON_RULE = {
  PREFIX: 'HD1-ABCD-X1A',
  MIN_NUM: 2,
  MAX_NUM: 5000,
  formatCode(num) {
    return this.PREFIX + String(num).padStart(4, '0');
  },
  parseCode(code) {
    if (!code) return null;
    const clean = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    let num = null;
    const mFull = clean.match(/^HD1ABCDX1A(\d{4})$/);
    if (mFull) {
      num = parseInt(mFull[1], 10);
    } else if (/^\d{4}$/.test(clean)) {
      num = parseInt(clean, 10);
    }
    if (num === null || isNaN(num) || num < this.MIN_NUM || num > this.MAX_NUM) return null;
    return num;
  }
};

function autoHyphenCoupon(str) {
  if (!str) return '';
  const clean = str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (/^\d{1,4}$/.test(clean)) return clean;
  if (clean.length <= 3) return clean;
  if (clean.length <= 7) return clean.substr(0, 3) + '-' + clean.substr(3);
  return clean.substr(0, 3) + '-' + clean.substr(3, 4) + '-' + clean.substr(7, 7);
}

const DEFAULT_HOTELS = [
    {
        "id":  "gentrify_1",
        "name":  "[인천/송도] 셀럽스테이호텔",
        "location":  "인천광역시 연수구",
        "region":  "인천",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/xfcvibvrvk_a.jpg",
                       "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "LOUNGE PICK",
        "isMain":  true,
        "desc":  "인천광역시 연수구에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_2",
        "name":  "[인천/영종도] 오션파크나인호텔",
        "location":  "인천광역시 중구",
        "region":  "인천",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/mjobpjnagv_a.jpg",
                       "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "OCEAN VIEW",
        "isMain":  true,
        "desc":  "인천광역시 중구에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_3",
        "name":  "[인천/영종도] 스카이탑호텔",
        "location":  "인천광역시 중구",
        "region":  "인천",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/qzppblmpzi_a.jpg",
                       "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "BEST STAY",
        "isMain":  true,
        "desc":  "인천광역시 중구에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_4",
        "name":  "[인천/영종도] 영종도 지엘시티호텔",
        "location":  "인천광역시 중구",
        "region":  "인천",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/umztbfsfdb_a.jpg",
                       "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "LOUNGE PICK",
        "isMain":  true,
        "desc":  "인천광역시 중구에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_5",
        "name":  "[강원/양양] 오션스테이양양(E7 죽도)",
        "location":  "강원도 양양군",
        "region":  "강원",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/rwgtecirsb_a.jpg",
                       "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "OCEAN VIEW",
        "isMain":  true,
        "desc":  "강원도 양양군에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_6",
        "name":  "[강원/양양] 슬로우웨이브펜션",
        "location":  "강원도 양양군",
        "region":  "강원",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/ljaqlcrsnh_a.jpg",
                       "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "BEST STAY",
        "isMain":  true,
        "desc":  "강원도 양양군에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_7",
        "name":  "[강원/강릉] 아썸펜션",
        "location":  "강원도 강릉시",
        "region":  "강원",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/xhpercgkfn_a.jpg",
                       "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "LOUNGE PICK",
        "isMain":  true,
        "desc":  "강원도 강릉시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_8",
        "name":  "[강원/철원] 마운틴밸리펜션",
        "location":  "강원도 철원군",
        "region":  "강원",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/jwzppitnpo_a.jpg",
                       "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "OCEAN VIEW",
        "isMain":  true,
        "desc":  "강원도 철원군에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_9",
        "name":  "[강원/양양] 38마린리조트",
        "location":  "강원도 양양군",
        "region":  "강원",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/kdzkabxjdy_a.jpg",
                       "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "BEST STAY",
        "isMain":  false,
        "desc":  "강원도 양양군에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_10",
        "name":  "[경남/진주] 골든튤립호텔남강",
        "location":  "경상남도 진주시",
        "region":  "경상",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/hqqrbzdoxx_a.jpg",
                       "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "LOUNGE PICK",
        "isMain":  false,
        "desc":  "경상남도 진주시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_11",
        "name":  "[부산/해운대] 해운대 플레아드블랑호텔",
        "location":  "부산광역시 해운대구",
        "region":  "부산",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/eonvfcbnid_a.jpg",
                       "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "OCEAN VIEW",
        "isMain":  false,
        "desc":  "부산광역시 해운대구에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_12",
        "name":  "[부산/강서] 더웨스턴부산호텔",
        "location":  "부산 강서구",
        "region":  "부산",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/asgfrafoqr_a.jpg",
                       "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "BEST STAY",
        "isMain":  false,
        "desc":  "부산 강서구에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_13",
        "name":  "[경기/안산] 호텔데일리",
        "location":  "경기도 안산시",
        "region":  "서울·경기",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/atsylndjwo_a.jpg",
                       "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "LOUNGE PICK",
        "isMain":  false,
        "desc":  "경기도 안산시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_14",
        "name":  "[제주/조천] 아침해변펜션",
        "location":  "제주특별자치도 제주시",
        "region":  "제주",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/xpqlbxjoyg_a.jpg",
                       "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "OCEAN VIEW",
        "isMain":  false,
        "desc":  "제주특별자치도 제주시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_15",
        "name":  "[제주/서귀포] 제주엠리조트",
        "location":  "제주특별자치도 서귀포시",
        "region":  "제주",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/gfbncxynrl_a.jpg",
                       "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "BEST STAY",
        "isMain":  false,
        "desc":  "제주특별자치도 서귀포시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_16",
        "name":  "[경기/수원] 아모레미오 더클래식",
        "location":  "경기도 수원시",
        "region":  "서울·경기",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/diynnjoiyu_a.jpg",
                       "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "LOUNGE PICK",
        "isMain":  false,
        "desc":  "경기도 수원시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_17",
        "name":  "[경기/가평] 가평아늑에어호텔",
        "location":  "경기도 가평군",
        "region":  "서울·경기",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/hlbwqmfhzx_a.jpg",
                       "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "OCEAN VIEW",
        "isMain":  false,
        "desc":  "경기도 가평군에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_18",
        "name":  "[경기/포천] 호텔마루포천점",
        "location":  "경기도 포천시",
        "region":  "서울·경기",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/scvnfwbozn_a.jpg",
                       "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "BEST STAY",
        "isMain":  false,
        "desc":  "경기도 포천시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_19",
        "name":  "[경기/파주] 파주호텔얌",
        "location":  "경기도 파주시",
        "region":  "서울·경기",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/ujpwizdxwg_a.jpg",
                       "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "LOUNGE PICK",
        "isMain":  false,
        "desc":  "경기도 파주시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_20",
        "name":  "[경기/가평] 옹달샘펜션",
        "location":  "경기도 가평군",
        "region":  "서울·경기",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/zlsnxazcql_a.jpg",
                       "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "OCEAN VIEW",
        "isMain":  false,
        "desc":  "경기도 가평군에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_21",
        "name":  "[강원/동해] 망상파크펜션",
        "location":  "강원도 동해시",
        "region":  "강원",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/ejwfrlvlro_a.jpg",
                       "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "BEST STAY",
        "isMain":  false,
        "desc":  "강원도 동해시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_22",
        "name":  "[강원/춘천] 뷰티풀펜션",
        "location":  "강원도 춘천시",
        "region":  "강원",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/wcozxmykce_a.jpg",
                       "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "LOUNGE PICK",
        "isMain":  false,
        "desc":  "강원도 춘천시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_23",
        "name":  "[강원/양양] 다빛펜션",
        "location":  "강원도 양양군",
        "region":  "강원",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/xfsgchlwfp_a.jpg",
                       "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "OCEAN VIEW",
        "isMain":  false,
        "desc":  "강원도 양양군에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_24",
        "name":  "[강원/양양] 설악대문터계곡펜션",
        "location":  "강원 양양군",
        "region":  "강원",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/kxtixwtutu_a.jpg",
                       "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "BEST STAY",
        "isMain":  false,
        "desc":  "강원 양양군에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_25",
        "name":  "[강원/양양] 다온휴펜션",
        "location":  "강원도 양양군",
        "region":  "강원",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/duromodbol_a.jpg",
                       "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "LOUNGE PICK",
        "isMain":  false,
        "desc":  "강원도 양양군에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_26",
        "name":  "[강원/평창] 숲속의요정",
        "location":  "강원도 평창군",
        "region":  "강원",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/hmcyqqyvtl_a.jpg",
                       "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "OCEAN VIEW",
        "isMain":  false,
        "desc":  "강원도 평창군에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_27",
        "name":  "[강원/태백] 설화국가족호텔",
        "location":  "강원도 태백시",
        "region":  "강원",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/ypubxabsnq_a.jpg",
                       "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "BEST STAY",
        "isMain":  false,
        "desc":  "강원도 태백시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_28",
        "name":  "[충북/충주] 알아이(RI) 종합온천호텔",
        "location":  "충청북도 충주시",
        "region":  "충청",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/eaykuaziik_a.jpg",
                       "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "LOUNGE PICK",
        "isMain":  false,
        "desc":  "충청북도 충주시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_29",
        "name":  "[충북/보은] 속리산호텔",
        "location":  "충청북도 보은군",
        "region":  "충청",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/vtpfciajwx_a.jpg",
                       "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "OCEAN VIEW",
        "isMain":  false,
        "desc":  "충청북도 보은군에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_30",
        "name":  "[충북/음성] 호텔하루",
        "location":  "충청북도 음성군",
        "region":  "충청",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/zuaezwgixd_a.jpg",
                       "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "BEST STAY",
        "isMain":  false,
        "desc":  "충청북도 음성군에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_31",
        "name":  "﻿[충남/청양] 칠갑산샬레호텔",
        "location":  "충청남도 청양군",
        "region":  "충청",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/xrfermqwqn_a.jpg",
                       "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "LOUNGE PICK",
        "isMain":  false,
        "desc":  "충청남도 청양군에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_32",
        "name":  "[충남/보령] 호텔아일랜드",
        "location":  "충청남도 보령시",
        "region":  "충청",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/rzpcltdxkf_a.jpg",
                       "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "OCEAN VIEW",
        "isMain":  false,
        "desc":  "충청남도 보령시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_33",
        "name":  "[충남/보령] 더대천스토리펜션",
        "location":  "충청남도 보령시",
        "region":  "충청",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/ixfvzwmzha_a.jpg",
                       "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "BEST STAY",
        "isMain":  false,
        "desc":  "충청남도 보령시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_34",
        "name":  "[충남/천안] 소륜호텔 천안점",
        "location":  "충청남도 천안시",
        "region":  "충청",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/akglpillxl_a.jpg",
                       "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "LOUNGE PICK",
        "isMain":  false,
        "desc":  "충청남도 천안시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_35",
        "name":  "[경북/영덕] 칠보산온천리조트",
        "location":  "경상북도 영덕군",
        "region":  "경상",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/qyysrvomke_a.jpg",
                       "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "OCEAN VIEW",
        "isMain":  false,
        "desc":  "경상북도 영덕군에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_36",
        "name":  "[경북/안동] 안동호텔",
        "location":  "경상북도 안동시",
        "region":  "경상",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/pwthmtmais_a.jpg",
                       "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "BEST STAY",
        "isMain":  false,
        "desc":  "경상북도 안동시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_37",
        "name":  "[경남/마산] 아모르호텔",
        "location":  "경상남도 창원시",
        "region":  "경상",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/srbdndwtrc_a.jpg",
                       "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "LOUNGE PICK",
        "isMain":  false,
        "desc":  "경상남도 창원시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_38",
        "name":  "[경남/밀양] 고추잠자리펜션",
        "location":  "경상남도 밀양시",
        "region":  "경상",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/kiwiaijsnd_a.jpg",
                       "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "OCEAN VIEW",
        "isMain":  false,
        "desc":  "경상남도 밀양시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_39",
        "name":  "[경남/남해] 꽃달임펜션",
        "location":  "경상남도 남해군",
        "region":  "경상",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/eumuntrabh_a.jpg",
                       "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "BEST STAY",
        "isMain":  false,
        "desc":  "경상남도 남해군에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_40",
        "name":  "[경남/남해] 비치하우스펜션",
        "location":  "경상남도 남해군",
        "region":  "경상",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/gcyreuiyij_a.jpg",
                       "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "LOUNGE PICK",
        "isMain":  false,
        "desc":  "경상남도 남해군에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_41",
        "name":  "[전북/전주] 아늑호텔전주점",
        "location":  "전라북도 전주시",
        "region":  "전라",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/cutqcksgng_a.jpg",
                       "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "OCEAN VIEW",
        "isMain":  false,
        "desc":  "전라북도 전주시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_42",
        "name":  "[전남/여수] 퍼스트시티호텔프리미엄",
        "location":  "전라남도 여수시",
        "region":  "전라",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/cwajrejixn_a.jpg",
                       "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "BEST STAY",
        "isMain":  false,
        "desc":  "전라남도 여수시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_43",
        "name":  "[전남/목포] 루벤스호텔 평화광장점",
        "location":  "전라남도 목포시",
        "region":  "전라",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/raqpxdekqw_a.jpg",
                       "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "LOUNGE PICK",
        "isMain":  false,
        "desc":  "전라남도 목포시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_44",
        "name":  "[전남/구례] 지리산리틀프린스펜션",
        "location":  "전라남도 구례군",
        "region":  "전라",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/trxiefbiie_a.jpg",
                       "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "OCEAN VIEW",
        "isMain":  false,
        "desc":  "전라남도 구례군에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_45",
        "name":  "[전남/순천] 용마루펜션",
        "location":  "전라남도 순천시",
        "region":  "전라",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/oakfucaweb_a.jpg",
                       "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "BEST STAY",
        "isMain":  false,
        "desc":  "전라남도 순천시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_46",
        "name":  "[전남/여수] 가사리꽃님이네펜션",
        "location":  "전라남도 여수시",
        "region":  "전라",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/xksfumxziy_a.jpg",
                       "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "LOUNGE PICK",
        "isMain":  false,
        "desc":  "전라남도 여수시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_47",
        "name":  "[전남/순천] 순천만뜰펜션",
        "location":  "전라남도 순천시",
        "region":  "전라",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/fwidlmevsn_a.jpg",
                       "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "OCEAN VIEW",
        "isMain":  false,
        "desc":  "전라남도 순천시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    },
    {
        "id":  "gentrify_48",
        "name":  "[전남/여수] 스테이결",
        "location":  "전라남도 여수시",
        "region":  "전라",
        "category":  "hotel",
        "price": 19000,
        "originalPrice": 200000,
        "discount": 91,
        "images":  [
                       "https://hhan.kr:13399/file/sang_main/bnsqojzsrs_a.jpg",
                       "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800\u0026auto=format\u0026fit=crop\u0026q=80",
                       "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800\u0026auto=format\u0026fit=crop\u0026q=80"
                   ],
        "tag":  "BEST STAY",
        "isMain":  false,
        "desc":  "전라남도 여수시에 위치한 프라이빗 회원 전용 프리미엄 스테이",
        "benefit":  "회원 전용 무료/우대 혜택 적용",
        "source":  "gentrify",
        "rating":  4.8
    }
]
;

const DEFAULT_OTHER_PRODUCTS = [
  {
    "id": "villa_1",
    "name": "남해 프라이빗 풀빌라",
    "location": "경상남도 남해군 남면",
    "region": "경상",
    "category": "villa",
    "price": 219000,
    "originalPrice": 320000,
    "discount": 32,
    "images": [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=80"
    ],
    "tag": "PRIVATE STAY",
    "isMain": true,
    "desc": "오롯이 우리만을 위한 인피니티 풀 & 오션뷰 독채 빌라",
    "benefit": "회원 전용 바비큐 세트 무료 제공",
    "source": "custom",
    "rating": 4.9
  },
  {
    "id": "villa_2",
    "name": "가평 리버사이드 감성 글램핑 & 풀빌라",
    "location": "경기도 가평군 북면",
    "region": "서울·경기",
    "category": "villa",
    "price": 189000,
    "originalPrice": 270000,
    "discount": 30,
    "images": [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&auto=format&fit=crop&q=80"
    ],
    "tag": "GLAMPING",
    "isMain": true,
    "desc": "북한강 숲속에서 즐기는 온수풀과 불멍 힐링 스테이",
    "benefit": "불멍 오로라 가루 & 장작 1세트 무료",
    "source": "custom",
    "rating": 4.8
  },
  {
    "id": "leisure_1",
    "name": "부산 해운대 요트 투어 (선셋 & 주간)",
    "location": "부산광역시 해운대구 수영만요트경기장",
    "region": "부산",
    "category": "leisure",
    "price": 29000,
    "originalPrice": 45000,
    "discount": 36,
    "images": [
      "assets/yacht.jpg",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"
    ],
    "tag": "SPECIAL MOMENT",
    "isMain": true,
    "desc": "바다 위에서 만나는 낭만적인 석양과 광안대교 야경",
    "benefit": "1인 탑승권 + 핑거푸드/무알콜 샴페인",
    "source": "custom",
    "rating": 4.9
  },
  {
    "id": "leisure_2",
    "name": "제주 서귀포 프리미엄 오션 스파 & 웰니스",
    "location": "제주특별자치도 서귀포시 중문",
    "region": "제주",
    "category": "leisure",
    "price": 49000,
    "originalPrice": 80000,
    "discount": 38,
    "images": [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80"
    ],
    "tag": "WELLNESS",
    "isMain": true,
    "desc": "제주 천연 아로마를 활용한 힐링 테라피 & 사우나",
    "benefit": "회원 전용 웰컴 티 & 페이셜 마스크팩 증정",
    "source": "custom",
    "rating": 4.8
  },
  {
    "id": "travel_1",
    "name": "제주, 느리게 걷는 슬로우 투어 (2박 3일)",
    "location": "제주특별자치도 전역",
    "region": "제주",
    "category": "travel",
    "price": 298000,
    "originalPrice": 420000,
    "discount": 29,
    "images": [
      "assets/resort.jpg",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80"
    ],
    "tag": "SLOW TRAVEL",
    "isMain": true,
    "desc": "오션뷰 호텔 숙박 + 감성 렌터카 + 웰컴 기프트 패키지",
    "benefit": "회원 전용 조식 2인 포함",
    "source": "custom",
    "rating": 4.9
  },
  {
    "id": "travel_2",
    "name": "남해 해안 드라이브 & 미식 여행 (1박 2일)",
    "location": "경상남도 남해군",
    "region": "경상",
    "category": "travel",
    "price": 189000,
    "originalPrice": 270000,
    "discount": 30,
    "images": [
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&auto=format&fit=crop&q=80",
      "assets/yacht.jpg"
    ],
    "tag": "COASTAL ESCAPE",
    "isMain": true,
    "desc": "남해 명품 오션스테이와 로컬 특선 다이닝 코스",
    "benefit": "다이닝 2인 바우처 제공",
    "source": "custom",
    "rating": 4.8
  }
];

const DEFAULT_COUPON_ALLOCATIONS = [
  {
    id: 'alloc_gangnam_1',
    branch: '강남서초',
    startNum: 1602,
    endNum: 2101,
    count: 500,
    date: '2026-09-01',
    memo: '강남서초 VIP 멤버십 정기 배포 (1602~2101)'
  }
];

// Local Storage Manager
const Storage = {
  KEYS: {
    HOTELS: 'hd_one_hotels_v3',
    OTHER_PRODUCTS: 'hd_one_other_products_v3',
    COUPONS: 'hd_one_coupons_v3',
    ALLOCATIONS: 'hd_one_allocations_v3',
    RESERVATIONS: 'hd_one_reservations_v3',
    INQUIRIES: 'hd_one_inquiries_v3',
    CURRENT_USER: 'hd_one_user_v3',
    USERS: 'hd_one_users_v3',
    DEFAULT_HOTEL_PRICE: 'hd_one_default_price_v3'
  },

  init() {
    let hotels = null;
    try {
      hotels = JSON.parse(localStorage.getItem(this.KEYS.HOTELS));
    } catch {}
    if (!hotels || !Array.isArray(hotels)) {
      hotels = DEFAULT_HOTELS;
    }
    // 기본 정가 20만원 / 쿠폰가 19,000원 보정
    hotels = hotels.map(h => {
      let orig = h.originalPrice;
      let pr = h.price;
      if (!orig || orig === 180000 || orig === 119000) orig = 200000;
      if (!pr || pr === 119000) pr = 19000;
      return {
        ...h,
        originalPrice: orig,
        price: pr,
        discount: Math.round((1 - pr / orig) * 100)
      };
    });
    localStorage.setItem(this.KEYS.HOTELS, JSON.stringify(hotels));
    if (!localStorage.getItem(this.KEYS.OTHER_PRODUCTS)) {
      localStorage.setItem(this.KEYS.OTHER_PRODUCTS, JSON.stringify(DEFAULT_OTHER_PRODUCTS));
    }
    if (!localStorage.getItem(this.KEYS.ALLOCATIONS)) {
      localStorage.setItem(this.KEYS.ALLOCATIONS, JSON.stringify(DEFAULT_COUPON_ALLOCATIONS));
    }
    if (!localStorage.getItem(this.KEYS.COUPONS)) {
      // Seed ALL coupons from 0002 to 5000 (total 4,999 coupons)
      const coupons = [];
      for (let n = 2; n <= 5000; n++) {
        let status = 'NOT_ISSUED'; // 미발급
        let branch = '미발급';
        let assignedUser = null;
        let userPhone = null;
        let registeredAt = null;
        let usedAt = null;
        let reservationId = null;

        // 1602 ~ 2101 are allocated to <강남서초>
        if (n >= 1602 && n <= 2101) {
          status = 'ISSUED'; // 미등록(발급)
          branch = '강남서초';

          if (n === 1602) {
            status = 'REGISTERED'; // 회원등록완료
            assignedUser = '홍길동';
            userPhone = '010-1234-5678';
            registeredAt = '2026-09-15 14:30';
          } else if (n === 1603) {
            status = 'USED'; // 사용완료
            assignedUser = '김철수';
            userPhone = '010-9876-5432';
            registeredAt = '2026-09-10 11:20';
            usedAt = '2026-09-20 18:45';
            reservationId = 'RES-20260920-001';
          }
        }

        coupons.push({
          code: COUPON_RULE.formatCode(n),
          num: n,
          branch: branch,
          status: status,
          assignedUser: assignedUser,
          userPhone: userPhone,
          registeredAt: registeredAt,
          usedAt: usedAt,
          reservationId: reservationId
        });
      }
      localStorage.setItem(this.KEYS.COUPONS, JSON.stringify(coupons));
    }
    if (!localStorage.getItem(this.KEYS.RESERVATIONS)) {
      localStorage.setItem(this.KEYS.RESERVATIONS, JSON.stringify([
        {
          id: 'RES-20260920-001',
          hotelId: 'gentrify_1',
          hotelName: '[인천/송도] 셀럽스테이호텔',
          hotelLocation: '인천광역시 연수구',
          checkIn: '2026-10-15',
          checkOut: '2026-10-16',
          nights: 1,
          userName: '김철수',
          phone: '010-9876-5432',
          postcode: '21998',
          address: '인천광역시 연수구 송도과학로 16번길',
          addressDetail: '101동 1204호',
          adults: 2,
          children: 1,
          requests: '고층 전망 좋은 방으로 배정 부탁드립니다. 추가 수저와 식기 세트 요청합니다.',
          totalPrice: 119000,
          couponCode: 'HD1-ABCD-X1A1603',
          discountAmount: 119000,
          finalPayment: 0,
          status: '확정완료',
          createdAt: '2026-09-20 18:45'
        }
      ]));
    }
    if (!localStorage.getItem(this.KEYS.INQUIRIES)) {
      localStorage.setItem(this.KEYS.INQUIRIES, JSON.stringify([
        {
          id: 'INQ-1001',
          name: '이지은',
          phone: '010-3344-5566',
          category: '숙박 및 멤버십',
          content: '가을 시즌 제주 오션스테이 단체 예약(6명) 및 쿠폰 복수 적용 가능 여부 상담 희망합니다.',
          preferredTime: '오후 2시~4시',
          status: '상담대기',
          createdAt: '2026-10-02 11:30',
          memo: ''
        }
      ]));
    }
    if (!localStorage.getItem(this.KEYS.CURRENT_USER)) {
      // Default demo guest or demo member
      localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify({
        isLoggedIn: true,
        name: '홍길동',
        phone: '010-1234-5678',
        couponCode: 'HD1-ABCD-X1A1602',
        branch: '강남서초',
        membershipGrade: 'PREMIUM VIP'
      }));
    }
  },

  getHotels() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.HOTELS)) || DEFAULT_HOTELS;
    } catch {
      return DEFAULT_HOTELS;
    }
  },
  saveHotels(hotels) {
    localStorage.setItem(this.KEYS.HOTELS, JSON.stringify(hotels));
  },

  getOtherProducts() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.OTHER_PRODUCTS)) || DEFAULT_OTHER_PRODUCTS;
    } catch {
      return DEFAULT_OTHER_PRODUCTS;
    }
  },
  saveOtherProducts(items) {
    localStorage.setItem(this.KEYS.OTHER_PRODUCTS, JSON.stringify(items));
  },

  getAllCatalog() {
    return [...this.getHotels(), ...this.getOtherProducts()];
  },

  getCoupons() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.COUPONS)) || [];
    } catch {
      return [];
    }
  },
  saveCoupons(coupons) {
    localStorage.setItem(this.KEYS.COUPONS, JSON.stringify(coupons));
  },

  getAllocations() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.ALLOCATIONS)) || DEFAULT_COUPON_ALLOCATIONS;
    } catch {
      return DEFAULT_COUPON_ALLOCATIONS;
    }
  },
  saveAllocations(allocs) {
    localStorage.setItem(this.KEYS.ALLOCATIONS, JSON.stringify(allocs));
  },

  getReservations() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.RESERVATIONS)) || [];
    } catch {
      return [];
    }
  },
  saveReservations(list) {
    localStorage.setItem(this.KEYS.RESERVATIONS, JSON.stringify(list));
  },

  getInquiries() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.INQUIRIES)) || [];
    } catch {
      return [];
    }
  },
  saveInquiries(list) {
    localStorage.setItem(this.KEYS.INQUIRIES, JSON.stringify(list));
  },

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.CURRENT_USER));
    } catch {
      return null;
    }
  },
  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.KEYS.CURRENT_USER);
    }
  }
};

Storage.init();
