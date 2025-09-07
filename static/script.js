// ======================
// SPARKLE HOVERING EFFECT
// ======================
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('sketch-container');

  const sketch = Sketch.create({
    container: container,
    fullscreen: true,
    particles: [],
    setup: function () {
      for (let i = 0; i < 20; i++) this.spawn(this.width / 2, this.height / 2);
    },
    spawn: function (x, y) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() * 2 - 1),
        vy: (Math.random() * 2 - 1),
        size: Math.random() * 3 + 2,
        life: Math.floor(Math.random() * 100) + 50
      });
    },
    update: function () {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        let p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) this.particles.splice(i, 1);
      }
    },
    draw: function () {
      this.globalCompositeOperation = 'lighter';
      this.particles.forEach(p => {
        this.beginPath();
        this.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.fillStyle = 'rgba(255, 215, 0, 0.8)';
        this.fill();
      });
    },
    resize: function () {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }
  });

  if (sketch && sketch.canvas) {
    sketch.canvas.style.pointerEvents = 'none';
    sketch.canvas.style.position = 'fixed';
    sketch.canvas.style.top = '0';
    sketch.canvas.style.left = '0';
    sketch.canvas.style.width = '100%';
    sketch.canvas.style.height = '100%';
    sketch.canvas.style.zIndex = '0';
  }

  window.addEventListener('mousemove', (e) => {
    if (!sketch || !sketch.canvas) return;
    const rect = sketch.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for (let i = 0; i < 2; i++) sketch.spawn(x, y);
  });

  window.addEventListener('touchmove', (e) => {
    if (!sketch || !sketch.canvas || !e.touches) return;
    const t = e.touches[0];
    const rect = sketch.canvas.getBoundingClientRect();
    const x = t.clientX - rect.left;
    const y = t.clientY - rect.top;
    for (let i = 0; i < 2; i++) sketch.spawn(x, y);
  }, { passive: true });
});
// END OF HOVER EFFECT JS ---------------------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
  const formContainer = document.getElementById("formContainer");
  const toggleFormBtn = document.getElementById("toggleFormBtn");

  toggleFormBtn.addEventListener("click", () => {
    formContainer.classList.toggle("hidden");
    // Change + to x when open
    toggleFormBtn.textContent = formContainer.classList.contains("hidden") ? "+" : "×";
  });

  const incomeAmount = document.getElementById("incomeAmount");
  const incomeCategory = document.getElementById("incomeCategory");
  const incomeNote = document.getElementById("incomeNote");
  const addIncomeBtn = document.getElementById("addIncomeBtn");

  const expenseAmount = document.getElementById("expenseAmount");
  const expenseCategory = document.getElementById("expenseCategory");
  const expenseNote = document.getElementById("expenseNote");
  const addExpenseBtn = document.getElementById("addExpenseBtn");

  const balanceEl = document.getElementById("balance");
  const totalIncomeEl = document.getElementById("total-income");
  const totalExpenseEl = document.getElementById("total-expense");
  const transactionList = document.getElementById("transactions-list");

  // Fetch records from backend
  function loadRecords() {
    fetch("/get-records")
      .then(res => res.json())
      .then(data => updateUI(data))
      .catch(err => console.error("Error loading records", err));
  }

  // Update UI
  function updateUI(data) {
    let totalIncome = 0;
    let totalExpense = 0;
    transactionList.innerHTML = "";

    data.forEach(item => {
      if (item.type === "income") totalIncome += item.amount;
      if (item.type === "expense") totalExpense += item.amount;

      const li = document.createElement("li");
      li.textContent = `${item.category} - $${item.amount.toFixed(2)} (${item.note || ""})`;
      li.style.color = item.type === "income" ? "lightgreen" : "salmon";
      transactionList.appendChild(li);
    });

    totalIncomeEl.textContent = `$${totalIncome.toFixed(2)}`;
    totalExpenseEl.textContent = `$${totalExpense.toFixed(2)}`;
    balanceEl.textContent = `$${(totalIncome - totalExpense).toFixed(2)}`;
  }

  // Add Income
  addIncomeBtn.addEventListener("click", function () {
    if (!incomeAmount.value) return;

    const record = {
      type: "income",
      amount: parseFloat(incomeAmount.value),
      category: incomeCategory.value || "Salary",
      note: incomeNote.value
    };

    fetch("/add-record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record)
    })
      .then(() => {
        loadRecords();
        incomeAmount.value = "";
        incomeCategory.value = "";
        incomeNote.value = "";
      });
  });

  // Add Expense
  addExpenseBtn.addEventListener("click", function () {
    if (!expenseAmount.value) return;

    const record = {
      type: "expense",
      amount: parseFloat(expenseAmount.value),
      category: expenseCategory.value || "General",
      note: expenseNote.value
    };

    fetch("/add-record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record)
    })
      .then(() => {
        loadRecords();
        expenseAmount.value = "";
        expenseCategory.value = "";
        expenseNote.value = "";
      });
  });

  // Initial load
  loadRecords();

  // ======================
  // AUTO ADJUST BOTTOM NAV
  // ======================
  function adjustBottomNav() {
    const nav = document.querySelector(".bottom-nav");
    if (!nav) return;

    const vh = window.innerHeight;
    const realVh = document.documentElement.clientHeight;

    // If OS taskbar/dock is visible, available height < viewport height
    if (realVh < vh) {
      nav.style.bottom = (vh - realVh + 5) + "px"; // move above taskbar
    } else {
      nav.style.bottom = "0px"; // reset
    }
  }

  window.addEventListener("resize", adjustBottomNav);
  window.addEventListener("load", adjustBottomNav);
  adjustBottomNav(); // run once at startup
});
