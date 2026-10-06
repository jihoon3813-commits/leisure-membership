/**
 * HD ONE LOUNGE - Integrated Admin Management Engine
 */

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// Admin State
const AdminState = {
  currentTab: 'hotels',
  couponPage: 1,
  couponPageSize: 50,
  uploadedImages: []
};

const Money = n => (Number(n) || 0).toLocaleString('ko-KR');

window.formatInputWithCommas = function(val) {
  if (val === null || val === undefined || val === '') return '';
  const num = String(val).replace(/[^0-9]/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('ko-KR');
};

window.parseNumberFromCommas = function(val) {
  if (!val) return 0;
  return parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0;
};

function showAdminToast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.adminToastTimer);
  window.adminToastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// Dialog Controller
function openAdminDialog(html) {
  const d = $('#admin-dialog');
  const c = $('#admin-dialog-content');
  c.innerHTML = html;
  d.showModal();
}

function closeAdminDialog() {
  const d = $('#admin-dialog');
  if (d && d.open) d.close();
  AdminState.uploadedImages = [];
}

// Tab Switching
function initTabs() {
  $$('#admin-nav .admin-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tab) {
  AdminState.currentTab = tab;
  $$('#admin-nav .admin-nav-item').forEach(i => i.classList.toggle('active', i.dataset.tab === tab));
  $$('.tab-pane').forEach(p => p.style.display = 'none');

  const titles = {
    hotels: { title: '숙박시설 통합 관리', sub: '전국 48개 숙박시설 일괄 요금 설정, 메인 노출 관리 및 신규 등록' },
    coupons: { title: '쿠폰 대역·발급 관리', sub: 'HD1-ABCD-X1A0002~5000 쿠폰 발급처 지정, 사용 현황 실시간 조회' },
    reservations: { title: '숙박 예약 신청 관리', sub: '고객 예약 신청건 확인, 주소/요청사항 조회 및 예약 확정 처리' },
    inquiries: { title: '1:1 맞춤 상담 내역', sub: '고객 맞춤 일정/여행 상담 문의 확인 및 상태 관리' },
    'other-products': { title: '기타 카테고리 상품 관리', sub: '펜션·풀빌라, 레저·티켓, 여행 상품 직접 등록 및 관리' }
  };

  $('#tab-title').textContent = titles[tab]?.title || '관리자';
  $('#tab-subtitle').textContent = titles[tab]?.sub || '';

  const headerActions = $('#tab-header-actions');
  if (tab === 'hotels') {
    headerActions.innerHTML = `<button class="btn-admin-primary" onclick="openAddHotelModal()">+ 신규 숙박시설 등록</button>`;
  } else if (tab === 'coupons') {
    headerActions.innerHTML = `<button class="btn-admin-primary" onclick="$('#alloc-start').focus()">+ 쿠폰 대역 발급</button>`;
  } else if (tab === 'other-products') {
    headerActions.innerHTML = `<button class="btn-admin-primary" onclick="openAddOtherModal()">+ 기타 상품 등록</button>`;
  } else {
    headerActions.innerHTML = '';
  }

  const targetPane = $(`#pane-${tab}`);
  if (targetPane) targetPane.style.display = 'block';

  refreshCurrentTab();
  updateStats();
}

function refreshCurrentTab() {
  if (AdminState.currentTab === 'hotels') renderHotelsTable();
  if (AdminState.currentTab === 'coupons') renderCouponsTable();
  if (AdminState.currentTab === 'reservations') renderReservationsTable();
  if (AdminState.currentTab === 'inquiries') renderInquiriesTable();
  if (AdminState.currentTab === 'other-products') renderOtherProductsTable();
}

// Update Overview Stats
function updateStats() {
  const hotels = Storage.getHotels();
  const coupons = Storage.getCoupons();
  const reservations = Storage.getReservations();
  const inquiries = Storage.getInquiries();
  const others = Storage.getOtherProducts();

  const mainCount = hotels.filter(h => h.isMain).length;
  const notIssuedCoupons = coupons.filter(c => c.status === 'NOT_ISSUED').length;
  const issuedCoupons = coupons.filter(c => c.status === 'ISSUED').length;
  const regCoupons = coupons.filter(c => c.status === 'REGISTERED').length;
  const usedCoupons = coupons.filter(c => c.status === 'USED').length;

  const pendingRes = reservations.filter(r => r.status === '접수대기').length;
  const pendingInq = inquiries.filter(q => q.status === '상담대기').length;

  $('#stat-hotels').textContent = hotels.length;
  $('#stat-hotels-main').textContent = mainCount;

  $('#stat-coupons').textContent = Money(coupons.length);
  const elNotIssued = $('#stat-coupons-not-issued');
  const elIssued = $('#stat-coupons-issued');
  const elReg = $('#stat-coupons-reg');
  const elUsed = $('#stat-coupons-used');
  if (elNotIssued) elNotIssued.textContent = Money(notIssuedCoupons);
  if (elIssued) elIssued.textContent = Money(issuedCoupons);
  if (elReg) elReg.textContent = Money(regCoupons);
  if (elUsed) elUsed.textContent = Money(usedCoupons);

  $('#stat-reservations').textContent = reservations.length;
  $('#stat-res-pending').textContent = pendingRes;
  $('#stat-inquiries').textContent = inquiries.length;
  $('#stat-inq-pending').textContent = pendingInq;

  $('#badge-hotel-count').textContent = hotels.length;
  $('#badge-coupon-count').textContent = Money(coupons.length);
  $('#badge-res-count').textContent = reservations.length;
  $('#badge-inq-count').textContent = inquiries.length;
  $('#badge-other-count').textContent = others.length;
}

// ========================================================
// TAB 1: 숙박시설 관리 (일괄 금액 설정, 개별 수정, 메인노출 토글, 신규등록)
// ========================================================

// Apply Batch Price Adjustment (정가 및 쿠폰가 일괄 변경)
window.applyBatchPrice = function() {
  const region = $('#batch-region').value;
  const originalPrice = parseNumberFromCommas($('#batch-original-price')?.value) || 200000;
  const couponPrice = parseNumberFromCommas($('#batch-coupon-price')?.value) || 19000;

  if (originalPrice <= 0 || couponPrice <= 0) {
    alert('유효한 정가와 쿠폰가(원)를 입력해주세요.');
    return;
  }

  const hotels = Storage.getHotels();
  let updatedCount = 0;

  hotels.forEach(h => {
    if (region === 'all' || h.region === region) {
      h.originalPrice = originalPrice;
      h.price = couponPrice;
      h.discount = Math.round((1 - couponPrice / originalPrice) * 100);
      updatedCount++;
    }
  });

  Storage.saveHotels(hotels);
  renderHotelsTable();
  updateStats();
  showAdminToast(`${region === 'all' ? '전체' : region} 지역 ${updatedCount}개 숙박시설: 정가 ${Money(originalPrice)}원 / 쿠폰가 ${Money(couponPrice)}원으로 일괄 변경되었습니다!`);
};

// Render Hotels Table
function renderHotelsTable() {
  const hotels = Storage.getHotels();
  const search = ($('#hotel-search')?.value || '').trim().toLowerCase();
  const regionFilter = $('#hotel-region-filter')?.value || 'all';
  const mainFilter = $('#hotel-main-filter')?.value || 'all';

  let list = hotels.filter(h => {
    if (search && !h.name.toLowerCase().includes(search) && !h.location.toLowerCase().includes(search)) return false;
    if (regionFilter !== 'all' && h.region !== regionFilter) return false;
    if (mainFilter === 'main' && !h.isMain) return false;
    if (mainFilter === 'not_main' && h.isMain) return false;
    return true;
  });

  const tbody = $('#hotels-tbody');
  const countEl = $('#hotel-table-count');
  if (countEl) countEl.textContent = list.length;
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:#94a3b8;">조건에 맞는 숙박시설이 없습니다.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((h, idx) => {
    const thumb = (h.images && h.images[0]) || 'assets/resort.jpg';
    const imgCount = (h.images && h.images.length) || 1;

    return `
      <tr>
        <td style="color:#94a3b8;font-weight:600;">${idx + 1}</td>
        <td>
          <div style="position:relative;display:inline-block;">
            <img src="${thumb}" class="tbl-thumb" alt="${h.name}">
            <span style="position:absolute;bottom:2px;right:10px;background:#000a;color:#fff;font-size:9px;padding:1px 4px;border-radius:3px;">
              ${imgCount}장
            </span>
          </div>
        </td>
        <td>
          <div style="font-weight:700;color:#0f172a;margin-bottom:3px;">${h.name}</div>
          <small style="color:#64748b;">${h.desc || ''}</small>
        </td>
        <td>
          <span class="status-badge" style="background:#f1f5f9;color:#334155;margin-right:4px;">${h.region}</span>
          <span style="font-size:12px;color:#64748b;">${h.location}</span>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:4px;justify-content:flex-end;">
            <input type="text" inputmode="numeric" value="${Money(h.originalPrice || 200000)}" style="width:90px;padding:4px 6px;border:1px solid #cbd5e1;border-radius:4px;font-weight:700;text-align:right;color:#475569;"
              oninput="this.value = formatInputWithCommas(this.value)"
              onchange="updateHotelOriginalPriceInline('${h.id}', this.value)">
            <span style="font-size:11px;color:#64748b;">원</span>
          </div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:4px;justify-content:flex-end;">
            <input type="text" inputmode="numeric" value="${Money(h.price || 19000)}" style="width:90px;padding:4px 6px;border:1px solid #93c5fd;border-radius:4px;font-weight:700;text-align:right;color:#1d4ed8;background:#eff6ff;"
              oninput="this.value = formatInputWithCommas(this.value)"
              onchange="updateHotelCouponPriceInline('${h.id}', this.value)">
            <span style="font-size:11px;color:#64748b;">원</span>
          </div>
        </td>
        <td style="text-align:center;">
          <label class="switch">
            <input type="checkbox" ${h.isMain ? 'checked' : ''} onchange="toggleHotelMain('${h.id}', this.checked)">
            <span class="slider"></span>
          </label>
        </td>
        <td style="text-align:center;">
          <div style="display:flex;gap:4px;justify-content:center;">
            <button class="btn-tbl-sm" onclick="openEditHotelModal('${h.id}')">수정</button>
            <button class="btn-tbl-sm btn-tbl-danger" onclick="deleteHotel('${h.id}')">삭제</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Inline original price update
window.updateHotelOriginalPriceInline = function(id, val) {
  const origPrice = parseNumberFromCommas(val);
  if (!origPrice || origPrice <= 0) return;
  const list = Storage.getHotels();
  const item = list.find(h => h.id === id);
  if (item) {
    item.originalPrice = origPrice;
    item.discount = Math.round((1 - (item.price || 19000) / origPrice) * 100);
    Storage.saveHotels(list);
    showAdminToast(`[${item.name}] 정가가 ${Money(origPrice)}원으로 수정되었습니다.`);
  }
};

// Inline coupon price update
window.updateHotelCouponPriceInline = function(id, val) {
  const couponPrice = parseNumberFromCommas(val);
  if (!couponPrice || couponPrice <= 0) return;
  const list = Storage.getHotels();
  const item = list.find(h => h.id === id);
  if (item) {
    item.price = couponPrice;
    item.discount = Math.round((1 - couponPrice / (item.originalPrice || 200000)) * 100);
    Storage.saveHotels(list);
    showAdminToast(`[${item.name}] 쿠폰가가 ${Money(couponPrice)}원으로 수정되었습니다.`);
  }
};

window.updateHotelPriceInline = function(id, val) {
  updateHotelCouponPriceInline(id, val);
};

// Toggle Main Exposure
window.toggleHotelMain = function(id, isChecked) {
  const list = Storage.getHotels();
  const item = list.find(h => h.id === id);
  if (item) {
    item.isMain = isChecked;
    Storage.saveHotels(list);
    updateStats();
    showAdminToast(`[${item.name}] 메인 노출: ${isChecked ? 'ON' : 'OFF'}`);
  }
};

// Delete Hotel
window.deleteHotel = function(id) {
  if (!confirm('정말 이 숙박시설을 삭제하시겠습니까?')) return;
  let list = Storage.getHotels();
  list = list.filter(h => h.id !== id);
  Storage.saveHotels(list);
  renderHotelsTable();
  updateStats();
  showAdminToast('숙박시설이 삭제되었습니다.');
};

// Open Add/Edit Hotel Modal
window.openAddHotelModal = function() {
  openHotelFormModal(null);
};

window.openEditHotelModal = function(id) {
  const item = Storage.getHotels().find(h => h.id === id);
  if (item) openHotelFormModal(item);
};

function openHotelFormModal(item) {
  const isEdit = !!item;
  AdminState.uploadedImages = item ? [...(item.images || [])] : [];

  const html = `
    <span class="eyebrow blue">${isEdit ? '숙박시설 수정' : '신규 숙박시설 직접 등록'}</span>
    <h2>${isEdit ? item.name : '새로운 프리미엄 숙박시설 등록'}</h2>
    <p>숙박시설 명칭, 위치, 요금 및 썸네일 이미지(최대 3장)를 등록합니다.</p>

    <form onsubmit="handleSaveHotel(event, '${item ? item.id : ''}')" style="display:flex;flex-direction:column;gap:14px;margin-top:16px;">
      
      <div class="form-grid-2">
        <div class="form-group">
          <label>숙박시설명 <span class="required">*</span></label>
          <input type="text" id="h-name" value="${item ? item.name : ''}" placeholder="[강원/강릉] 세인트존스호텔" required>
        </div>
        <div class="form-group">
          <label>지역 선택 <span class="required">*</span></label>
          <select id="h-region" required>
            <option value="인천" ${item?.region === '인천' ? 'selected' : ''}>인천</option>
            <option value="강원" ${item?.region === '강원' ? 'selected' : ''}>강원</option>
            <option value="부산" ${item?.region === '부산' ? 'selected' : ''}>부산</option>
            <option value="서울·경기" ${item?.region === '서울·경기' ? 'selected' : ''}>서울·경기</option>
            <option value="제주" ${item?.region === '제주' ? 'selected' : ''}>제주</option>
            <option value="경상" ${item?.region === '경상' ? 'selected' : ''}>경상</option>
            <option value="기타" ${item?.region === '기타' ? 'selected' : ''}>기타 지역</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>상세 위치 주소 <span class="required">*</span></label>
        <input type="text" id="h-loc" value="${item ? item.location : ''}" placeholder="강원도 강릉시 창해로 307" required>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>정상 판매가 (원) <span class="required">*</span></label>
          <input type="text" inputmode="numeric" id="h-orig-price" value="${Money(item ? (item.originalPrice || 200000) : 200000)}" oninput="this.value = formatInputWithCommas(this.value)" required>
        </div>
        <div class="form-group">
          <label>쿠폰 이용가 (원) <span class="required">*</span></label>
          <input type="text" inputmode="numeric" id="h-price" value="${Money(item ? (item.price || 19000) : 19000)}" oninput="this.value = formatInputWithCommas(this.value)" required>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>대표 태그 (뱃지)</label>
          <input type="text" id="h-tag" value="${item ? item.tag : 'LOUNGE PICK'}" placeholder="LOUNGE PICK / OCEAN VIEW">
        </div>
        <div class="form-group">
          <label>메인 화면 노출 여부</label>
          <select id="h-ismain">
            <option value="true" ${item?.isMain ? 'selected' : ''}>메인에 노출함 (ON)</option>
            <option value="false" ${!item?.isMain ? 'selected' : ''}>메인에 노출 안 함 (OFF)</option>
          </select>
        </div>
      </div>

      <!-- 썸네일 등록 (파일 업로드 & URL 입력 모두 지원) -->
      <div class="form-group">
        <label>
          <span>썸네일 이미지 (좌우 슬라이드용 총 3장 등록 가능)</span>
          <span class="required">*</span>
        </label>
        
        <div style="background:#f8fafc;padding:12px;border:1px dashed #cbd5e1;border-radius:8px;">
          <!-- 1. 파일 업로드 -->
          <div style="margin-bottom:10px;">
            <span style="font-size:12px;font-weight:700;color:#475569;">📁 내 컴퓨터에서 이미지 파일 선택 (복수 가능):</span>
            <input type="file" id="h-file-input" accept="image/*" multiple onchange="handleFileUpload(event)" style="margin-top:6px;font-size:12px;">
          </div>
          
          <!-- 2. 이미지 URL 직접 추가 -->
          <div style="display:flex;gap:6px;">
            <input type="url" id="h-url-input" placeholder="또는 웹 이미지 URL 직접 입력 (https://...)" style="flex:1;font-size:12px;">
            <button type="button" class="btn-tbl-sm" onclick="addImageUrl()">URL 추가</button>
          </div>

          <!-- 미리보기 그룹 -->
          <div id="h-preview-group" class="image-preview-group">
            <!-- Dynamically populated previews -->
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>소개 및 설명</label>
        <textarea id="h-desc" rows="2" placeholder="숙박시설의 특별한 매력과 분위기를 설명해주세요.">${item ? item.desc : ''}</textarea>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-cancel" onclick="closeAdminDialog()">취소</button>
        <button type="submit" class="btn-submit-reserve">${isEdit ? '수정 완료' : '등록하기'}</button>
      </div>
    </form>
  `;

  openAdminDialog(html);
  renderImagePreviews();
}

// Handle File Upload to Base64
window.handleFileUpload = function(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  Array.from(files).forEach(file => {
    if (AdminState.uploadedImages.length >= 3) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      if (AdminState.uploadedImages.length < 3) {
        AdminState.uploadedImages.push(evt.target.result);
        renderImagePreviews();
      }
    };
    reader.readAsDataURL(file);
  });
};

window.addImageUrl = function() {
  const input = $('#h-url-input');
  if (!input) return;
  const url = input.value.trim();
  if (!url) return;
  if (AdminState.uploadedImages.length >= 3) {
    alert('이미지는 최대 3장까지 등록 가능합니다.');
    return;
  }
  AdminState.uploadedImages.push(url);
  input.value = '';
  renderImagePreviews();
};

window.removeImage = function(idx) {
  AdminState.uploadedImages.splice(idx, 1);
  renderImagePreviews();
};

function renderImagePreviews() {
  const container = $('#h-preview-group');
  if (!container) return;

  if (AdminState.uploadedImages.length === 0) {
    container.innerHTML = `<span style="font-size:11px;color:#94a3b8;padding:10px 0;">등록된 이미지가 없습니다. (파일 업로드 또는 URL 입력)</span>`;
    return;
  }

  container.innerHTML = AdminState.uploadedImages.map((img, idx) => `
    <div class="preview-box">
      <img src="${img}" alt="미리보기 ${idx + 1}" onerror="this.src='assets/room.jpg'">
      <button type="button" onclick="removeImage(${idx})" 
        style="position:absolute;top:2px;right:2px;background:#ef4444;color:#fff;border-radius:50%;width:18px;height:18px;font-size:11px;line-height:1;display:grid;place-items:center;">
        ×
      </button>
      <span style="position:absolute;bottom:2px;left:4px;background:#0008;color:#fff;font-size:9px;padding:1px 4px;border-radius:2px;">
        ${idx === 0 ? '대표' : idx + 1 + '번'}
      </span>
    </div>
  `).join('');
}

// Save Hotel Submit Handler
window.handleSaveHotel = function(e, id) {
  e.preventDefault();
  const name = $('#h-name').value.trim();
  const region = $('#h-region').value;
  const loc = $('#h-loc').value.trim();
  const origPrice = parseNumberFromCommas($('#h-orig-price')?.value) || 200000;
  const price = parseNumberFromCommas($('#h-price')?.value) || 19000;
  const tag = $('#h-tag').value.trim() || 'LOUNGE PICK';
  const isMain = $('#h-ismain').value === 'true';
  const desc = $('#h-desc').value.trim();

  if (!name || !loc || !price) {
    alert('필수 입력 항목을 모두 작성해주세요.');
    return;
  }

  const images = AdminState.uploadedImages.length > 0 ? AdminState.uploadedImages : ['assets/resort.jpg'];

  const hotels = Storage.getHotels();

  if (id) {
    // Edit existing
    const item = hotels.find(h => h.id === id);
    if (item) {
      item.name = name;
      item.region = region;
      item.location = loc;
      item.originalPrice = origPrice;
      item.price = price;
      item.discount = Math.round((1 - price / origPrice) * 100);
      item.tag = tag;
      item.isMain = isMain;
      item.desc = desc;
      item.images = images;
    }
  } else {
    // Create new
    const newId = 'custom_hotel_' + Date.now().toString(36);
    hotels.unshift({
      id: newId,
      name: name,
      region: region,
      location: loc,
      category: 'hotel',
      originalPrice: origPrice,
      price: price,
      discount: Math.round((1 - price / origPrice) * 100),
      images: images,
      tag: tag,
      isMain: isMain,
      desc: desc || `${loc}에 위치한 프리미엄 회원 전용 숙박시설`,
      benefit: '회원 전용 우대 혜택 적용',
      source: 'custom',
      rating: 4.9
    });
  }

  Storage.saveHotels(hotels);
  closeAdminDialog();
  renderHotelsTable();
  updateStats();
  showAdminToast(id ? '숙박시설 정보가 수정되었습니다.' : '새로운 숙박시설이 등록되었습니다!');
};

// ========================================================
// TAB 2: 쿠폰 관리 (규칙 및 대역 발급처 관리)
// ========================================================
function renderAllocationChips() {
  const allocs = Storage.getAllocations();
  const container = $('#allocation-chips');
  if (!container) return;

  container.innerHTML = allocs.map(a => `
    <span style="background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;padding:6px 12px;border-radius:20px;font-size:12px;display:inline-flex;align-items:center;gap:6px;">
      <strong>&lt;${a.branch}&gt;</strong>
      <span>번호 ${a.startNum} ~ ${a.endNum} (총 ${a.endNum - a.startNum + 1}장)</span>
      <small style="opacity:0.75;">${a.date || ''}</small>
    </span>
  `).join('');

  // Update branch filter options
  const filter = $('#coupon-branch-filter');
  if (filter) {
    const branches = ['all', ...new Set(allocs.map(a => a.branch))];
    filter.innerHTML = branches.map(b => `
      <option value="${b}">${b === 'all' ? '전체 발급처' : b}</option>
    `).join('');
  }
}

// Create New Allocation Batch (대역 지정 발급)
window.handleCreateAllocation = function(e) {
  e.preventDefault();
  const start = parseInt($('#alloc-start').value, 10);
  const end = parseInt($('#alloc-end').value, 10);
  const branch = $('#alloc-branch').value.trim();
  const memo = $('#alloc-memo').value.trim();

  if (start < COUPON_RULE.MIN_NUM || end > COUPON_RULE.MAX_NUM || start > end) {
    alert(`쿠폰 번호는 ${COUPON_RULE.MIN_NUM}부터 ${COUPON_RULE.MAX_NUM} 사이여야 합니다.`);
    return;
  }
  if (!branch) {
    alert('발급처(지사명)를 입력해주세요.');
    return;
  }

  const allocs = Storage.getAllocations();
  const newAlloc = {
    id: 'alloc_' + Date.now().toString(36),
    branch: branch,
    startNum: start,
    endNum: end,
    count: end - start + 1,
    date: new Date().toISOString().split('T')[0],
    memo: memo || `${branch} 발급 (${start}~${end})`
  };
  allocs.push(newAlloc);
  Storage.saveAllocations(allocs);

  // Update existing coupons in storage (0002~5000)
  const coupons = Storage.getCoupons();
  let updatedCount = 0;
  for (let n = start; n <= end; n++) {
    const target = coupons.find(c => c.num === n);
    if (target) {
      target.branch = branch;
      if (target.status === 'NOT_ISSUED') {
        target.status = 'ISSUED'; // 미발급 -> 미등록(발급)
      }
      updatedCount++;
    }
  }
  Storage.saveCoupons(coupons);

  $('#alloc-start').value = '';
  $('#alloc-end').value = '';
  $('#alloc-branch').value = '';
  $('#alloc-memo').value = '';

  renderAllocationChips();
  renderCouponsTable(1);
  updateStats();
  showAdminToast(`<${branch}> 대역 (${start}~${end}, 총 ${updatedCount}장)이 성공적으로 발급되었습니다!`);
};

// Render Coupons Table with 4 Statuses & Smooth Pagination
function renderCouponsTable(page = 1) {
  renderAllocationChips();
  AdminState.couponPage = page;
  const coupons = Storage.getCoupons();
  const search = ($('#coupon-search')?.value || '').trim().toUpperCase();
  const searchClean = search.replace(/[^A-Z0-9]/g, '');
  const branchFilter = $('#coupon-branch-filter')?.value || 'all';
  const statusFilter = $('#coupon-status-filter')?.value || 'all';

  let list = coupons.filter(c => {
    if (search) {
      const matchCode = c.code.includes(search) || (searchClean && c.code.replace(/[^A-Z0-9]/g, '').includes(searchClean));
      const matchUser = c.assignedUser && c.assignedUser.toUpperCase().includes(search);
      const matchPhone = c.userPhone && c.userPhone.replace(/[^0-9]/g, '').includes(searchClean);
      if (!matchCode && !matchUser && !matchPhone) return false;
    }
    if (branchFilter !== 'all' && c.branch !== branchFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  const countEl = $('#coupon-table-count');
  if (countEl) countEl.textContent = Money(list.length);
  const tbody = $('#coupons-tbody');
  const paginationEl = $('#coupon-pagination');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:40px;color:#94a3b8;">조건에 해당하는 쿠폰이 없습니다.</td></tr>`;
    if (paginationEl) paginationEl.innerHTML = '';
    return;
  }

  const pageSize = 50;
  const totalPages = Math.ceil(list.length / pageSize) || 1;
  const curPage = Math.min(Math.max(1, page), totalPages);
  AdminState.couponPage = curPage;

  const startIdx = (curPage - 1) * pageSize;
  const displayList = list.slice(startIdx, startIdx + pageSize);

  const statusMap = {
    NOT_ISSUED: { label: '미발급', style: 'background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;' },
    ISSUED: { label: '미등록(발급)', style: 'background:#e0f2fe;color:#0369a1;' },
    REGISTERED: { label: '회원등록완료', style: 'background:#fef3c7;color:#b45309;' },
    USED: { label: '사용완료', style: 'background:#dcfce7;color:#15803d;' }
  };

  tbody.innerHTML = displayList.map((c, idx) => {
    const s = statusMap[c.status] || { label: c.status, style: 'background:#f1f5f9;color:#64748b;' };
    const globalIdx = startIdx + idx + 1;

    return `
      <tr>
        <td style="color:#94a3b8;font-weight:600;">${globalIdx}</td>
        <td><strong style="letter-spacing:0.5px;color:#0f172a;">${c.code}</strong></td>
        <td>
          <span class="status-badge" style="${c.branch === '미발급' ? 'background:#f8fafc;color:#94a3b8;' : 'background:#f1f5f9;color:#334155;'}">
            &lt;${c.branch}&gt;
          </span>
        </td>
        <td><span class="status-badge" style="${s.style}">${s.label}</span></td>
        <td>${c.assignedUser ? `<strong style="color:#0f172a;">${c.assignedUser}</strong>` : '<span style="color:#cbd5e1;">-</span>'}</td>
        <td>${c.userPhone || '<span style="color:#cbd5e1;">-</span>'}</td>
        <td style="font-size:12px;color:#64748b;">${c.registeredAt || '-'}</td>
        <td style="font-size:12px;color:#64748b;">${c.usedAt ? `${c.usedAt} (${c.reservationId || ''})` : '-'}</td>
        <td style="text-align:center;white-space:nowrap;min-width:75px;">
          ${c.status !== 'NOT_ISSUED' ? `
            <button class="btn-tbl-sm" onclick="resetCouponStatus('${c.code}')" title="쿠폰 상태 초기화">초기화</button>
          ` : `
            <span style="color:#cbd5e1;font-size:11px;">-</span>
          `}
        </td>
      </tr>
    `;
  }).join('');

  // Render Pagination Bar
  if (paginationEl) {
    if (totalPages <= 1) {
      paginationEl.innerHTML = '';
      return;
    }

    let pageHtml = '';
    pageHtml += `<button class="btn-tbl-sm" onclick="renderCouponsTable(1)" ${curPage === 1 ? 'disabled style="opacity:0.4;"' : ''}>« 처음</button>`;
    pageHtml += `<button class="btn-tbl-sm" onclick="renderCouponsTable(${curPage - 1})" ${curPage === 1 ? 'disabled style="opacity:0.4;"' : ''}>‹ 이전</button>`;

    const startP = Math.max(1, curPage - 3);
    const endP = Math.min(totalPages, curPage + 3);

    for (let p = startP; p <= endP; p++) {
      pageHtml += `
        <button class="btn-tbl-sm" onclick="renderCouponsTable(${p})" 
          style="${p === curPage ? 'background:#2563eb;color:#fff;font-weight:800;border-color:#2563eb;' : ''}">
          ${p}
        </button>
      `;
    }

    pageHtml += `<button class="btn-tbl-sm" onclick="renderCouponsTable(${curPage + 1})" ${curPage === totalPages ? 'disabled style="opacity:0.4;"' : ''}>다음 ›</button>`;
    pageHtml += `<button class="btn-tbl-sm" onclick="renderCouponsTable(${totalPages})" ${curPage === totalPages ? 'disabled style="opacity:0.4;"' : ''}>끝 »</button>`;
    pageHtml += `<span style="font-size:12px;color:#64748b;margin-left:8px;">(${curPage} / ${totalPages} 페이지)</span>`;

    paginationEl.innerHTML = pageHtml;
  }
}

window.goToCouponPage = function(p) {
  renderCouponsTable(p);
};

window.resetCouponStatus = function(code) {
  if (!confirm(`[${code}] 쿠폰을 초기화하시겠습니까?`)) return;
  const coupons = Storage.getCoupons();
  const allocs = Storage.getAllocations();
  const c = coupons.find(x => x.code === code);
  if (c) {
    // Check if within any allocation
    const matchedAlloc = allocs.find(a => c.num >= a.startNum && c.num <= a.endNum);
    if (matchedAlloc) {
      c.status = 'ISSUED'; // 발급처가 지정된 것은 미등록 상태로
      c.branch = matchedAlloc.branch;
    } else {
      c.status = 'NOT_ISSUED'; // 미발급 상태로
      c.branch = '미발급';
    }
    c.assignedUser = null;
    c.userPhone = null;
    c.registeredAt = null;
    c.usedAt = null;
    c.reservationId = null;
    Storage.saveCoupons(coupons);
    renderCouponsTable(AdminState.couponPage);
    updateStats();
    showAdminToast(`[${code}] 쿠폰이 초기화되었습니다.`);
  }
};

// ========================================================
// TAB 3: 예약 신청 관리
// ========================================================
function renderReservationsTable() {
  const reservations = Storage.getReservations();
  const search = ($('#res-search')?.value || '').trim().toLowerCase();
  const statusFilter = $('#res-status-filter')?.value || 'all';

  let list = reservations.filter(r => {
    if (search && !r.userName.toLowerCase().includes(search) && !r.hotelName.toLowerCase().includes(search)) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const tbody = $('#reservations-tbody');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:40px;color:#94a3b8;">접수된 예약 내역이 없습니다.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(r => `
    <tr>
      <td><strong style="font-size:11px;color:#2563eb;">${r.id}</strong></td>
      <td>
        <div style="font-weight:700;color:#0f172a;">${r.hotelName}</div>
        <small style="color:#64748b;">📍 ${r.hotelLocation}</small>
      </td>
      <td>
        <strong>${r.checkIn} ~ ${r.checkOut}</strong>
        <span class="status-badge" style="background:#e0f2fe;color:#0369a1;margin-left:4px;">${r.nights}박</span>
      </td>
      <td>
        <strong>${r.userName}</strong>
        <div style="font-size:12px;color:#64748b;">${r.phone}</div>
      </td>
      <td style="font-size:12px;color:#475569;max-width:180px;">
        ${r.address} ${r.addressDetail || ''}
      </td>
      <td style="font-size:12px;">성인 ${r.adults}명${r.children ? `, 아동 ${r.children}명` : ''}</td>
      <td style="font-size:12px;color:#64748b;max-width:160px;">${r.requests || '-'}</td>
      <td>
        <strong style="color:#0f172a;">${r.finalPayment === 0 ? '0원' : Money(r.finalPayment) + '원'}</strong>
        ${r.couponCode ? `<div style="font-size:10px;color:#2563eb;">쿠폰: ${r.couponCode}</div>` : ''}
      </td>
      <td>
        <select onchange="updateResStatus('${r.id}', this.value)" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;font-size:12px;font-weight:700;">
          <option value="접수대기" ${r.status === '접수대기' ? 'selected' : ''}>접수대기</option>
          <option value="확정완료" ${r.status === '확정완료' ? 'selected' : ''}>확정완료</option>
          <option value="취소" ${r.status === '취소' ? 'selected' : ''}>예약취소</option>
        </select>
      </td>
    </tr>
  `).join('');
}

window.updateResStatus = function(id, newStatus) {
  const list = Storage.getReservations();
  const r = list.find(x => x.id === id);
  if (r) {
    r.status = newStatus;
    Storage.saveReservations(list);
    updateStats();
    showAdminToast(`예약 상태가 [${newStatus}] 상태로 변경되었습니다.`);
  }
};

// ========================================================
// TAB 4: 상담 신청 내역
// ========================================================
function renderInquiriesTable() {
  const inquiries = Storage.getInquiries();
  const search = ($('#inq-search')?.value || '').trim().toLowerCase();
  const statusFilter = $('#inq-status-filter')?.value || 'all';

  let list = inquiries.filter(q => {
    if (search && !q.name.toLowerCase().includes(search) && !q.phone.includes(search)) return false;
    if (statusFilter !== 'all' && q.status !== statusFilter) return false;
    return true;
  });

  const tbody = $('#inquiries-tbody');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:#94a3b8;">접수된 상담 신청 내역이 없습니다.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(q => `
    <tr>
      <td style="font-size:12px;color:#64748b;">${q.createdAt}</td>
      <td><strong>${q.name}</strong></td>
      <td>${q.phone}</td>
      <td><span class="status-badge" style="background:#f1f5f9;color:#334155;">${q.category}</span></td>
      <td style="font-size:12px;color:#64748b;">${q.preferredTime || '-'}</td>
      <td style="font-size:13px;max-width:240px;line-height:1.5;">${q.content}</td>
      <td>
        <select onchange="updateInqStatus('${q.id}', this.value)" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;font-size:12px;font-weight:700;">
          <option value="상담대기" ${q.status === '상담대기' ? 'selected' : ''}>상담대기</option>
          <option value="상담완료" ${q.status === '상담완료' ? 'selected' : ''}>상담완료</option>
        </select>
      </td>
      <td>
        <input type="text" value="${q.memo || ''}" placeholder="관리자 메모 입력" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;font-size:12px;width:140px;"
          onchange="updateInqMemo('${q.id}', this.value)">
      </td>
    </tr>
  `).join('');
}

window.updateInqStatus = function(id, status) {
  const list = Storage.getInquiries();
  const q = list.find(x => x.id === id);
  if (q) {
    q.status = status;
    Storage.saveInquiries(list);
    updateStats();
    showAdminToast(`상담 상태가 [${status}]로 변경되었습니다.`);
  }
};

window.updateInqMemo = function(id, memo) {
  const list = Storage.getInquiries();
  const q = list.find(x => x.id === id);
  if (q) {
    q.memo = memo;
    Storage.saveInquiries(list);
    showAdminToast('상담 메모가 저장되었습니다.');
  }
};

// ========================================================
// TAB 5: 기타 카테고리 상품 관리 (펜션, 레저, 여행)
// ========================================================
function renderOtherProductsTable() {
  const list = Storage.getOtherProducts();
  const tbody = $('#other-products-tbody');
  if (!tbody) return;

  const catNames = {
    villa: '펜션·풀빌라',
    leisure: '레저·티켓',
    travel: '국내·해외여행'
  };

  tbody.innerHTML = list.map(item => `
    <tr>
      <td><span class="status-badge" style="background:#e0e7ff;color:#4338ca;">${catNames[item.category] || item.category}</span></td>
      <td><img src="${(item.images && item.images[0]) || 'assets/yacht.jpg'}" class="tbl-thumb" alt="${item.name}"></td>
      <td>
        <div style="font-weight:700;color:#0f172a;">${item.name}</div>
        <small style="color:#64748b;">${item.desc || ''}</small>
      </td>
      <td>${item.location} (${item.region})</td>
      <td><strong>${Money(item.price)}원</strong></td>
      <td><span style="color:#2563eb;font-weight:700;">${item.discount || 30}%</span></td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="btn-tbl-sm btn-tbl-danger" onclick="deleteOtherProduct('${item.id}')">삭제</button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.openAddOtherModal = function() {
  const html = `
    <span class="eyebrow blue">상품 직접 등록</span>
    <h2>기타 카테고리 상품 등록</h2>
    <p>펜션·풀빌라, 레저·티켓, 여행 패키지 상품을 등록합니다.</p>

    <form onsubmit="handleSaveOtherProduct(event)" style="display:flex;flex-direction:column;gap:14px;margin-top:16px;">
      <div class="form-grid-2">
        <div class="form-group">
          <label>카테고리 선택 <span class="required">*</span></label>
          <select id="o-category" required>
            <option value="villa">펜션·풀빌라</option>
            <option value="leisure">레저·티켓</option>
            <option value="travel">국내·해외여행</option>
          </select>
        </div>
        <div class="form-group">
          <label>지역 선택 <span class="required">*</span></label>
          <select id="o-region" required>
            <option value="제주">제주</option>
            <option value="부산">부산</option>
            <option value="강원">강원</option>
            <option value="서울·경기">서울·경기</option>
            <option value="경상">경상</option>
            <option value="기타">기타 지역</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>상품명 <span class="required">*</span></label>
        <input type="text" id="o-name" placeholder="상품명을 입력하세요" required>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>상세 위치/장소 <span class="required">*</span></label>
          <input type="text" id="o-loc" placeholder="예: 부산 해운대구 요트경기장" required>
        </div>
        <div class="form-group">
          <label>판매 가격 (원) <span class="required">*</span></label>
          <input type="text" inputmode="numeric" id="o-price" placeholder="49,000" oninput="this.value = formatInputWithCommas(this.value)" required>
        </div>
      </div>

      <div class="form-group">
        <label>대표 이미지 URL</label>
        <input type="url" id="o-image" placeholder="https://images.unsplash.com/..." value="assets/yacht.jpg">
      </div>

      <div class="form-group">
        <label>상품 설명</label>
        <textarea id="o-desc" rows="2" placeholder="상품에 대한 핵심 설명"></textarea>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-cancel" onclick="closeAdminDialog()">취소</button>
        <button type="submit" class="btn-submit-reserve">등록 완료</button>
      </div>
    </form>
  `;
  openAdminDialog(html);
};

window.handleSaveOtherProduct = function(e) {
  e.preventDefault();
  const category = $('#o-category').value;
  const region = $('#o-region').value;
  const name = $('#o-name').value.trim();
  const loc = $('#o-loc').value.trim();
  const price = parseNumberFromCommas($('#o-price').value);
  const image = $('#o-image').value.trim() || 'assets/yacht.jpg';
  const desc = $('#o-desc').value.trim();

  const others = Storage.getOtherProducts();
  others.unshift({
    id: category + '_' + Date.now().toString(36),
    name: name,
    category: category,
    region: region,
    location: loc,
    price: price,
    originalPrice: Math.round(price * 1.45),
    discount: 30,
    images: [image],
    tag: 'RECOMMEND',
    isMain: true,
    desc: desc,
    benefit: '회원 전용 우대 혜택',
    source: 'custom'
  });

  Storage.saveOtherProducts(others);
  closeAdminDialog();
  renderOtherProductsTable();
  updateStats();
  showAdminToast('상품이 성공적으로 등록되었습니다.');
};

window.deleteOtherProduct = function(id) {
  if (!confirm('정말 이 상품을 삭제하시겠습니까?')) return;
  let others = Storage.getOtherProducts();
  others = others.filter(x => x.id !== id);
  Storage.saveOtherProducts(others);
  renderOtherProductsTable();
  updateStats();
  showAdminToast('상품이 삭제되었습니다.');
};

// Admin Init
window.addEventListener('DOMContentLoaded', () => {
  initTabs();
  updateStats();
  renderHotelsTable();
});
