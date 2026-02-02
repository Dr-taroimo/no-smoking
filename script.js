/**
 * 禁煙日数カウント
 * 禁煙開始日を設定し、経過日数を表示する
 */

const STORAGE_KEY = 'kinen_quit_date';

const quitDateInput = document.getElementById('quitDate');
const setDateBtn = document.getElementById('setDateBtn');
const dateHint = document.getElementById('dateHint');
const countSection = document.getElementById('countSection');
const daysNumber = document.getElementById('daysNumber');
const messageEl = document.getElementById('message');
const startDateDisplay = document.getElementById('startDateDisplay');

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
 * 保存されている禁煙開始日を読み込み、表示を更新
 */
function loadAndUpdate() {
  const saved = localStorage.getItem(STORAGE_KEY);
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
  } else {
    quitDateInput.value = todayString();
    countSection.classList.add('hidden');
  }
}

/**
 * 禁煙開始日を設定して保存し、表示を更新
 */
function setQuitDate() {
  const value = quitDateInput.value.trim();
  if (!value) {
    dateHint.textContent = '日付を選んでから「設定する」を押してください。';
    return;
  }
  localStorage.setItem(STORAGE_KEY, value);
  dateHint.textContent = '設定しました。';
  loadAndUpdate();
}

// 初期表示
quitDateInput.setAttribute('max', todayString());
loadAndUpdate();

setDateBtn.addEventListener('click', setQuitDate);
