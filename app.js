/**
 * HD ONE LOUNGE - Client Interaction Engine
 */

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// Safe Reference: Storage is provided globally by data.js


// Application State
function getInitialSavedIds() {
  try {
    const raw = localStorage.getItem('hd_one_saved');
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

const State = {
  category: 'all',
  region: 'all',
  savedOnly: false,
  savedIds: getInitialSavedIds(),
  slideIndices: {}, // hotelId -> active slide index (0..2)
  flatpickrInstance: null,
  searchQuery: '',
  visibleLimit: (typeof Storage !== 'undefined' && Storage.getMainDisplayCount) ? Storage.getMainDisplayCount() : 16,
  pageSize: 12
};

// Hotel Search & Load More Handlers
window.handleHotelSearch = function(val) {
  State.searchQuery = (val || '').trim().toLowerCase();
  const clearBtn = $('#search-clear-btn');
  if (clearBtn) clearBtn.hidden = !State.searchQuery;
  const baseCount = (typeof Storage !== 'undefined' && Storage.getMainDisplayCount) ? Storage.getMainDisplayCount() : 16;
  State.visibleLimit = baseCount;
  renderCatalog();
};

window.clearHotelSearch = function() {
  const input = $('#hotel-search-input');
  if (input) input.value = '';
  window.handleHotelSearch('');
};

window.handleLoadMore = function() {
  const step = State.pageSize || 12;
  if (State.visibleLimit === 'all') return;
  State.visibleLimit = (Number(State.visibleLimit) || 16) + step;
  renderCatalog();
};

// 메인 표시 개수 변경 및 순서 변경 이벤트 리스너
if (typeof window !== 'undefined') {
  window.addEventListener('main-display-count-changed', (e) => {
    if (e.detail && e.detail.count) {
      State.visibleLimit = e.detail.count;
      renderCatalog();
    }
  });
  window.addEventListener('hotels-reordered', () => {
    renderCatalog();
  });
  // 다른 탭/창(예: 관리자 페이지)에서 순서나 데이터 변경 시 메인 화면 실시간 자동 갱신
  window.addEventListener('storage', (e) => {
    if (e.key === 'hd_one_hotels_v3' || e.key === 'hd_one_tab_sync' || e.key === 'hd_one_hotels_reordered_at' || e.key === 'hd_one_main_display_count_v3') {
      if (Storage.getMainDisplayCount) {
        State.visibleLimit = Storage.getMainDisplayCount();
      }
      renderCatalog();
    }
  });
}

// Utilities
const Money = n => (Number(n) || 0).toLocaleString('ko-KR');

function showToast(message) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    el.classList.remove('show');
  }, 2400);
}

function autoHyphenPhone(str) {
  if (!str) return '';
  str = str.replace(/[^0-9]/g, '');
  if (str.length < 4) return str;
  if (str.length < 7) return str.substr(0, 3) + '-' + str.substr(3);
  if (str.length < 11) return str.substr(0, 3) + '-' + str.substr(3, 3) + '-' + str.substr(6);
  return str.substr(0, 3) + '-' + str.substr(3, 4) + '-' + str.substr(7, 4);
}

function autoHyphenCoupon(str) {
  if (!str) return '';
  const clean = str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (/^\d{1,4}$/.test(clean)) return clean;
  if (clean.length <= 3) return clean;
  if (clean.length <= 7) return clean.substr(0, 3) + '-' + clean.substr(3);
  return clean.substr(0, 3) + '-' + clean.substr(3, 4) + '-' + clean.substr(7, 7);
}

window.autoHyphenPhone = autoHyphenPhone;
window.autoHyphenCoupon = autoHyphenCoupon;

// Dialog Controller
function openDialog(html, options = {}) {
  const dialog = $('#dialog');
  const content = $('#dialog-content');
  if (options && options.wide) {
    dialog.classList.add('dialog-wide');
  } else {
    dialog.classList.remove('dialog-wide');
  }
  content.innerHTML = html;
  dialog.showModal();
  document.body.style.overflow = 'hidden';
}

function closeDialog() {
  const dialog = $('#dialog');
  if (dialog && dialog.open) {
    dialog.close();
  }
}

if ($('#dialog')) {
  $('#dialog').addEventListener('close', () => {
    document.body.style.overflow = '';
    $('#dialog').classList.remove('dialog-wide');
    if (State.flatpickrInstance) {
      State.flatpickrInstance.destroy();
      State.flatpickrInstance = null;
    }
  });
  const closeBtn = $('.close');
  if (closeBtn) closeBtn.onclick = closeDialog;
}

// User Coupons Helper Functions
function getMyRegisteredCoupons(user) {
  if (!user) return [];
  const allCoupons = Storage.getCoupons();
  return allCoupons.filter(c => 
    (user.email && c.userEmail === user.email) ||
    (user.phone && c.userPhone === user.phone) ||
    (c.assignedUser && c.assignedUser === user.name && c.userPhone === user.phone)
  );
}

function getMyAvailableCoupons(user) {
  return getMyRegisteredCoupons(user).filter(c => c.status === 'REGISTERED');
}

// Update Member Strip in Main Screen
function updateMemberStripUI() {
  const user = Storage.getCurrentUser();
  const textEl = $('#member-strip-text');
  if (!textEl) return;
  
  if (user && user.isLoggedIn) {
    const availableCoupons = getMyAvailableCoupons(user);
    textEl.innerHTML = `
      <b>${user.name} 회원님 [${availableCoupons.length > 0 ? 'VIP 정회원' : '정회원'}]</b>
      <span>보유 숙박 쿠폰: <strong>${availableCoupons.length > 0 ? `${availableCoupons.length}장 보유 (1박 무료 숙박 가능)` : '미등록 (쿠폰 등록 시 1박 무료)'}</strong></span>
    `;
  } else {
    textEl.innerHTML = `
      <b>회원이기에 누리는 더 좋은 선택</b>
      <span><a href="javascript:void(0);" onclick="openSignupDialog()" style="text-decoration:underline;color:var(--blue);font-weight:700;">간편 회원가입</a> 후 48개 명품 숙박 무료/우대 혜택을 누려보세요.</span>
    `;
  }
}

function updateUserHeaderUI() {
  const user = Storage.getCurrentUser();
  const slot = $('#user-header-slot');
  if (!slot) return;

  if (user && user.isLoggedIn) {
    slot.innerHTML = `
      <button class="header-btn primary" data-action="member">${user.name} 님 [MY 라운지]</button>
      <button class="header-btn" onclick="logoutUser()">로그아웃</button>
    `;
  } else {
    slot.innerHTML = `
      <button class="header-btn" onclick="openLoginDialog()">로그인</button>
      <button class="header-btn primary" onclick="openSignupDialog()">회원가입</button>
    `;
  }
}

window.logoutUser = function() {
  if (!confirm('로그아웃 하시겠습니까?')) return;
  Storage.setCurrentUser(null);
  updateMemberStripUI();
  updateUserHeaderUI();
  renderCatalog();
  showToast('안전하게 로그아웃되었습니다.');
};

// Catalog Rendering
function renderCatalog() {
  const curStorage = (typeof HDStorage !== 'undefined' && HDStorage.getHotels) ? HDStorage : ((typeof Storage !== 'undefined' && Storage.getHotels) ? Storage : null);
  if (!curStorage) {
    console.warn('Storage engine not ready yet, retrying renderCatalog in 50ms...');
    setTimeout(renderCatalog, 50);
    return;
  }

  const user = curStorage.getCurrentUser ? curStorage.getCurrentUser() : null;
  const isLoggedIn = Boolean(user && user.isLoggedIn);

  const hotels = curStorage.getHotels ? curStorage.getHotels() : [];
  const others = curStorage.getOtherProducts ? curStorage.getOtherProducts() : [];
  let all = [...hotels, ...others];

  const titles = {
    all: '지금, 머물고 싶은 곳',
    hotel: '호텔·리조트 (전국 48선)',
    villa: '프라이빗 펜션 & 풀빌라',
    leisure: '여행에 더하는 즐거움',
    travel: '떠나고 싶은 순간'
  };

  const descriptions = {
    all: '좋은 공간에서 시작되는 나만의 온전한 휴식',
    hotel: '엄선된 전국 최고급 호텔 및 리조트 회원 전용 예약',
    villa: '오롯이 프라이빗한 시간을 선사하는 독채 풀빌라',
    leisure: '요트 투어, 테마파크, 프리미엄 스파 & 웰니스',
    travel: '제주와 남해, 감성 가득한 테마 여행 패키지'
  };

  let items = all.filter(p => {
    // Search query filter
    if (State.searchQuery) {
      const q = State.searchQuery;
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchLoc = (p.location || '').toLowerCase().includes(q);
      const matchReg = (p.region || '').toLowerCase().includes(q);
      const matchDesc = (p.desc || '').toLowerCase().includes(q);
      const matchBen = (p.benefit || '').toLowerCase().includes(q);
      const matchTag = (p.tag || '').toLowerCase().includes(q);
      if (!matchName && !matchLoc && !matchReg && !matchDesc && !matchBen && !matchTag) {
        return false;
      }
    }

    // Category filter
    if (State.category !== 'all' && p.category !== State.category) return false;
    
    // Region filter
    if (State.region !== 'all') {
      if (State.region === '기타') {
        const standardRegions = ['인천', '강원', '부산', '서울·경기', '제주', '경상'];
        if (standardRegions.includes(p.region)) return false;
      } else if (p.region !== State.region) {
        return false;
      }
    }
    
    // Saved filter
    if (State.savedOnly && !State.savedIds.has(p.id)) return false;
    
    return true;
  });

  // Sort: isMain items come first, then sorted by displayOrder (어드민 드래그앤드롭 순서 반영)
  items = items.sort((a, b) => {
    const aMain = Boolean(a.isMain);
    const bMain = Boolean(b.isMain);
    if (aMain !== bMain) return bMain ? 1 : -1;

    const orderA = a.displayOrder !== undefined ? Number(a.displayOrder) : 999999;
    const orderB = b.displayOrder !== undefined ? Number(b.displayOrder) : 999999;
    return orderA - orderB;
  });

  const totalCount = items.length;
  const currentLimit = State.visibleLimit === 'all' ? totalCount : (Number(State.visibleLimit) || 16);
  const displayedItems = items.slice(0, currentLimit);

  // Update Headings
  const titleEl = $('#section-title');
  const descEl = $('#section-desc');
  const badgeEl = $('#catalog-count-badge');
  const savedCountEl = $('#saved-count');

  if (titleEl) {
    if (State.searchQuery) {
      titleEl.textContent = `'${State.searchQuery}' 검색 결과`;
    } else {
      titleEl.textContent = State.savedOnly ? '내가 찜한 혜택' : (titles[State.category] || '큐레이션 컬렉션');
    }
  }
  if (descEl) descEl.textContent = State.savedOnly ? '마음에 드는 숙박과 여행을 한곳에 모았습니다.' : (descriptions[State.category] || '');
  if (badgeEl) badgeEl.textContent = `선택 상품 ${totalCount}개`;
  if (savedCountEl) savedCountEl.textContent = State.savedIds.size;

  const grid = $('#products');
  const empty = $('#empty');
  const loadMoreWrap = $('#load-more-wrap');
  const loadMoreCount = $('#load-more-count');

  if (!grid) return;

  if (totalCount === 0) {
    grid.innerHTML = '';
    if (empty) empty.hidden = false;
    if (loadMoreWrap) loadMoreWrap.style.display = 'none';
    return;
  }
  if (empty) empty.hidden = true;

  // Load More Button Visibility & Count
  if (loadMoreWrap) {
    if (displayedItems.length < totalCount) {
      loadMoreWrap.style.display = 'flex';
      if (loadMoreCount) loadMoreCount.textContent = `(${displayedItems.length} / ${totalCount})`;
    } else {
      loadMoreWrap.style.display = 'none';
    }
  }

  grid.innerHTML = displayedItems.map(p => {
    const images = Array.isArray(p.images) && p.images.length > 0 ? p.images : ['assets/room.jpg'];
    const activeIdx = State.slideIndices[p.id] || 0;
    const isSaved = State.savedIds.has(p.id);

    return `
      <article class="product" data-product-id="${p.id}">
        <div class="picture">
          <!-- Carousel Track -->
          <div class="carousel-track" style="transform: translateX(-${activeIdx * 33.3333}%);" id="track-${p.id}">
            ${images.map((img, idx) => `
              <div class="carousel-slide" onclick="openReserveModal('${p.id}')">
                <img src="${img}" alt="${p.name} 사진 ${idx + 1}" loading="lazy" onerror="this.src='assets/room.jpg'">
              </div>
            `).join('')}
          </div>

          <!-- Carousel Controls -->
          ${images.length > 1 ? `
            <button class="carousel-btn prev" onclick="moveSlide('${p.id}', -1, event)" aria-label="이전 사진">‹</button>
            <button class="carousel-btn next" onclick="moveSlide('${p.id}', 1, event)" aria-label="다음 사진">›</button>
            <div class="carousel-dots" id="dots-${p.id}">
              ${images.map((_, idx) => `
                <span class="carousel-dot ${idx === activeIdx ? 'active' : ''}"></span>
              `).join('')}
            </div>
          ` : ''}

          <span class="badge">${p.tag || 'HD LOUNGE'}</span>
          <button class="heart ${isSaved ? 'on' : ''}" onclick="toggleSave('${p.id}', event)" aria-label="찜하기">
            <svg><use href="#heart"/></svg>
          </button>
        </div>

        <div class="product-content">
          <div class="meta">
            <span class="meta-badge">${p.region}</span>
            <span>${p.location}</span>
          </div>
          <button class="title" onclick="openReserveModal('${p.id}')" title="${p.name}">
            ${p.name}
          </button>
          <p class="desc">${p.desc || p.location + '에 위치한 프리미엄 스테이'}</p>
          
          <div class="price-line">
            ${isLoggedIn ? `
              <span class="discount">${p.discount || 30}%</span>
              <strong>${Money(p.price)}원</strong>
              <small>부터</small>
            ` : `
              <strong class="member-price-highlight">회원가 적용</strong>
            `}
          </div>
          <p class="original">${Money(p.originalPrice || Math.round(p.price * 1.45))}원</p>

          <div class="product-footer">
            <span class="price-note">${p.benefit || '회원 전용 우대 혜택'}</span>
            <button class="btn-reserve-trigger" onclick="openReserveModal('${p.id}')">
              예약 신청
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Update tabs active state
  $$('#region-tabs button').forEach(b => {
    b.classList.toggle('selected', b.dataset.region === State.region);
  });
  $$('.desktop button').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === State.category);
  });
}

// Carousel Slide Navigator
window.moveSlide = function(id, direction, e) {
  if (e) e.stopPropagation();
  const all = Storage.getAllCatalog();
  const item = all.find(x => x.id === id);
  if (!item || !item.images || item.images.length <= 1) return;

  const total = item.images.length;
  let curr = State.slideIndices[id] || 0;
  curr = (curr + direction + total) % total;
  State.slideIndices[id] = curr;

  const track = $(`#track-${id}`);
  const dotsContainer = $(`#dots-${id}`);
  if (track) {
    track.style.transform = `translateX(-${curr * (100 / total)}%)`;
  }
  if (dotsContainer) {
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === curr);
    });
  }
};

// Wishlist Toggle
window.toggleSave = function(id, e) {
  if (e) e.stopPropagation();
  if (State.savedIds.has(id)) {
    State.savedIds.delete(id);
    showToast('관심 상품에서 삭제했습니다.');
  } else {
    State.savedIds.add(id);
    showToast('관심 상품(찜한 혜택)에 담았습니다.');
  }
  localStorage.setItem('hd_one_saved', JSON.stringify([...State.savedIds]));
  renderCatalog();
};

// Switch Category / Region
function selectCategory(cat) {
  State.category = cat;
  State.region = 'all';
  State.savedOnly = false;
  renderCatalog();
  const disc = $('#discover');
  if (disc) disc.scrollIntoView({ behavior: 'smooth' });
}

function selectRegion(reg) {
  State.region = reg;
  renderCatalog();
}

// Full Address Formatter (도로명/지번 + 법정동/건물명 괄호 상세 주소)
function formatFullAddress(data) {
  let addr = data.userSelectedType === 'R' 
    ? (data.roadAddress || data.autoRoadAddress || data.address) 
    : (data.jibunAddress || data.autoJibunAddress || data.address);
  
  if (!addr) addr = data.address || '';

  const extras = [];
  if (data.userSelectedType === 'R') {
    // 법정동/로/가
    if (data.bname && /[동|로|가]$/g.test(data.bname)) {
      extras.push(data.bname);
    }
    // 건물명 (아파트, 오피스텔, 빌딩명 등)
    if (data.buildingName) {
      extras.push(data.buildingName);
    }
  } else {
    if (data.buildingName && !addr.includes(data.buildingName)) {
      extras.push(data.buildingName);
    }
  }

  if (extras.length > 0) {
    addr += ` (${extras.join(', ')})`;
  }

  return addr;
}

// Daum Postcode Search Trigger
window.execDaumPostcode = function() {
  new daum.Postcode({
    oncomplete: function(data) {
      const fullAddr = formatFullAddress(data);
      const postcodeEl = $('#res-postcode');
      const addrEl = $('#res-addr');
      const detailEl = $('#res-addr-detail');
      if (postcodeEl) postcodeEl.value = data.zonecode;
      if (addrEl) addrEl.value = fullAddr;
      if (detailEl) detailEl.focus();
    }
  }).open();
};

// ==========================================
// RESERVATION MODAL (입실/퇴실 캘린더, 주소검색, 수저/요청사항, 인원, 약관동의, 금액계산)
// ==========================================
window.openReserveModal = function(id) {
  const user = Storage.getCurrentUser();
  if (!user || !user.isLoggedIn) {
    if (confirm('숙박시설 예약 신청은 에이치디원 라운지 회원 전용 혜택입니다.\n회원가입 또는 로그인을 진행하시겠습니까?')) {
      openLoginDialog();
    }
    return;
  }

  const all = Storage.getAllCatalog();
  const item = all.find(x => x.id === id);
  if (!item) return;

  const origPrice = item.originalPrice || 200000;
  const couponPrice = item.price || 19000;
  const availableCoupons = getMyAvailableCoupons(user);

  const initialNights = 1;
  const defaultTotal = origPrice * initialNights;
  const initialApplied = availableCoupons.length > 0 ? 1 : 0;
  const discountPerNight = origPrice - couponPrice;
  const initialDiscount = initialApplied * discountPerNight;
  const initialFinal = Math.max(0, defaultTotal - initialDiscount);

  const html = `
    <div class="reserve-header">
      <span class="eyebrow blue">${item.category === 'hotel' ? '호텔·리조트 예약' : '프리미엄 혜택 예약'}</span>
      <h2 class="hotel-name">${item.name}</h2>
      <div class="hotel-loc">📍 ${item.location} (${item.region}) · 기준 2인 / 최대 4인</div>
      <img src="${(item.images && item.images[0]) || 'assets/resort.jpg'}" class="reserve-preview-img" alt="${item.name}">
    </div>

    <form id="reserve-form" class="reserve-form-grid" onsubmit="handleReserveSubmit(event, '${item.id}')">
      
      <!-- 날짜 선택 (Flatpickr 캘린더) -->
      <div class="form-group" style="position:relative;">
        <label for="res-dates">
          <span>입실일 / 퇴실일 선택</span>
          <span class="required">*</span>
          <small style="color:var(--blue);font-weight:normal;">(달력에서 체크인과 체크아웃을 차례대로 클릭하세요)</small>
        </label>
        <input type="text" id="res-dates" placeholder="입실일과 퇴실일을 선택하세요" readonly required style="cursor:pointer;background:#ffffff;">
        <input type="hidden" id="res-checkin">
        <input type="hidden" id="res-checkout">
        <input type="hidden" id="res-nights" value="1">
      </div>

      <!-- 인원 설정 -->
      <div class="form-row">
        <div class="form-group">
          <label>성인 인원</label>
          <div class="counter-box">
            <button type="button" onclick="adjustCount('res-adults', -1)">-</button>
            <span id="res-adults-text">2명</span>
            <button type="button" onclick="adjustCount('res-adults', 1)">+</button>
            <input type="hidden" id="res-adults" value="2">
          </div>
        </div>
        <div class="form-group">
          <label>아동 인원 (만 12세 이하)</label>
          <div class="counter-box">
            <button type="button" onclick="adjustCount('res-children', -1)">-</button>
            <span id="res-children-text">0명</span>
            <button type="button" onclick="adjustCount('res-children', 1)">+</button>
            <input type="hidden" id="res-children" value="0">
          </div>
        </div>
      </div>

      <!-- 예약자명 & 연락처 -->
      <div class="form-row">
        <div class="form-group">
          <label for="res-name">예약자명 <span class="required">*</span></label>
          <input type="text" id="res-name" value="${user.name || ''}" placeholder="홍길동" required>
        </div>
        <div class="form-group">
          <label for="res-phone">연락처 <span class="required">*</span></label>
          <input type="tel" id="res-phone" inputmode="numeric" maxlength="13" 
            value="${user.phone || ''}" placeholder="010-0000-0000" 
            oninput="this.value = autoHyphenPhone(this.value)" required>
        </div>
      </div>

      <!-- 주소 검색 (우편번호 & 상세주소) -->
      <div class="form-group">
        <label>주소지 (안내문 발송 및 회원 본인 확인용) <span class="required">*</span></label>
        <div class="addr-search-row">
          <input type="text" id="res-postcode" placeholder="우편번호" readonly style="max-width:110px;">
          <input type="text" id="res-addr" placeholder="기본 주소 (주소 검색 클릭)" readonly required>
          <button type="button" class="btn-addr" onclick="execDaumPostcode()">주소 검색</button>
        </div>
        <input type="text" id="res-addr-detail" placeholder="상세주소 (동·호수 등)를 입력하세요" style="margin-top:6px;" required>
      </div>

      <!-- 상세 요청 사항 및 수저/식기류 입력 -->
      <div class="form-group">
        <label for="res-requests">
          <span>상세 요청사항 (수저·식기류, 침구, 입실예정 시간 등)</span>
        </label>
        <textarea id="res-requests" rows="2" placeholder="요청사항을 입력해주세요 (예: 추가 수저 2벌 및 침구 1채 요청, 16시 입실 예정)"></textarea>
      </div>

      <!-- 숙박 쿠폰 적용 (1박당 1장 사용 가능) -->
      <div class="form-group" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <label style="margin:0;font-weight:700;color:var(--navy);font-size:13.5px;">🎟️ 숙박 쿠폰 적용 (1박당 1장 사용)</label>
          <span style="font-size:11.5px;color:var(--blue);font-weight:700;">1박 쿠폰 우대가 (${Money(couponPrice)}원)</span>
        </div>

        ${availableCoupons.length > 0 ? `
          <div style="margin-bottom:10px;">
            <div style="font-size:12px;color:#64748b;margin-bottom:6px;">
              보유 쿠폰 선택 (사용 가능: ${availableCoupons.length}장 / 1박당 최대 1장 적용)
            </div>
            <div id="res-coupon-list-wrap" style="display:flex;flex-direction:column;gap:6px;">
              ${availableCoupons.map((c, idx) => `
                <label class="res-coupon-card">
                  <input type="checkbox" name="res-coupon-item" value="${c.code}" class="res-coupon-check" ${idx === 0 ? 'checked' : ''} onchange="updateReserveCouponCalc(${origPrice}, ${couponPrice})">
                  <span class="res-coupon-code">${c.code}</span>
                  <span class="res-coupon-tag">1박 쿠폰 적용</span>
                </label>
              `).join('')}
            </div>
          </div>
        ` : `
          <div id="res-no-coupon-msg" style="font-size:12px;color:#64748b;margin-bottom:8px;">
            보유하신 쿠폰 번호가 있으시면 아래에 직접 입력하여 적용하실 수 있습니다.
          </div>
          <div id="res-coupon-list-wrap" style="display:flex;flex-direction:column;gap:6px;margin-bottom:8px;"></div>
        `}

        <!-- 직접 쿠폰 번호 입력 -->
        <div style="display:flex;gap:6px;">
          <input type="text" id="res-direct-code" placeholder="쿠폰 번호 직접 입력" 
            style="text-transform:uppercase;font-size:13px;padding:9px 12px;letter-spacing:0.5px;"
            oninput="this.value = autoHyphenCoupon(this.value)" maxlength="16">
          <button type="button" class="btn-addr" onclick="applyDirectReserveCoupon(${origPrice}, ${couponPrice})" style="padding:0 14px;font-size:12px;white-space:nowrap;">쿠폰 적용</button>
        </div>
      </div>

      <!-- 이용약관 동의 박스 -->
      <div class="terms-box">
        <div class="terms-title">숙박시설 이용 및 취소/환불 규정</div>
        <div class="terms-content">
          제1조 (목적) 본 규정은 에이치디원 라운지 회원 전용 숙박 예약 및 이용에 관한 제반 사항을 규정함을 목적으로 합니다.<br>
          제2조 (예약 및 확정) 회원이 신청한 예약은 숙박시설의 잔여 객실 사정에 따라 관리자 또는 전담 컨시어지의 확인 후 최종 확정됩니다.<br>
          제3조 (취소 및 환불) 입실 7일 전까지는 전액 취소 가능하며, 입실 당일 노쇼(No-Show) 시에는 회원 규정에 따라 쿠폰이 차감될 수 있습니다.<br>
          제4조 (시설 준수사항) 반려동물 동반 가능 여부는 숙소별 개별 기준에 따르며, 객실 내 흡연 및 화재 위험물 사용은 엄격히 금지됩니다.
        </div>
        <label class="terms-check">
          <input type="checkbox" id="res-terms" required>
          <span>숙박시설 이용 규정 및 취소/환불 규정에 동의합니다 (필수)</span>
        </label>
      </div>

      <!-- 결제금액 계산 바 -->
      <div class="calc-summary">
        <div class="calc-row">
          <span>1박 정상 요금</span>
          <span>${Money(origPrice)}원</span>
        </div>
        <div class="calc-row">
          <span>1박 회원 쿠폰가</span>
          <span style="color:var(--blue);font-weight:700;">${Money(couponPrice)}원</span>
        </div>
        <div class="calc-row">
          <span>숙박 일수</span>
          <span id="calc-nights-text">1박</span>
        </div>
        <div class="calc-row">
          <span>총 정상 숙박요금</span>
          <span id="calc-subtotal-text">${Money(defaultTotal)}원</span>
        </div>
        <div class="calc-row" id="calc-discount-row" style="color:var(--blue);font-weight:700;display:${initialApplied > 0 ? 'flex' : 'none'};">
          <span>숙박 쿠폰 할인 혜택</span>
          <span id="calc-discount-text">-${Money(initialDiscount)}원 (${initialApplied}박 쿠폰가 적용)</span>
        </div>
        <div class="calc-row total">
          <span>최종 결제/예약 금액</span>
          <strong id="calc-final-price">${Money(initialFinal)}원</strong>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="modal-actions">
        <button type="button" class="btn-cancel" onclick="closeDialog()">닫기</button>
        <button type="submit" class="btn-submit-reserve">예약 접수하기</button>
      </div>
    </form>
  `;

  openDialog(html);

  // Initialize Flatpickr Date Picker
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  State.flatpickrInstance = flatpickr('#res-dates', {
    mode: 'range',
    locale: 'ko',
    minDate: 'today',
    dateFormat: 'Y-m-d',
    defaultDate: [tomorrow, dayAfter],
    static: true,
    appendTo: $('#dialog-content'),
    monthSelectorType: 'static',
    onChange: function(selectedDates) {
      if (selectedDates.length === 2) {
        const start = selectedDates[0];
        const end = selectedDates[1];
        const nights = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
        
        $('#res-checkin').value = start.toISOString().split('T')[0];
        $('#res-checkout').value = end.toISOString().split('T')[0];
        $('#res-nights').value = nights;

        updateReserveCouponCalc(origPrice, couponPrice);
      }
    }
  });

  const dateInput = $('#res-dates');
  if (dateInput) {
    dateInput.style.cursor = 'pointer';
    dateInput.onclick = () => {
      if (State.flatpickrInstance) State.flatpickrInstance.open();
    };
  }

  // Set initial dates
  $('#res-checkin').value = tomorrow.toISOString().split('T')[0];
  $('#res-checkout').value = dayAfter.toISOString().split('T')[0];
  $('#res-nights').value = 1;
};

// Counter Helper
window.adjustCount = function(id, delta) {
  const el = $(`#${id}`);
  const textEl = $(`#${id}-text`);
  if (!el || !textEl) return;
  let val = parseInt(el.value, 10) + delta;
  if (id === 'res-adults') val = Math.max(1, Math.min(8, val));
  if (id === 'res-children') val = Math.max(0, Math.min(6, val));
  el.value = val;
  textEl.textContent = val + '명';
};

// Update Price & Coupon Calculation in Reservation Modal
window.updateReserveCouponCalc = function(origPrice, couponPrice) {
  origPrice = origPrice || 200000;
  couponPrice = couponPrice || 19000;
  const nights = parseInt($('#res-nights').value || '1', 10);
  const checkedBoxes = Array.from($$('input[name="res-coupon-item"]:checked'));
  
  if (checkedBoxes.length > nights) {
    alert(`선택하신 숙박 일수(${nights}박)보다 많은 쿠폰을 선택할 수 없습니다.\n(최대 ${nights}장 적용 가능)`);
    const lastChecked = checkedBoxes[checkedBoxes.length - 1];
    if (lastChecked) lastChecked.checked = false;
  }

  const validChecked = Array.from($$('input[name="res-coupon-item"]:checked'));
  const appliedCount = Math.min(validChecked.length, nights);

  const subtotal = origPrice * nights;
  const discountAmount = appliedCount * (origPrice - couponPrice);
  const finalPrice = Math.max(0, subtotal - discountAmount);

  $('#calc-nights-text').textContent = nights + '박';
  $('#calc-subtotal-text').textContent = Money(subtotal) + '원';

  const discountRow = $('#calc-discount-row');
  const discountText = $('#calc-discount-text');
  const finalPriceEl = $('#calc-final-price');

  if (appliedCount > 0) {
    if (discountRow) discountRow.style.display = 'flex';
    if (discountText) discountText.textContent = `-${Money(discountAmount)}원 (${appliedCount}박 쿠폰가 ${Money(couponPrice)}원 적용)`;
  } else {
    if (discountRow) discountRow.style.display = 'none';
  }

  if (finalPriceEl) {
    finalPriceEl.textContent = Money(finalPrice) + '원';
  }
};

// Direct Coupon Apply in Reservation Modal
window.applyDirectReserveCoupon = function(origPrice, couponPrice) {
  origPrice = origPrice || 200000;
  couponPrice = couponPrice || 19000;
  const input = $('#res-direct-code');
  if (!input) return;
  const rawCode = input.value.trim().toUpperCase();
  if (!rawCode) {
    alert('쿠폰 번호를 입력해주세요.');
    return;
  }

  const num = COUPON_RULE.parseCode(rawCode);
  if (!num) {
    alert('올바른 쿠폰 번호 형식이 아닙니다.');
    return;
  }

  const coupons = Storage.getCoupons();
  const clean = rawCode.replace(/[^A-Z0-9]/g, '');
  const target = coupons.find(c => c.num === num || c.code === rawCode || c.code.replace(/[^A-Z0-9]/g, '') === clean);

  if (!target || target.status === 'NOT_ISSUED') {
    alert('유효하지 않거나 미발급된 쿠폰 번호입니다.');
    return;
  }
  if (target.status === 'USED') {
    alert('이미 숙박 예약에 사용 완료된 쿠폰 번호입니다.');
    return;
  }

  // Check if already in the list
  const existingInput = $(`input[name="res-coupon-item"][value="${target.code}"]`);
  if (existingInput) {
    existingInput.checked = true;
    updateReserveCouponCalc(origPrice, couponPrice);
    input.value = '';
    showToast(`쿠폰(${target.code})이 적용되었습니다.`);
    return;
  }

  // Register to current user if logged in
  const user = Storage.getCurrentUser();
  if (user && user.isLoggedIn) {
    target.status = 'REGISTERED';
    target.assignedUser = user.name;
    target.userPhone = user.phone;
    target.userEmail = user.email;
    target.registeredAt = new Date().toLocaleString('ko-KR');
    Storage.saveCoupons(coupons);
    if (Storage.registerCouponOnConvex) {
      Storage.registerCouponOnConvex(target.code, user.name, user.phone);
    }
  }

  // Append to list and check it
  const wrap = $('#res-coupon-list-wrap');
  const noMsg = $('#res-no-coupon-msg');
  if (noMsg) noMsg.style.display = 'none';

  const newLabel = document.createElement('label');
  newLabel.className = 'res-coupon-card';
  newLabel.innerHTML = `
    <input type="checkbox" name="res-coupon-item" value="${target.code}" class="res-coupon-check" checked onchange="updateReserveCouponCalc(${origPrice}, ${couponPrice})">
    <span class="res-coupon-code">${target.code}</span>
    <span class="res-coupon-tag">1박 쿠폰 적용</span>
  `;
  wrap.appendChild(newLabel);

  input.value = '';
  updateReserveCouponCalc(origPrice, couponPrice);
  showToast(`쿠폰(${target.code})이 성공적으로 적용되었습니다!`);
};

// Reservation Form Submit Handler
window.handleReserveSubmit = function(e, hotelId) {
  e.preventDefault();
  const all = Storage.getAllCatalog();
  const item = all.find(x => x.id === hotelId);
  if (!item) return;

  const datesVal = $('#res-dates').value;
  const checkIn = $('#res-checkin').value;
  const checkOut = $('#res-checkout').value;
  const nights = parseInt($('#res-nights').value || '1', 10);
  const name = $('#res-name').value.trim();
  const phone = $('#res-phone').value.trim();
  const postcode = $('#res-postcode').value.trim();
  const addr = $('#res-addr').value.trim();
  const addrDetail = $('#res-addr-detail').value.trim();
  const adults = parseInt($('#res-adults').value || '2', 10);
  const children = parseInt($('#res-children').value || '0', 10);
  const requests = $('#res-requests').value.trim();
  const termsChecked = $('#res-terms').checked;

  if (!datesVal || !checkIn || !checkOut) {
    alert('입실일과 퇴실일을 캘린더에서 선택해주세요.');
    return;
  }
  if (!name || !phone) {
    alert('예약자 성함과 연락처를 입력해주세요.');
    return;
  }
  if (!addr || !addrDetail) {
    alert('기본 주소 및 상세 주소를 모두 입력해주세요.');
    return;
  }
  if (!termsChecked) {
    alert('숙박시설 이용 약관에 동의하셔야 예약이 가능합니다.');
    return;
  }

  // Calculate with applied coupons (1 coupon per night)
  const checkedBoxes = Array.from($$('input[name="res-coupon-item"]:checked'));
  const appliedCoupons = checkedBoxes.map(cb => cb.value);
  const appliedCount = Math.min(appliedCoupons.length, nights);

  const origPrice = item.originalPrice || 200000;
  const couponPrice = item.price || 19000;
  const totalPrice = origPrice * nights;
  const discountAmount = appliedCount * (origPrice - couponPrice);
  const finalPayment = Math.max(0, totalPrice - discountAmount);

  const newResId = 'RES-' + Date.now().toString(36).toUpperCase();

  // Mark all applied coupons as USED in Storage
  if (appliedCoupons.length > 0) {
    const coupons = Storage.getCoupons();
    appliedCoupons.forEach(code => {
      const target = coupons.find(c => c.code === code);
      if (target) {
        target.status = 'USED';
        target.usedAt = new Date().toLocaleString('ko-KR');
        target.reservationId = newResId;
        target.hotelName = item.name;
        target.assignedUser = name;
        target.userPhone = phone;
      }
      if (Storage.useCouponOnConvex) {
        Storage.useCouponOnConvex(code, newResId);
      }
    });
    Storage.saveCoupons(coupons);
  }

  const newReservation = {
    id: newResId,
    hotelId: item.id,
    hotelName: item.name,
    hotelLocation: item.location,
    checkIn: checkIn,
    checkOut: checkOut,
    nights: nights,
    userName: name,
    phone: phone,
    postcode: postcode,
    address: addr,
    addressDetail: addrDetail,
    adults: adults,
    children: children,
    requests: requests,
    totalPrice: totalPrice,
    appliedCoupons: appliedCoupons,
    couponCode: appliedCoupons.join(', ') || null,
    discountAmount: discountAmount,
    finalPayment: finalPayment,
    status: '접수대기',
    createdAt: new Date().toLocaleString('ko-KR')
  };

  const reservations = Storage.getReservations();
  reservations.unshift(newReservation);
  Storage.saveReservations(reservations);
  if (Storage.syncReservationToConvex) {
    Storage.syncReservationToConvex(newReservation);
  }

  closeDialog();
  showToast(`[${item.name}] 예약 신청이 완료되었습니다!${appliedCount > 0 ? ` (숙박 쿠폰 ${appliedCount}장 무료 적용)` : ''}`);

  setTimeout(() => {
    openMemberDialog();
  }, 500);
};

// ==========================================
// EMAIL SIGNUP & LOGIN MODALS (이메일 회원가입, 주소 검색, 자동하이픈, 쿠폰연동)
// ==========================================
window.execSignupDaumPostcode = function() {
  new daum.Postcode({
    oncomplete: function(data) {
      const fullAddr = formatFullAddress(data);
      const postcodeEl = $('#signup-postcode');
      const addrEl = $('#signup-addr');
      const detailEl = $('#signup-addr-detail');
      if (postcodeEl) postcodeEl.value = data.zonecode;
      if (addrEl) addrEl.value = fullAddr;
      if (detailEl) detailEl.focus();
    }
  }).open();
};

window.openSignupDialog = function() {
  const html = `
    <span class="eyebrow blue">MEMBER JOIN</span>
    <h2>에이치디원 라운지 회원가입</h2>
    <p>간편 회원가입으로 프리미엄 숙박 및 레저 멤버십을 시작하세요.</p>

    <form onsubmit="handleSignupSubmit(event)" style="display:flex;flex-direction:column;gap:13px;margin-top:16px;">
      
      <div class="form-group">
        <label for="signup-email">이메일 계정 (아이디) <span class="required">*</span></label>
        <input type="email" id="signup-email" placeholder="example@email.com" required>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="signup-pw">비밀번호 <span class="required">*</span></label>
          <input type="password" id="signup-pw" placeholder="4자 이상 입력" minlength="4" required>
        </div>
        <div class="form-group">
          <label for="signup-pw-confirm">비밀번호 확인 <span class="required">*</span></label>
          <input type="password" id="signup-pw-confirm" placeholder="비밀번호 재입력" minlength="4" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="signup-name">성명 <span class="required">*</span></label>
          <input type="text" id="signup-name" placeholder="홍길동" required>
        </div>
        <div class="form-group">
          <label for="signup-phone">연락처 (휴대폰) <span class="required">*</span></label>
          <input type="tel" id="signup-phone" inputmode="numeric" maxlength="13" 
            placeholder="010-0000-0000" oninput="this.value = autoHyphenPhone(this.value)" required>
        </div>
      </div>

      <!-- 주소 조회 기능 (Daum Postcode) -->
      <div class="form-group">
        <label>주소지 (안내문 발송 및 회원 확인용) <span class="required">*</span></label>
        <div class="addr-search-row">
          <input type="text" id="signup-postcode" placeholder="우편번호" readonly style="max-width:110px;">
          <input type="text" id="signup-addr" placeholder="기본 주소 (주소 검색 클릭)" readonly required>
          <button type="button" class="btn-addr" onclick="execSignupDaumPostcode()">주소 검색</button>
        </div>
        <input type="text" id="signup-addr-detail" placeholder="상세주소 (동·호수 등)를 입력하세요" style="margin-top:6px;" required>
      </div>

      <!-- 약관 동의 -->
      <div class="terms-box" style="margin-top:2px;">
        <label class="terms-check">
          <input type="checkbox" id="signup-terms" required>
          <span>이용약관 및 개인정보 수집·이용 동의 (필수)</span>
        </label>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-cancel" onclick="closeDialog()">취소</button>
        <button type="submit" class="btn-submit-reserve">회원가입 완료</button>
      </div>

      <div style="text-align:center;margin-top:10px;font-size:13px;color:#64748b;">
        이미 회원이신가요? 
        <a href="javascript:void(0);" onclick="openLoginDialog()" style="color:var(--blue);font-weight:700;text-decoration:underline;">로그인하기</a>
      </div>
    </form>
  `;

  openDialog(html);
};

window.handleSignupSubmit = function(e) {
  e.preventDefault();
  const email = $('#signup-email').value.trim().toLowerCase();
  const pw = $('#signup-pw').value;
  const pwConfirm = $('#signup-pw-confirm').value;
  const name = $('#signup-name').value.trim();
  const phone = $('#signup-phone').value.trim();
  const postcode = $('#signup-postcode').value.trim();
  const addr = $('#signup-addr').value.trim();
  const addrDetail = $('#signup-addr-detail').value.trim();

  if (pw !== pwConfirm) {
    alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
    return;
  }
  if (!addr || !addrDetail) {
    alert('주소 검색을 통해 기본 주소와 상세 주소를 모두 입력해주세요.');
    return;
  }

  // Check users storage
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem('hd_one_users_v3')) || [];
  } catch { users = []; }

  if (users.some(u => u.email === email)) {
    alert('이미 등록된 이메일 계정입니다. 다른 이메일을 사용하시거나 로그인해주세요.');
    return;
  }

  const newUser = {
    id: 'USR-' + Date.now().toString(36),
    email: email,
    password: pw,
    name: name,
    phone: phone,
    postcode: postcode,
    address: addr,
    addressDetail: addrDetail,
    branch: '본사',
    membershipGrade: '정회원',
    createdAt: new Date().toLocaleString('ko-KR')
  };

  users.push(newUser);
  localStorage.setItem('hd_one_users_v3', JSON.stringify(users));

  // Automatically log in
  Storage.setCurrentUser({
    isLoggedIn: true,
    email: newUser.email,
    name: newUser.name,
    phone: newUser.phone,
    postcode: newUser.postcode,
    address: newUser.address,
    addressDetail: newUser.addressDetail,
    branch: newUser.branch,
    membershipGrade: newUser.membershipGrade
  });

  closeDialog();
  updateMemberStripUI();
  updateUserHeaderUI();
  renderCatalog();
  showToast(`[${name}] 님, 회원가입이 완료되었습니다! 환영합니다.`);
};

window.openLoginDialog = function() {
  const html = `
    <span class="eyebrow blue">MEMBER LOGIN</span>
    <h2>에이치디원 라운지 로그인</h2>
    <p>가입하신 이메일과 비밀번호로 로그인해주세요.</p>

    <!-- 체험용 데모 계정 안내 및 원클릭 로그인 -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:12px 14px;border-radius:8px;margin-top:14px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
      <div style="font-size:12px;color:#475569;line-height:1.4;">
        <strong style="color:var(--navy);">💡 VIP 체험 계정</strong> (홍길동 회원님)<br>
        <span style="color:#64748b;font-size:11px;">vip@hdone.kr / 1234</span>
      </div>
      <button type="button" class="btn-addr" onclick="quickDemoLogin()" style="padding:6px 12px;font-size:11.5px;white-space:nowrap;font-weight:700;">원클릭 로그인</button>
    </div>

    <form onsubmit="handleLoginSubmit(event)" style="display:flex;flex-direction:column;gap:14px;margin-top:16px;">
      <div class="form-group">
        <label for="login-email">이메일 계정 <span class="required">*</span></label>
        <input type="email" id="login-email" placeholder="example@email.com" required>
      </div>

      <div class="form-group">
        <label for="login-pw">비밀번호 <span class="required">*</span></label>
        <input type="password" id="login-pw" placeholder="비밀번호 입력" required>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-cancel" onclick="closeDialog()">취소</button>
        <button type="submit" class="btn-submit-reserve">로그인</button>
      </div>

      <div style="text-align:center;margin-top:14px;font-size:13px;color:#64748b;">
        아직 회원이 아니신가요? 
        <a href="javascript:void(0);" onclick="openSignupDialog()" style="color:var(--blue);font-weight:700;text-decoration:underline;">간편 회원가입</a>
      </div>
    </form>
  `;

  openDialog(html);
};

window.quickDemoLogin = function() {
  $('#login-email').value = 'vip@hdone.kr';
  $('#login-pw').value = '1234';
  const fakeEvent = { preventDefault: () => {} };
  handleLoginSubmit(fakeEvent);
};

window.handleLoginSubmit = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const email = $('#login-email').value.trim().toLowerCase();
  const pw = $('#login-pw').value;

  let users = [];
  try {
    users = JSON.parse(localStorage.getItem('hd_one_users_v3')) || [];
  } catch { users = []; }

  // Default demo account
  if (email === 'vip@hdone.kr' && pw === '1234') {
    Storage.setCurrentUser({
      isLoggedIn: true,
      email: 'vip@hdone.kr',
      name: '홍길동',
      phone: '010-1234-5678',
      couponCode: 'HD1-ABCD-X1A1602',
      branch: '강남서초',
      membershipGrade: 'PREMIUM VIP'
    });
    closeDialog();
    updateMemberStripUI();
    updateUserHeaderUI();
    renderCatalog();
    showToast('홍길동 VIP 회원님으로 로그인되었습니다.');
    return;
  }

  const matched = users.find(u => u.email === email && u.password === pw);
  if (!matched) {
    alert('이메일 또는 비밀번호가 일치하지 않습니다.\n(데모 계정: vip@hdone.kr / 비밀번호: 1234)');
    return;
  }

  Storage.setCurrentUser({
    isLoggedIn: true,
    email: matched.email,
    name: matched.name,
    phone: matched.phone,
    postcode: matched.postcode,
    address: matched.address,
    addressDetail: matched.addressDetail,
    couponCode: matched.couponCode,
    branch: matched.branch,
    membershipGrade: matched.membershipGrade
  });

  closeDialog();
  updateMemberStripUI();
  updateUserHeaderUI();
  renderCatalog();
  showToast(`${matched.name} 회원님, 반갑습니다!`);
};

// ==========================================
// 1:1 상담신청 MODAL
// ==========================================
window.openInquiryDialog = function() {
  const user = Storage.getCurrentUser() || {};
  const html = `
    <span class="eyebrow blue">CONCIERGE DESK</span>
    <h2>1:1 맞춤 상담 신청</h2>
    <p>여행 전문가가 원하시는 일정과 숙박에 최적화된 맞춤 상담을 도와드립니다.</p>

    <form onsubmit="handleInquirySubmit(event)" style="display:flex;flex-direction:column;gap:14px;margin-top:20px;">
      <div class="form-group">
        <label for="inq-name">신청자 성함 <span class="required">*</span></label>
        <input type="text" id="inq-name" value="${user.name || ''}" placeholder="성함을 입력하세요" required>
      </div>

      <div class="form-group">
        <label for="inq-phone">연락처 <span class="required">*</span></label>
        <input type="tel" id="inq-phone" inputmode="numeric" maxlength="13" 
          value="${user.phone || ''}" placeholder="010-0000-0000" 
          oninput="this.value = autoHyphenPhone(this.value)" required>
      </div>

      <div class="form-group">
        <label for="inq-category">상담 분야 <span class="required">*</span></label>
        <select id="inq-category" required>
          <option value="숙박시설 예약 문의">숙박시설 예약 및 잔여 객실 확인</option>
          <option value="VIP 멤버십 및 쿠폰 문의">VIP 멤버십 및 쿠폰 발급 문의</option>
          <option value="단체/기업 워크샵 여행">단체 / 기업 워크샵 여행 문의</option>
          <option value="요트/레저 패키지">요트 / 레저 패키지 일정 상담</option>
          <option value="기타 일반 문의">기타 일반 문의</option>
        </select>
      </div>

      <div class="form-group">
        <label for="inq-time">희망 상담 시간대</label>
        <select id="inq-time">
          <option value="언제나 가능 (빠른 연락)">언제나 가능 (빠른 연락)</option>
          <option value="오전 (09:00 ~ 12:00)">오전 (09:00 ~ 12:00)</option>
          <option value="오후 (13:00 ~ 17:00)">오후 (13:00 ~ 17:00)</option>
          <option value="저녁 (17:00 ~ 19:00)">저녁 (17:00 ~ 19:00)</option>
        </select>
      </div>

      <div class="form-group">
        <label for="inq-content">상담 내용 <span class="required">*</span></label>
        <textarea id="inq-content" rows="3" placeholder="궁금하신 일정이나 요청사항을 자유롭게 기재해주세요." required></textarea>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-cancel" onclick="closeDialog()">취소</button>
        <button type="submit" class="btn-submit-reserve">상담 신청하기</button>
      </div>
    </form>
  `;

  openDialog(html);
};

window.handleInquirySubmit = function(e) {
  e.preventDefault();
  const name = $('#inq-name').value.trim();
  const phone = $('#inq-phone').value.trim();
  const category = $('#inq-category').value;
  const time = $('#inq-time').value;
  const content = $('#inq-content').value.trim();

  if (!name || !phone || !content) {
    alert('모든 필수 항목을 입력해주세요.');
    return;
  }

  const inquiries = Storage.getInquiries();
  inquiries.unshift({
    id: 'INQ-' + Date.now().toString(36).toUpperCase(),
    name: name,
    phone: phone,
    category: category,
    preferredTime: time,
    content: content,
    status: '상담대기',
    createdAt: new Date().toLocaleString('ko-KR'),
    memo: ''
  });
  Storage.saveInquiries(inquiries);
  if (Storage.syncInquiryToConvex) {
    Storage.syncInquiryToConvex({
      name,
      phone,
      title: `${category} 상담 신청 (${time})`,
      content
    });
  }

  closeDialog();
  showToast('상담 신청이 완료되었습니다. 담당자가 신속히 연락드리겠습니다.');
};

// ==========================================
// 쿠폰 등록 MODAL (보유 숙박 쿠폰 등록 - 예시 문구 제거 및 다중 쿠폰 지원)
// ==========================================
window.openCouponRegisterDialog = function() {
  const user = Storage.getCurrentUser() || {};
  const html = `
    <span class="eyebrow blue">VIP MEMBERSHIP</span>
    <h2>숙박 쿠폰 번호 등록</h2>
    <p>보유하신 숙박 쿠폰 번호를 등록하시면 숙박 시설 예약 시 1박 무료 혜택이 적용됩니다.</p>

    <form onsubmit="handleCouponRegister(event)" style="display:flex;flex-direction:column;gap:14px;margin-top:16px;">
      <div class="form-group">
        <label for="c-code">쿠폰 번호 <span class="required">*</span></label>
        <input type="text" id="c-code" placeholder="쿠폰 번호를 입력하세요" 
          value="" style="text-transform:uppercase;font-size:14px;letter-spacing:0.5px;" 
          oninput="this.value = autoHyphenCoupon(this.value)" maxlength="16" required>
      </div>

      <div class="form-group">
        <label for="c-name">등록자 성함 <span class="required">*</span></label>
        <input type="text" id="c-name" value="${user.name || ''}" placeholder="성함을 입력하세요" required>
      </div>

      <div class="form-group">
        <label for="c-phone">휴대폰 번호 <span class="required">*</span></label>
        <input type="tel" id="c-phone" inputmode="numeric" maxlength="13" 
          value="${user.phone || ''}" placeholder="010-0000-0000" 
          oninput="this.value = autoHyphenPhone(this.value)" required>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-cancel" onclick="closeDialog()">취소</button>
        <button type="submit" class="btn-submit-reserve">쿠폰 등록하기</button>
      </div>
    </form>
  `;

  openDialog(html);
};

window.handleCouponRegister = function(e) {
  e.preventDefault();
  const rawCode = $('#c-code').value.trim().toUpperCase();
  const name = $('#c-name').value.trim();
  const phone = $('#c-phone').value.trim();

  const num = COUPON_RULE.parseCode(rawCode);
  if (!num) {
    alert('올바른 쿠폰 번호 형식이 아닙니다.');
    return;
  }

  const clean = rawCode.replace(/[^A-Z0-9]/g, '');
  const coupons = Storage.getCoupons();
  let target = coupons.find(c => c.num === num || c.code === rawCode || c.code.replace(/[^A-Z0-9]/g, '') === clean);

  if (!target || target.status === 'NOT_ISSUED') {
    alert('유효하지 않거나 아직 발급되지 않은 쿠폰 번호입니다.\n발급처 담당자에게 확인해 주세요.');
    return;
  }

  if (target.status === 'USED') {
    alert('해당 쿠폰은 이미 숙박 예약에 사용 완료된 쿠폰 번호입니다.');
    return;
  }

  if (target.status === 'REGISTERED') {
    if (target.userPhone === phone || target.assignedUser === name) {
      alert('회원님께 이미 등록되어 있는 쿠폰 번호입니다.');
    } else {
      alert('이미 다른 회원에게 등록된 쿠폰 번호입니다.');
    }
    return;
  }

  // Register coupon to this user
  const user = Storage.getCurrentUser();
  target.status = 'REGISTERED';
  target.assignedUser = name;
  target.userPhone = phone;
  target.userEmail = user ? user.email : '';
  target.registeredAt = new Date().toLocaleString('ko-KR');
  Storage.saveCoupons(coupons);

  // Upgrade user session grade
  if (user && user.isLoggedIn) {
    user.membershipGrade = 'VIP 정회원';
    Storage.setCurrentUser(user);
    updateMemberStripUI();
  }

  closeDialog();
  showToast(`[${target.code}] 숙박 쿠폰이 등록되었습니다! (숙박 예약 시 1박 무료)`);

  // If user is logged in, reopen MY lounge after brief delay
  if (user && user.isLoggedIn) {
    setTimeout(() => {
      openMemberDialog();
      switchMyTab('tab-coupon');
    }, 450);
  }
};

// ==========================================
// 회원가입 안내 MODAL (미회원용 프라이빗 혜택 가이드)
// ==========================================
window.openSignupPromptDialog = function() {
  const html = `
    <div style="text-align:center;padding:12px 6px;">
      <div style="width:58px;height:58px;margin:0 auto 16px;background:rgba(197,160,89,0.12);border:1px solid rgba(197,160,89,0.3);border-radius:50%;display:grid;place-items:center;color:var(--gold);">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="4"></circle>
          <path d="M4 21v-2a8 8 0 0 1 16 0v2"></path>
        </svg>
      </div>

      <span class="eyebrow gold" style="display:inline-block;margin-bottom:6px;">MEMBERS ONLY</span>
      <h2 style="font-size:22px;margin:0 0 10px;color:var(--navy);font-weight:800;letter-spacing:-0.02em;">회원 전용 프라이빗 서비스 안내</h2>
      <p style="font-size:14px;color:var(--muted);line-height:1.6;margin:0 0 22px;">
        에이치디원 라운지는 정식 인증 회원만을 위한 프라이빗 멤버십 클럽입니다.<br>
        간편 회원가입 후 <strong>48개 특급 숙박 무료/우대 예약</strong> 및 <strong>VIP 쿠폰 혜택</strong>을 이용해 보세요.
      </p>

      <!-- 혜택 요약 카드 -->
      <div style="display:flex;flex-direction:column;gap:11px;text-align:left;background:#f8fafc;border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin-bottom:22px;">
        <div style="display:flex;gap:14px;align-items:flex-start;">
          <span style="font-size:20px;line-height:1.2;">🏨</span>
          <div>
            <strong style="font-size:13.5px;color:var(--navy);display:block;margin-bottom:2px;">전국 48선 엄선 명품 숙박 무료·우대 예약</strong>
            <span style="font-size:12px;color:#64748b;line-height:1.4;display:block;">인천, 강원, 부산, 제주 등 랜드마크 호텔 및 프라이빗 풀빌라 회원 우대</span>
          </div>
        </div>
        <div style="display:flex;gap:14px;align-items:flex-start;">
          <span style="font-size:20px;line-height:1.2;">🎟️</span>
          <div>
            <strong style="font-size:13.5px;color:var(--navy);display:block;margin-bottom:2px;">VIP 쿠폰 등록 및 실시간 혜택 확인</strong>
            <span style="font-size:12px;color:#64748b;line-height:1.4;display:block;">발급받으신 쿠폰 등록 즉시 VIP 승급 및 잔여 혜택 활성화</span>
          </div>
        </div>
        <div style="display:flex;gap:14px;align-items:flex-start;">
          <span style="font-size:20px;line-height:1.2;">🛎️</span>
          <div>
            <strong style="font-size:13.5px;color:var(--navy);display:block;margin-bottom:2px;">1:1 전담 컨시어지 맞춤 예약 케어</strong>
            <span style="font-size:12px;color:#64748b;line-height:1.4;display:block;">전문 매니저의 신속한 예약 확정 및 일정 맞춤 조율 지원</span>
          </div>
        </div>
      </div>

      <!-- 액션 버튼 -->
      <div style="display:flex;flex-direction:column;gap:9px;">
        <button class="dark-button" onclick="closeDialog();openSignupDialog();" style="width:100%;padding:14px;font-size:15px;font-weight:700;background:var(--navy);border-radius:10px;">
          간편 회원가입
        </button>
        <button class="white-button" onclick="closeDialog();openLoginDialog();" style="width:100%;padding:12px;font-size:14px;font-weight:600;color:var(--navy);border:1px solid var(--line);border-radius:10px;">
          이미 회원이신가요? 로그인하기
        </button>
        <button onclick="closeDialog()" style="background:none;border:none;color:#94a3b8;font-size:12px;margin-top:6px;cursor:pointer;">
          다음에 둘러보기
        </button>
      </div>
    </div>
  `;
  openDialog(html);
};

// ==========================================
// MY 라운지 MODAL (인증 회원 전용: 예약 내역, 상담 내역, 쿠폰 관리)
// ==========================================
window.openMemberDialog = function() {
  const user = Storage.getCurrentUser();
  if (!user || !user.isLoggedIn) {
    openSignupPromptDialog();
    return;
  }

  const allReservations = Storage.getReservations();
  const reservations = allReservations.filter(r => 
    (r.phone && r.phone === user.phone) || 
    (r.userName && r.userName === user.name) ||
    (user.couponCode && r.couponCode === user.couponCode)
  );

  const allInquiries = Storage.getInquiries();
  const inquiries = allInquiries.filter(q => 
    (q.phone && q.phone === user.phone) || 
    (q.name && q.name === user.name)
  );

  const myCoupons = getMyRegisteredCoupons(user);
  const availableCoupons = myCoupons.filter(c => c.status === 'REGISTERED');

  const html = `
    <div class="my-card-banner">
      <div class="my-card-top">
        <span class="eyebrow" style="color:#dce6f5;">HD ONE LOUNGE</span>
        <span class="my-card-grade">${availableCoupons.length > 0 ? 'VIP 정회원' : (user.membershipGrade || '정회원')}</span>
      </div>
      <div class="my-card-name">${user.name} 님</div>
      <div class="my-card-phone">${user.phone}</div>
      <div class="my-card-bottom">
        <span>보유 쿠폰: <strong>사용 가능 ${availableCoupons.length}장 (총 ${myCoupons.length}장)</strong></span>
        <span>회원 상태: <strong>${availableCoupons.length > 0 ? 'VIP 숙박 우대' : '정회원'}</strong></span>
      </div>
    </div>

    <!-- Sub Tabs -->
    <div class="sub-tabs" id="my-tabs">
      <button class="active" onclick="switchMyTab('tab-res', this)">숙박 예약 내역 (${reservations.length})</button>
      <button onclick="switchMyTab('tab-inq', this)">상담 신청 내역 (${inquiries.length})</button>
      <button onclick="switchMyTab('tab-coupon', this)">내 쿠폰 정보 (${availableCoupons.length}/${myCoupons.length})</button>
    </div>

    <!-- Tab 1: Reservations -->
    <div id="tab-res" class="my-tab-pane">
      ${reservations.length === 0 ? `
        <div class="empty" style="padding:30px;">
          접수된 숙박 예약 내역이 없습니다.
          <button onclick="closeDialog();selectCategory('hotel');">숙박시설 둘러보기</button>
        </div>
      ` : reservations.map(r => `
        <div class="history-card">
          <div class="history-top">
            <span class="history-title">${r.hotelName}</span>
            <span class="status-pill ${r.status === '확정완료' ? 'confirmed' : r.status === '취소' ? 'canceled' : 'wait'}">
              ${r.status}
            </span>
          </div>
          <div class="history-info">
            <div>📅 일정: <strong>${r.checkIn} ~ ${r.checkOut} (${r.nights}박)</strong></div>
            <div>👤 예약자: ${r.userName} (${r.phone}) · 인원: 성인 ${r.adults}명${r.children ? `, 아동 ${r.children}명` : ''}</div>
            <div>📍 배송/연락 주소: ${r.address} ${r.addressDetail || ''}</div>
            ${r.requests ? `<div>📝 요청사항: ${r.requests}</div>` : ''}
            <div>💳 결제금액: <strong>${r.finalPayment === 0 ? '0원 (쿠폰 전액 적용)' : Money(r.finalPayment) + '원'}</strong></div>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px;">접수일시: ${r.createdAt}</div>
          </div>
          ${r.status === '접수대기' ? `
            <div style="margin-top:10px;text-align:right;">
              <button onclick="cancelReservation('${r.id}')" style="font-size:12px;color:#ef4444;text-decoration:underline;">
                예약 신청 취소
              </button>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>

    <!-- Tab 2: Inquiries -->
    <div id="tab-inq" class="my-tab-pane" style="display:none;">
      ${inquiries.length === 0 ? `
        <div class="empty" style="padding:30px;">
          접수된 상담 신청 내역이 없습니다.
          <button onclick="openInquiryDialog()">1:1 상담 신청하기</button>
        </div>
      ` : inquiries.map(q => `
        <div class="history-card">
          <div class="history-top">
            <span class="history-title">${q.category}</span>
            <span class="status-pill ${q.status === '상담완료' ? 'confirmed' : 'wait'}">${q.status}</span>
          </div>
          <div class="history-info">
            <div>📞 연락처: ${q.phone} (희망시간: ${q.preferredTime || '무관'})</div>
            <div>💬 내용: ${q.content}</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px;">신청일시: ${q.createdAt}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Tab 3: Coupon Info -->
    <div id="tab-coupon" class="my-tab-pane" style="display:none;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <span style="font-size:12.5px;color:#64748b;">쿠폰 1장당 <strong>1박 무료 숙박</strong> 혜택</span>
        <button class="dark-button" style="padding:7px 14px;font-size:12px;" onclick="closeDialog();openCouponRegisterDialog();">+ 새 쿠폰 등록하기</button>
      </div>

      ${myCoupons.length === 0 ? `
        <div class="empty" style="padding:30px;">
          등록된 숙박 쿠폰이 없습니다.<br>
          <span style="font-size:12px;color:#94a3b8;margin-top:4px;display:block;">보유하신 쿠폰 번호를 등록하시면 1박 무료 숙박 혜택을 이용하실 수 있습니다.</span>
          <button onclick="closeDialog();openCouponRegisterDialog();">쿠폰 등록하기</button>
        </div>
      ` : myCoupons.map(c => `
        <div class="history-card" style="margin-bottom:10px;">
          <div class="history-top">
            <span class="history-title" style="font-family:inherit;font-size:14px;letter-spacing:0.5px;font-weight:700;">🎟️ ${c.code}</span>
            <span class="status-pill ${c.status === 'REGISTERED' ? 'confirmed' : 'canceled'}">
              ${c.status === 'REGISTERED' ? '1박 무료 이용가능' : '사용완료'}
            </span>
          </div>
          <div class="history-info" style="font-size:12.5px;">
            <div>🏢 발급 채널/지사: <strong>${c.branch || '지사'}</strong></div>
            ${c.status === 'USED' ? `
              <div>🗓️ 사용일시: ${c.usedAt || '-'} · 예약 번호: ${c.reservationId || '-'}</div>
              ${c.hotelName ? `<div>🏨 사용 숙소: <strong>${c.hotelName}</strong></div>` : ''}
            ` : `
              <div>🗓️ 등록일시: ${c.registeredAt || '-'} · 적용 혜택: 전국 48개 제휴 숙박 1박 무료</div>
            `}
          </div>
        </div>
      `).join('')}
    </div>

    <div style="display:flex;justify-content:center;margin-top:20px;padding-top:16px;border-top:1px solid var(--line);">
      <button class="btn-cancel" onclick="closeDialog()" style="min-width:140px;padding:9px 24px;">닫기</button>
    </div>
  `;

  openDialog(html);
};

window.switchMyTab = function(tabId, btn) {
  $$('.my-tab-pane').forEach(p => p.style.display = 'none');
  const target = $(`#${tabId}`);
  if (target) target.style.display = 'block';

  $$('#my-tabs button').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
};

window.cancelReservation = function(id) {
  if (!confirm('정말 해당 예약을 취소하시겠습니까?')) return;
  const list = Storage.getReservations();
  const target = list.find(r => r.id === id);
  if (target) {
    target.status = '취소';
    Storage.saveReservations(list);
    showToast('예약이 취소되었습니다.');
    openMemberDialog();
  }
};

// ==========================================
// 멤버십 안내 MODAL (와이드 & 이미지 풍성한 럭셔리 쇼케이스)
// ==========================================
window.openBenefitsDialog = function() {
  const html = `
    <!-- Top Hero Visual Banner -->
    <div class="benefits-modal-hero">
      <img src="assets/resort.jpg" alt="에이치디원 라운지 리조트 전경" class="hero-bg">
      <div class="hero-overlay"></div>
      <div class="hero-text">
        <span class="benefits-sec-badge">PRIVATE MEMBERSHIP CLUB</span>
        <h2>일상 너머의 쉼, 에이치디원 라운지 멤버십</h2>
        <p>엄선된 48개 명품 숙박시설 무료/우대 이용권부터 프라이빗 레저, VIP 전용 컨시어지까지 — 오직 회원만을 위해 준비된 특별한 여정을 만나보세요.</p>
      </div>
    </div>

    <!-- Modal Interior Body -->
    <div class="benefits-modal-body">
      
      <!-- Section 1: 48개 명품 숙박 큐레이션 -->
      <div class="benefits-section">
        <span class="benefits-sec-badge">01 · CURATED STAYS</span>
        <h3 class="benefits-sec-title">전국 48개 엄선 명품 숙박 & 리조트</h3>
        <p class="benefits-sec-desc">젠트리파이 제휴를 비롯하여 전국 각지의 랜드마크 호텔과 최고급 독채 풀빌라를 회원 특별 우대가로 제공합니다.</p>

        <div class="benefits-cards-grid3">
          <!-- Card 1 -->
          <div class="benefit-visual-card">
            <div class="benefit-card-img-wrap">
              <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=700&q=80" alt="특급 호텔 & 오션 리조트">
              <span class="benefit-card-tag">HOTEL & RESORT</span>
            </div>
            <div class="benefit-card-info">
              <h4>특급 호텔 & 오션 리조트</h4>
              <p>인천 송도 셀럽스테이, 부산 해운대, 여수, 강릉 등 환상적인 파노라마 전망을 선사하는 랜드마크 호텔 컬렉션</p>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="benefit-visual-card">
            <div class="benefit-card-img-wrap">
              <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=700&q=80" alt="프라이빗 독채 풀빌라">
              <span class="benefit-card-tag">PRIVATE VILLA</span>
            </div>
            <div class="benefit-card-info">
              <h4>프라이빗 독채 풀빌라 & 감성 펜션</h4>
              <p>타인의 시선에서 완전히 자유로운 독채 구조, 사계절 프라이빗 온수풀과 바비큐 공간을 갖춘 하이엔드 스테이</p>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="benefit-visual-card">
            <div class="benefit-card-img-wrap">
              <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=700&q=80" alt="마운틴 & 웰니스 리조트">
              <span class="benefit-card-tag">HEALING & NATURE</span>
            </div>
            <div class="benefit-card-info">
              <h4>마운틴 & 네이처 힐링 리조트</h4>
              <p>울창한 숲과 맑은 공기 속에서 온전한 재충전을 선물하는 웰니스 리조트 및 프리미엄 글램핑 시설 제휴</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: 프라이빗 레저 & 웰니스 클럽 -->
      <div class="benefits-section">
        <span class="benefits-sec-badge">02 · BEYOND THE STAY</span>
        <h3 class="benefits-sec-title">프라이빗 레저 & 웰니스 라이프스타일</h3>
        <p class="benefits-sec-desc">숙박을 넘어 특별한 기억을 선사하는 해양 레저, 럭셔리 요트 차터링, 웰니스 스파 혜택이 이어집니다.</p>

        <div class="benefits-cards-grid2">
          <!-- Card 1 -->
          <div class="benefit-visual-card">
            <div class="benefit-card-img-wrap" style="height:190px;">
              <img src="assets/yacht.jpg" alt="프라이빗 요트 세일링">
              <span class="benefit-card-tag">YACHT & SAILING</span>
            </div>
            <div class="benefit-card-info">
              <h4>프라이빗 요트 투어 & 선셋 세일링</h4>
              <p>부산 수영만 요트경기장, 통영, 거제 등 에메랄드빛 바다 위에서 즐기는 회원 전용 단독 요트 대여 및 선셋 투어 특별 우대 지원</p>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="benefit-visual-card">
            <div class="benefit-card-img-wrap" style="height:190px;">
              <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=80" alt="오션 스파 & 웰니스 테라피">
              <span class="benefit-card-tag">SPA & WELLNESS</span>
            </div>
            <div class="benefit-card-info">
              <h4>오션 스파 & 프리미엄 테마 티켓</h4>
              <p>지친 일상에 활력을 불어넣는 최고급 온천 스파, 사계절 워터파크, 전국 주요 명소 테마 티켓 및 액티비티 회원 할인권 제공</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: VIP 쿠폰 및 멤버십 인증 관리 체계 -->
      <div class="benefits-section">
        <span class="benefits-sec-badge">03 · VIP MEMBERSHIP SYSTEM</span>
        <h3 class="benefits-sec-title">체계적인 VIP 쿠폰 및 회원 혜택 관리</h3>
        <p class="benefits-sec-desc">공식 발급된 전용 쿠폰 등록을 통해 안전하고 투명하게 혜택을 이용하실 수 있습니다.</p>

        <div class="benefit-coupon-box">
          <div class="benefit-coupon-content">
            <div>
              <span class="coupon-rule-tag">HD1-ABCD-X1A0002 ~ HD1-ABCD-X1A5000</span>
              <h4 style="font-size:18px;margin:4px 0 8px;font-weight:800;letter-spacing:-0.02em;">지사별 정식 배정 VIP 쿠폰 연동</h4>
              <p style="font-size:13.5px;color:#e2e8f0;line-height:1.6;margin:0;">
                강남서초 지사(1602~2101 대역) 등 각 거점 채널을 통해 발급된 쿠폰을 등록하시면<br>
                추가 비용 부담 없이 <strong>전국 48개 명품 숙박 무료 예약</strong> 및 우대 혜택이 즉시 개시됩니다.
              </p>
              <ul class="benefit-coupon-list">
                <li>미발급 / 발급 / 회원등록 / 사용완료 4단계 라이프사이클 실시간 관리</li>
                <li>쿠폰 번호 1회 등록으로 MY 라운지에서 예약/상담 통합 확인</li>
                <li>연락처 및 성명 기반 1:1 안전 매핑으로 도용 방지</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 4: 1:1 전담 컨시어지 케어 -->
      <div class="benefits-section">
        <span class="benefits-sec-badge">04 · CONCIERGE CARE</span>
        <h3 class="benefits-sec-title">1:1 전담 컨시어지 맞춤 예약 서비스</h3>
        <p class="benefits-sec-desc">복잡한 절차 없이, 원하는 일정과 숙소만 선택하시면 전담 컨시어지가 즉시 확정을 지원합니다.</p>

        <div class="benefit-steps-grid">
          <div class="benefit-step-box">
            <div class="benefit-step-num">1</div>
            <h5>회원가입 & 로그인</h5>
            <p>간편 회원가입으로 라운지 멤버십 계정 생성</p>
          </div>
          <div class="benefit-step-box">
            <div class="benefit-step-num">2</div>
            <h5>VIP 쿠폰 등록</h5>
            <p>수령하신 쿠폰 번호 등록 후 즉시 VIP 우대 활성화</p>
          </div>
          <div class="benefit-step-box">
            <div class="benefit-step-num">3</div>
            <h5>숙박 & 레저 신청</h5>
            <p>캘린더로 일정 및 인원 선택 후 클릭 한 번으로 접수</p>
          </div>
          <div class="benefit-step-box">
            <div class="benefit-step-num">4</div>
            <h5>컨시어지 신속 확정</h5>
            <p>전담 매니저가 객실 확보 후 문자 안내 및 예약 확정</p>
          </div>
        </div>
      </div>

      <!-- Bottom CTA Banner -->
      <div class="benefit-modal-cta-wrap">
        <div>
          <b>지금 에이치디원 라운지의 회원이 되어보세요.</b>
          <span>가입 즉시 48개 명품 숙박시설과 프라이빗 레저 혜택이 시작됩니다.</span>
        </div>
        <div class="benefit-modal-cta-btns">
          <button class="primary-btn" onclick="closeDialog();openSignupDialog();" style="padding:10px 18px;font-size:13.5px;">
            간편 회원가입
          </button>
          <button class="header-btn" onclick="closeDialog();openCouponRegisterDialog();" style="padding:10px 16px;font-size:13.5px;">
            쿠폰 등록하기
          </button>
        </div>
      </div>

      <div style="text-align:center;margin-top:24px;">
        <button class="btn-cancel" onclick="closeDialog()" style="min-width:120px;padding:9px 24px;">닫기</button>
      </div>
    </div>
  `;

  openDialog(html, { wide: true });
};

// Category / Guide / FAQ Views
const Views = {
  menu: () => `
    <span class="eyebrow blue">EXPLORE THE LOUNGE</span>
    <h2>어떤 쉼을 찾고 계신가요?</h2>
    <div class="menu-list">
      <button data-cat="hotel">호텔·리조트<small>전국 48선 엄선 숙박</small></button>
      <button data-cat="villa">펜션·풀빌라<small>우리만의 프라이빗 스테이</small></button>
      <button data-cat="leisure">레저·티켓<small>요트 · 테마파크 · 웰니스</small></button>
      <button data-cat="travel">국내·해외여행<small>여행 패키지 · 테마 여행</small></button>
      <button data-action="inquiry">1:1 상담신청<small>전담 컨시어지 맞춤 예약</small></button>
      <button data-action="benefits">멤버십 혜택<small>회원 전용 우대 혜택 안내</small></button>
      <a href="https://hdone.net/" target="_blank" rel="noopener noreferrer" class="menu-external-link" style="display:flex;flex-direction:column;align-items:flex-start;padding:12px 14px;border:1px solid var(--line);border-radius:8px;text-align:left;font-weight:700;font-size:14px;color:var(--navy);text-decoration:none;background:#ffffff;margin-top:2px;">
        <span style="display:flex;align-items:center;gap:6px;color:var(--blue);">
          에이치디원 멤버십
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </span>
        <small style="font-size:12px;font-weight:400;color:var(--muted);margin-top:4px;">HDONE 공식 라이프 케어 멤버십 사이트 바로가기</small>
      </a>
    </div>
  `,
  faq: () => `
    <span class="eyebrow blue">HELP DESK</span>
    <h2>자주 묻는 질문</h2>
    <details open>
      <summary>쿠폰 번호는 어떻게 받나요?</summary>
      <p>에이치디원 라운지 제휴 지사(예: 강남서초 등)를 통해 정식 발급된 쿠폰 번호(HD1-ABCD-X1A0002~5000)를 수령하신 회원에 한해 이용 가능합니다.</p>
    </details>
    <details open>
      <summary>예약 신청 후 확정까지 얼마나 걸리나요?</summary>
      <p>예약 접수 후 전담 매니저가 숙박시설 잔여 객실 확인 후 통상 2~3시간 이내에 확정 문자를 안내해 드립니다.</p>
    </details>
    <details>
      <summary>주소 입력은 왜 필요한가요?</summary>
      <p>정식 회원 확인 및 지류 바우처/웰컴 기프트 배송 대상 여부 조회를 위해 주소 검색을 진행합니다.</p>
    </details>
  `
};

// Global Event Listeners
document.addEventListener('click', e => {
  const b = e.target.closest('button, [data-cat], [data-action]');
  if (!b) return;

  if (b.dataset.cat) {
    closeDialog();
    selectCategory(b.dataset.cat);
  } else if (b.dataset.region) {
    selectRegion(b.dataset.region);
  } else if (b.dataset.action) {
    const a = b.dataset.action;
    if (a === 'saved') {
      closeDialog();
      State.savedOnly = !State.savedOnly;
      renderCatalog();
    } else if (a === 'home') {
      closeDialog();
      selectCategory('all');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (a === 'collection' || a === 'reset') {
      selectCategory('all');
    } else if (a === 'inquiry') {
      closeDialog();
      openInquiryDialog();
    } else if (a === 'coupon-reg') {
      closeDialog();
      openCouponRegisterDialog();
    } else if (a === 'member') {
      closeDialog();
      openMemberDialog();
    } else if (a === 'benefits') {
      closeDialog();
      openBenefitsDialog();
    } else if (Views[a]) {
      openDialog(Views[a]());
    }
  }
});

// App Initialization
function initApp() {
  updateUserHeaderUI();
  updateMemberStripUI();
  renderCatalog();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Convex 클라우드 데이터 동기화 완료 시 카탈로그 재렌더링
window.addEventListener('convex-synced', () => {
  renderCatalog();
  console.log('🔄 [App] 클라우드 DB 동기화 반영 완료');
});
