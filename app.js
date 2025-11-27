// 簡易記帳本 - 使用 localStorage 儲存 (Vibe Coding 產出範例)
const form = document.getElementById('entry-form');
const tbody = document.querySelector('#ledger tbody');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const balanceEl = document.getElementById('balance');

const STORAGE_KEY = 'vibe-ledger-entries';

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '[]';
    return JSON.parse(raw);
  } catch (e) {
    console.error('載入資料錯誤', e);
    return [];
  }
}

function saveEntries(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function render() {
  const list = loadEntries();
  tbody.innerHTML = '';
  let income = 0, expense = 0;
  list.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.date}</td>
      <td>${item.category}</td>
      <td>${item.type === 'income' ? '收入' : '支出'}</td>
      <td>${Number(item.amount).toFixed(2)}</td>
      <td>${item.note || ''}</td>
      <td><button class="del" data-idx="${idx}">刪除</button></td>
    `;
    tbody.appendChild(tr);
    if (item.type === 'income') income += Number(item.amount);
    else expense += Number(item.amount);
  });
  totalIncomeEl.textContent = income.toFixed(2);
  totalExpenseEl.textContent = expense.toFixed(2);
  balanceEl.textContent = (income - expense).toFixed(2);
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const entry = {
    date: document.getElementById('date').value || new Date().toISOString().slice(0,10),
    category: document.getElementById('category').value,
    type: document.getElementById('type').value,
    amount: Number(document.getElementById('amount').value || 0).toFixed(2),
    note: document.getElementById('note').value.trim()
  };
  const list = loadEntries();
  list.unshift(entry);
  saveEntries(list);
  form.reset();
  render();
});

tbody.addEventListener('click', e => {
  if (e.target.matches('.del')) {
    const idx = Number(e.target.dataset.idx);
    const list = loadEntries();
    list.splice(idx,1);
    saveEntries(list);
    render();
  }
});

document.getElementById('clear').addEventListener('click', () => {
  if (confirm('確定要清除所有資料嗎？')) {
    localStorage.removeItem(STORAGE_KEY);
    render();
  }
});

document.getElementById('export').addEventListener('click', () => {
  const list = loadEntries();
  if (!list.length) return alert('沒有資料可匯出');
  const header = ['日期','類別','類型','金額','說明'];
  const rows = list.map(r => [r.date, r.category, r.type === 'income' ? '收入' : '支出', r.amount, r.note]);
  const csv = [header.join(','), ...rows.map(r => r.map(field => '"'+String(field).replace(/"/g,'""')+'"').join(','))].join('\n');
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vibe_ledger_export.csv';
  a.click();
  URL.revokeObjectURL(url);
});

// initial render
render();
