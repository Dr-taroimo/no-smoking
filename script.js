/**
 * 禁煙日数カウント
 * 禁煙開始日を設定し、経過日数と節約額を表示する
 */

const STORAGE_KEY_QUIT = 'kinen_quit_date';
const STORAGE_KEY_PACK_PRICE = 'kinen_pack_price';
const STORAGE_KEY_CIGARETTES_PER_DAY = 'kinen_cigarettes_per_day';
const STORAGE_KEY_TARGET_DAYS = 'kinen_target_days';
const CIGARETTES_PER_PACK = 20; // 1箱＝20本で内部計算

const quitDateInput = document.getElementById('quitDate');
const setDateBtn = document.getElementById('setDateBtn');
const dateHint = document.getElementById('dateHint');
const countSection = document.getElementById('countSection');
const daysNumber = document.getElementById('daysNumber');
const messageEl = document.getElementById('message');
const startDateDisplay = document.getElementById('startDateDisplay');
const savedAmountEl = document.getElementById('savedAmount');
const savedAmountWrap = document.getElementById('savedAmountWrap');
const packPriceInput = document.getElementById('packPrice');
const cigarettesPerDayInput = document.getElementById('cigarettesPerDay');
const screenInput = document.getElementById('screen-input');
const screenDisplay = document.getElementById('screen-display');
const tabInput = document.getElementById('tab-input');
const tabDisplay = document.getElementById('tab-display');
const targetDaysInput = document.getElementById('targetDays');
const setAllBtn = document.getElementById('setAllBtn');
const setAllHint = document.getElementById('setAllHint');
const headerTitle = document.getElementById('headerTitle');
const targetLeftWrap = document.getElementById('targetLeftWrap');
const targetLeftLabel = document.getElementById('targetLeftLabel');
const targetLeftDays = document.getElementById('targetLeftDays');
const circleRing = document.getElementById('circleRing');

/**
 * 今日の日付を YYYY-MM-DD で返す
 */
function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 禁煙開始日から経過日数を計算（0始まり：開始日が0日目）
 */
function getDaysSinceQuit(quitDateStr) {
  const quit = new Date(quitDateStr);
  const today = new Date();
  quit.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = today - quit;
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

/**
 * 日付を日本語表示用にフォーマット
 */
function formatDateDisplay(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}年${m}月${day}日から`;
}

/**
 * 節約額を計算して表示（1箱＝20本で換算し、日数 × 1箱の値段 × (1日の本数／20)）
 * 常に「節約した金額」を表示し、未入力のときは 0円 を表示
 */
function updateSavedAmount() {
  const saved = localStorage.getItem(STORAGE_KEY_QUIT);
  savedAmountWrap.classList.remove('hidden');
  if (!saved) {
    savedAmountEl.textContent = '0円';
    return;
  }
  const days = getDaysSinceQuit(saved);
  if (days < 0) {
    savedAmountEl.textContent = '0円';
    return;
  }
  const price = parseFloat(packPriceInput.value) || 0;
  const cigarettes = parseFloat(cigarettesPerDayInput.value) || 0;
  if (price <= 0 || cigarettes <= 0) {
    savedAmountEl.textContent = '0円';
    return;
  }
  const packsPerDay = cigarettes / CIGARETTES_PER_PACK;
  const savedYen = Math.floor(days * price * packsPerDay);
  savedAmountEl.textContent = savedYen.toLocaleString() + '円';
}

/**
 * 保存されている禁煙開始日を読み込み、表示を更新
 */
function loadAndUpdate() {
  const saved = localStorage.getItem(STORAGE_KEY_QUIT);
  if (saved) {
    quitDateInput.value = saved;
    const days = getDaysSinceQuit(saved);
    daysNumber.textContent = days;
    startDateDisplay.textContent = formatDateDisplay(saved);
    if (days < 0) {
      messageEl.textContent = '禁煙開始日は今日以降に設定できます。';
    } else if (days === 0) {
      messageEl.textContent = '禁煙1日目！この調子で。';
    } else {
      messageEl.textContent = '禁煙継続中！';
    }
    countSection.classList.remove('hidden');
    updateSavedAmount();
    updateTargetLeft(days);
  } else {
    quitDateInput.value = todayString();
    countSection.classList.add('hidden');
    targetLeftWrap.classList.add('hidden');
  }
}

/**
 * 目標まであと〇〇日を表示（目標禁煙日数が設定されているとき）
 */
function updateTargetLeft(days) {
  const targetStr = localStorage.getItem(STORAGE_KEY_TARGET_DAYS);
  const target = parseInt(targetStr, 10);
  if (!targetStr || isNaN(target) || target < 1) {
    targetLeftWrap.classList.add('hidden');
    circleRing.style.setProperty('--progress', '0');
    return;
  }
  targetLeftWrap.classList.remove('hidden');
  targetLeftLabel.textContent = '目標' + target + '日';
  if (days >= target) {
    targetLeftDays.textContent = '達成！';
  } else {
    targetLeftDays.textContent = 'あと' + (target - days) + '日';
  }
  var p = Math.min(1, days / target);
  circleRing.style.setProperty('--progress', p);
}

/**
 * 禁煙開始日・タバコの値段・目標日数をまとめて保存し、表示を更新
 * 入力順：禁煙開始日 → タバコの値段 → 目標日数 → 最後に「設定する」を押す
 */
function setAll() {
  const dateVal = quitDateInput.value.trim();
  if (!dateVal) {
    setAllHint.textContent = '禁煙開始日を選んでください。';
    return;
  }
  localStorage.setItem(STORAGE_KEY_QUIT, dateVal);

  const priceVal = packPriceInput.value.trim();
  const cigarettesVal = cigarettesPerDayInput.value.trim();
  if (priceVal !== '') localStorage.setItem(STORAGE_KEY_PACK_PRICE, priceVal);
  if (cigarettesVal !== '') localStorage.setItem(STORAGE_KEY_CIGARETTES_PER_DAY, cigarettesVal);

  const targetVal = targetDaysInput.value.trim();
  if (targetVal !== '' && parseInt(targetVal, 10) >= 1) {
    localStorage.setItem(STORAGE_KEY_TARGET_DAYS, targetVal);
  }

  setAllHint.textContent = '設定しました。';
  loadAndUpdate();
}

/**
 * タバコの値段・本数を保存して節約額を更新（表示切り替え時用）
 */
function savePriceAndUpdate() {
  const price = packPriceInput.value.trim();
  const cigarettes = cigarettesPerDayInput.value.trim();
  if (price !== '') localStorage.setItem(STORAGE_KEY_PACK_PRICE, price);
  if (cigarettes !== '') localStorage.setItem(STORAGE_KEY_CIGARETTES_PER_DAY, cigarettes);
  updateSavedAmount();
}

function saveTargetAndUpdate() {
  const target = targetDaysInput.value.trim();
  if (target !== '') localStorage.setItem(STORAGE_KEY_TARGET_DAYS, target);
  const saved = localStorage.getItem(STORAGE_KEY_QUIT);
  if (saved) {
    const days = getDaysSinceQuit(saved);
    updateTargetLeft(days);
  }
}

/**
 * 表示画面に切り替え（表示を最新に更新）
 */
function showDisplayScreen() {
  screenInput.classList.remove('screen-active');
  screenDisplay.classList.add('screen-active');
  tabInput.classList.remove('tab-active');
  tabInput.setAttribute('aria-pressed', 'false');
  tabDisplay.classList.add('tab-active');
  tabDisplay.setAttribute('aria-pressed', 'true');
  headerTitle.textContent = '禁煙日数';
  loadAndUpdate();
}

/**
 * 入力画面に切り替え
 */
function showInputScreen() {
  screenDisplay.classList.remove('screen-active');
  screenInput.classList.add('screen-active');
  tabDisplay.classList.remove('tab-active');
  tabDisplay.setAttribute('aria-pressed', 'false');
  tabInput.classList.add('tab-active');
  tabInput.setAttribute('aria-pressed', 'true');
  headerTitle.textContent = '入力';
}

// 初期表示
quitDateInput.setAttribute('max', todayString());
packPriceInput.value = localStorage.getItem(STORAGE_KEY_PACK_PRICE) || '';
cigarettesPerDayInput.value = localStorage.getItem(STORAGE_KEY_CIGARETTES_PER_DAY) || '';
targetDaysInput.value = localStorage.getItem(STORAGE_KEY_TARGET_DAYS) || '';
loadAndUpdate();

setAllBtn.addEventListener('click', setAll);
packPriceInput.addEventListener('input', savePriceAndUpdate);
packPriceInput.addEventListener('blur', savePriceAndUpdate);
cigarettesPerDayInput.addEventListener('input', savePriceAndUpdate);
cigarettesPerDayInput.addEventListener('blur', savePriceAndUpdate);
targetDaysInput.addEventListener('input', saveTargetAndUpdate);
targetDaysInput.addEventListener('blur', saveTargetAndUpdate);

tabInput.addEventListener('click', showInputScreen);
tabDisplay.addEventListener('click', showDisplayScreen);
