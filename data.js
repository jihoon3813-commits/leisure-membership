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
        "id": "gentrify_sl_boutique",
        "name": "[경기/안산] SL 부띠끄 호텔",
        "location": "경기도 안산시 단원구",
        "region": "서울·경기",
        "category": "hotel",
        "price": 19000,
        "originalPrice": 220000,
        "discount": 91,
        "images": [
            "https://res.cloudinary.com/lyjyvy54/image/upload/v1792068703/%EB%85%B8%EC%9D%84%EB%B9%9B_%EB%B6%80%ED%8B%B0%ED%81%AC_%ED%98%B8%ED%85%94_%EB%A3%A8%ED%94%84%ED%86%B1_%EB%94%94%EB%84%88_izwkkq.png",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80"
        ],
        "tag": "LOUNGE PICK",
        "isMain": true,
        "desc": "황금빛 노을 아래 펼쳐지는 로맨틱 루프탑 다이닝과 감성 부티크 프라이빗 스테이",
        "benefit": "회원 전용 무료/우대 혜택 적용",
        "source": "gentrify",
        "rating": 4.9
    },
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

const DEFAULT_ADMIN_ACCOUNTS = [
  {
    id: 'ADM-001',
    username: 'admin',
    password: '1234',
    name: '총괄관리자',
    role: 'SUPER_ADMIN',
    roleName: '최고 관리자',
    department: '본사 IT운영총괄',
    phone: '010-1000-0001',
    email: 'admin@hdonelounge.com',
    status: 'ACTIVE',
    createdAt: '2026-01-01 09:00',
    lastLogin: '2026-10-06 11:15',
    memo: '전체 시스템 총괄 및 관리자 권한 제어'
  },
  {
    id: 'ADM-002',
    username: 'hotel_op',
    password: '1234',
    name: '박준영 팀장',
    role: 'OP_ADMIN',
    roleName: '운영 관리자',
    department: '숙박·제휴사업팀',
    phone: '010-2345-6789',
    email: 'jypark@hdonelounge.com',
    status: 'ACTIVE',
    createdAt: '2026-03-15 10:30',
    lastLogin: '2026-10-05 17:20',
    memo: '전국 제휴호텔 요금 및 상품 운영 전담'
  },
  {
    id: 'ADM-003',
    username: 'cs_lead',
    password: '1234',
    name: '이수민 매니저',
    role: 'CS_ADMIN',
    roleName: 'CS 상담관리자',
    department: '고객행복센터',
    phone: '010-3456-7890',
    email: 'smlee@hdonelounge.com',
    status: 'ACTIVE',
    createdAt: '2026-05-20 14:10',
    lastLogin: '2026-10-06 09:45',
    memo: '고객 예약 승인 및 1:1 상담 처리'
  },
  {
    id: 'ADM-004',
    username: 'gangnam_mgr',
    password: '1234',
    name: '최강남 지사장',
    role: 'BRANCH_ADMIN',
    roleName: '지사 관리자',
    department: '강남서초 지사',
    phone: '010-7788-9900',
    email: 'gangnam@hdonelounge.com',
    status: 'ACTIVE',
    createdAt: '2026-08-01 11:00',
    lastLogin: '2026-10-04 15:30',
    memo: '강남서초 지역 쿠폰 대역 발급 및 고객 배포 관리'
  },
  {
    id: 'ADM-005',
    username: 'audit_temp',
    password: '1234',
    name: '정윤호 연구원',
    role: 'VIEWER_ADMIN',
    roleName: '조회 전용',
    department: '외부 회계감사팀',
    phone: '010-5566-7788',
    email: 'audit@accounting.co.kr',
    status: 'INACTIVE',
    createdAt: '2026-09-01 13:00',
    lastLogin: '2026-09-28 16:10',
    memo: '분기 정산 감사용 임시 조회 계정 (사용 중지)'
  }
];

const DEFAULT_ADMIN_LOGS = [
  {
    id: 'LOG-001',
    adminId: 'admin',
    adminName: '총괄관리자',
    action: 'LOGIN',
    actionName: '관리자 콘솔 로그인',
    details: 'IP 121.134.82.11 - 관리자 콘솔 정상 접속',
    createdAt: '2026-10-06 11:00:22'
  },
  {
    id: 'LOG-002',
    adminId: 'hotel_op',
    adminName: '박준영 팀장',
    action: 'PRICE_UPDATE',
    actionName: '숙박시설 요금 일괄 변경',
    details: '인천 지역 숙박시설 4개 정가 200,000원 / 쿠폰가 19,000원 적용',
    createdAt: '2026-10-05 16:30:15'
  },
  {
    id: 'LOG-003',
    adminId: 'cs_lead',
    adminName: '이수민 매니저',
    action: 'RES_CONFIRM',
    actionName: '숙박 예약 승인',
    details: '예약번호 RES-20260920-001 (김철수) 예약 확정 처리',
    createdAt: '2026-10-05 14:12:00'
  },
  {
    id: 'LOG-004',
    adminId: 'gangnam_mgr',
    adminName: '최강남 지사장',
    action: 'COUPON_ALLOC',
    actionName: '쿠폰 대역 일괄 발급',
    details: '강남서초 지사 1602~2101번 (500매) 발급 등록',
    createdAt: '2026-10-04 10:15:30'
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
    DEFAULT_HOTEL_PRICE: 'hd_one_default_price_v3',
    ADMIN_ACCOUNTS: 'hd_one_admins_v3',
    ADMIN_LOGS: 'hd_one_admin_logs_v3',
    CURRENT_ADMIN: 'hd_one_current_admin_v3'
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
    if (!localStorage.getItem(this.KEYS.ADMIN_ACCOUNTS)) {
      localStorage.setItem(this.KEYS.ADMIN_ACCOUNTS, JSON.stringify(DEFAULT_ADMIN_ACCOUNTS));
    }
    if (!localStorage.getItem(this.KEYS.ADMIN_LOGS)) {
      localStorage.setItem(this.KEYS.ADMIN_LOGS, JSON.stringify(DEFAULT_ADMIN_LOGS));
    }
    // 기본은 로그아웃 상태로 설정 (기존 브라우저에 남아있던 데모 계정도 1회 초기화)
    if (!localStorage.getItem('hdone_default_logout_v1')) {
      const existingUser = this.getCurrentUser();
      if (existingUser && (existingUser.name === '홍길동' || existingUser.phone === '010-1234-5678' || existingUser.email === 'vip@hdone.kr')) {
        localStorage.removeItem(this.KEYS.CURRENT_USER);
      }
      localStorage.setItem('hdone_default_logout_v1', 'true');
    }

    // [경기/안산] SL 부띠끄 호텔 등록 보장
    try {
      const curHotels = this.getHotels();
      if (!curHotels.some(h => h.id === 'gentrify_sl_boutique')) {
        curHotels.unshift(DEFAULT_HOTELS[0]);
        this.saveHotels(curHotels);
      }
    } catch (e) {
      console.warn('SL Boutique hotel init check error:', e);
    }
  },

  getHotels() {
    try {
      const raw = localStorage.getItem(this.KEYS.HOTELS);
      if (!raw) return DEFAULT_HOTELS;
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return DEFAULT_HOTELS;
    } catch {
      return DEFAULT_HOTELS;
    }
  },
  saveHotels(hotels) {
    try {
      localStorage.setItem(this.KEYS.HOTELS, JSON.stringify(hotels));
      return true;
    } catch (e) {
      console.warn('saveHotels QuotaExceeded, attempting auto cleanup of non-essential logs...', e);
      try {
        // 관리자 로그나 임시 데이터 정리 후 재시도
        const logs = this.getAdminLogs().slice(0, 10);
        localStorage.setItem(this.KEYS.ADMIN_LOGS, JSON.stringify(logs));
        localStorage.setItem(this.KEYS.HOTELS, JSON.stringify(hotels));
        return true;
      } catch (retryErr) {
        console.error('saveHotels fatal QuotaExceededError:', retryErr);
        return false;
      }
    }
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

  getAdminAccounts() {
    try {
      const list = JSON.parse(localStorage.getItem(this.KEYS.ADMIN_ACCOUNTS)) || DEFAULT_ADMIN_ACCOUNTS;
      // 비밀번호 필드 보장
      return list.map(a => ({
        ...a,
        password: a.password || '1234'
      }));
    } catch {
      return DEFAULT_ADMIN_ACCOUNTS;
    }
  },
  saveAdminAccounts(list) {
    localStorage.setItem(this.KEYS.ADMIN_ACCOUNTS, JSON.stringify(list));
  },

  getCurrentAdmin() {
    try {
      const session = sessionStorage.getItem(this.KEYS.CURRENT_ADMIN) || localStorage.getItem(this.KEYS.CURRENT_ADMIN);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  },
  setCurrentAdmin(admin) {
    if (admin) {
      sessionStorage.setItem(this.KEYS.CURRENT_ADMIN, JSON.stringify(admin));
      localStorage.setItem(this.KEYS.CURRENT_ADMIN, JSON.stringify(admin));
    } else {
      sessionStorage.removeItem(this.KEYS.CURRENT_ADMIN);
      localStorage.removeItem(this.KEYS.CURRENT_ADMIN);
    }
  },

  getAdminLogs() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.ADMIN_LOGS)) || DEFAULT_ADMIN_LOGS;
    } catch {
      return DEFAULT_ADMIN_LOGS;
    }
  },
  saveAdminLogs(list) {
    localStorage.setItem(this.KEYS.ADMIN_LOGS, JSON.stringify(list));
  },
  addAdminLog(adminName, action, actionName, details) {
    const logs = this.getAdminLogs();
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    logs.unshift({
      id: 'LOG-' + Date.now().toString(36),
      adminId: 'admin',
      adminName: adminName || '총괄관리자',
      action: action || 'UPDATE',
      actionName: actionName || '시스템 작업',
      details: details || '',
      createdAt: timeStr
    });
    if (logs.length > 100) logs.length = 100;
    this.saveAdminLogs(logs);
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
  },

  // Convex Cloud Sync Helpers
  async syncFromConvex() {
    if (typeof ConvexService === 'undefined' || !ConvexService.isConnected()) return false;
    try {
      const remoteHotels = await ConvexService.query('hotels:list', {});
      if (remoteHotels && remoteHotels.length > 0) {
        // 로컬에만 있고 Convex에는 없는 custom 호텔이 있다면 Convex 클라우드로 자동 백업 및 병합
        const localHotels = this.getHotels();
        const remoteIds = new Set(remoteHotels.map(h => h.id || h.customId));
        const unsyncedLocals = localHotels.filter(h => h && h.id && !remoteIds.has(h.id) && h.source === 'custom');

        if (unsyncedLocals.length > 0) {
          console.log(`[Convex Sync] 로컬 전용 커스텀 호텔 ${unsyncedLocals.length}개를 클라우드 DB로 자동 백업합니다.`);
          for (const unsynced of unsyncedLocals) {
            await this.syncHotelToConvex(unsynced);
            remoteHotels.unshift(unsynced);
          }
        }

        this.saveHotels(remoteHotels);
      }
      const reservations = await ConvexService.query('reservations:list', {});
      if (reservations && reservations.length > 0) {
        this.saveReservations(reservations);
      }
      const inquiries = await ConvexService.query('inquiries:list', {});
      if (inquiries && inquiries.length > 0) {
        this.saveInquiries(inquiries);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('convex-synced', { detail: { timestamp: Date.now() } }));
      }
      return true;
    } catch (e) {
      console.warn('Convex sync error:', e);
      return false;
    }
  },

  async syncReservationToConvex(res) {
    if (typeof ConvexService === 'undefined' || !ConvexService.isConnected()) return;
    try {
      await ConvexService.mutation('reservations:create', {
        hotelId: String(res.hotelId || ''),
        hotelName: String(res.hotelName || ''),
        userName: String(res.userName || ''),
        userPhone: String(res.phone || res.userPhone || ''),
        couponCode: String(res.couponCode || ''),
        checkIn: String(res.checkIn || ''),
        checkOut: String(res.checkOut || ''),
        guests: Number(res.adults || 1) + Number(res.children || 0),
        requestMemo: res.requests || undefined,
      });
      console.log('✅ Convex reservation synced:', res.id);
    } catch (e) {
      console.warn('Convex reservation sync warning:', e);
    }
  },

  async syncInquiryToConvex(inq) {
    if (typeof ConvexService === 'undefined' || !ConvexService.isConnected()) return;
    try {
      await ConvexService.mutation('inquiries:create', {
        name: String(inq.name || ''),
        phone: String(inq.phone || ''),
        title: String(inq.title || inq.type || '상담 문의'),
        content: String(inq.content || ''),
      });
      console.log('✅ Convex inquiry synced:', inq.id);
    } catch (e) {
      console.warn('Convex inquiry sync warning:', e);
    }
  },

  async syncHotelToConvex(hotel) {
    if (typeof ConvexService === 'undefined' || !ConvexService.isConnected()) return false;
    try {
      await ConvexService.mutation('hotels:upsert', {
        customId: String(hotel.id || ''),
        name: String(hotel.name || ''),
        location: String(hotel.location || ''),
        region: String(hotel.region || '기타'),
        category: String(hotel.category || 'hotel'),
        price: Number(hotel.price) || 19000,
        originalPrice: Number(hotel.originalPrice) || 200000,
        discount: Number(hotel.discount) || 0,
        images: Array.isArray(hotel.images) && hotel.images.length > 0 ? hotel.images : ['assets/resort.jpg'],
        tag: hotel.tag || 'LOUNGE PICK',
        isMain: Boolean(hotel.isMain),
        desc: hotel.desc || '',
        benefit: hotel.benefit || '회원 전용 우대 혜택 적용',
        source: hotel.source || 'custom',
        rating: Number(hotel.rating) || 4.9
      });
      console.log('✅ Convex hotel synced (upsert):', hotel.name);
      return true;
    } catch (e) {
      console.warn('Convex hotel sync warning:', e);
      return false;
    }
  },

  async deleteHotelFromConvex(id) {
    if (typeof ConvexService === 'undefined' || !ConvexService.isConnected()) return false;
    try {
      await ConvexService.mutation('hotels:removeByCustomId', {
        customId: String(id)
      });
      console.log('✅ Convex hotel deleted:', id);
      return true;
    } catch (e) {
      console.warn('Convex hotel deletion warning:', e);
      return false;
    }
  }
};

Storage.init();

// Convex 자동 동기화 시도 (페이지 로딩 완료 후 지연 실행)
if (typeof window !== 'undefined') {
  function startConvexSync() {
    setTimeout(() => {
      if (typeof Storage !== 'undefined' && Storage.syncFromConvex) {
        Storage.syncFromConvex();
      }
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startConvexSync);
  } else {
    startConvexSync();
  }
}

