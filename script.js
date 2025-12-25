let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// حفظ
function save() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

// التحكم بخيار الوقت
document.querySelectorAll('input[name="timeOption"]').forEach(radio => {
  radio.addEventListener("change", () => {
    document.getElementById("customTime").disabled =
      document.querySelector('input[name="timeOption"]:checked').value !== "custom";
  });
});

// إضافة مصروف
function addExpense() {
  let amount = document.getElementById("amount").value;
  let note = document.getElementById("note").value;
  let date = document.getElementById("date").value;
  let option = document.querySelector('input[name="timeOption"]:checked').value;

  if (!amount || !date) return alert("أدخل المبلغ والتاريخ");

  let time = option === "now"
    ? new Date().toISOString()
    : document.getElementById("customTime").value;

  expenses.push({
    amount: Number(amount),
    note,
    date,
    time
  });

  save();
  render();
}

// حذف
function deleteExpense(index) {
  expenses.splice(index, 1);
  save();
  render();
}

// عرض البيانات
function render() {
  let list = document.getElementById("list");
  let total = 0;
  list.innerHTML = "";

  expenses.forEach((e, i) => {
    total += e.amount;
    list.innerHTML += `
      <li>
        ${e.date} - ${e.note || "بدون وصف"} : ${e.amount}
        <button onclick="deleteExpense(${i})">❌</button>
      </li>
    `;
  });

  document.getElementById("total").innerText = total;
  loadMonths();
}

// تحميل الأشهر
function loadMonths() {
  let select = document.getElementById("exportMonth");
  let months = [...new Set(expenses.map(e => e.date.slice(0,7)))];

  select.innerHTML = "";
  months.forEach(m => {
    select.innerHTML += `<option value="${m}">${m}</option>`;
  });
}

// تصدير PDF
function exportPDF() {
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF();

  let month = document.getElementById("exportMonth").value;
  let data = expenses.filter(e => e.date.startsWith(month));

  let y = 10;
  let total = 0;

  doc.text(`مصروفات شهر ${month}`, 10, y);
  y += 10;

  data.forEach(e => {
    doc.text(`${e.date} - ${e.note || ""} - ${e.amount}`, 10, y);
    total += e.amount;
    y += 8;
  });

  y += 10;
  doc.text(`المجموع: ${total}`, 10, y);

  doc.save(`expenses-${month}.pdf`);
}

// تصدير XML
function exportXML() {
  let month = document.getElementById("exportMonth").value;
  let data = expenses.filter(e => e.date.startsWith(month));
  let total = data.reduce((s, e) => s + e.amount, 0);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<expenses month="${month}">
  <total>${total}</total>`;

  data.forEach(e => {
    xml += `
  <expense>
    <date>${e.date}</date>
    <time>${e.time}</time>
    <note>${e.note}</note>
    <amount>${e.amount}</amount>
  </expense>`;
  });

  xml += `
</expenses>`;

  let blob = new Blob([xml], { type: "application/xml" });
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `expenses-${month}.xml`;
  a.click();
}

render();
