// ── Chart Instances ───────────────────────────────────────────
let barChartInstance = null;
let pieChartInstance = null;

// ── Chart Defaults ────────────────────────────────────────────
Chart.defaults.color       = '#94a3b8';
Chart.defaults.font.family = 'Plus Jakarta Sans';

// ── Bar Chart (Monthly Overview) ──────────────────────────────
const renderBarChart = (data) => {
  const ctx = document.getElementById('barChart');
  if (!ctx) return;

  if (barChartInstance) {
    barChartInstance.destroy();
    barChartInstance = null;
  }

  if (!data || data.length === 0) {
    ctx.parentElement.innerHTML =
      '<p style="text-align:center;color:var(--text-muted);padding-top:100px;">No data available</p>';
    return;
  }

  const labels  = data.map(d => d.month_label);
  const income  = data.map(d => parseFloat(d.total_income)  || 0);
  const expense = data.map(d => parseFloat(d.total_expense) || 0);

  barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label:           'Income',
          data:            income,
          backgroundColor: 'rgba(34,197,94,0.8)',
          borderColor:     'rgba(34,197,94,1)',
          borderWidth:     1,
          borderRadius:    6,
        },
        {
          label:           'Expense',
          data:            expense,
          backgroundColor: 'rgba(239,68,68,0.8)',
          borderColor:     'rgba(239,68,68,1)',
          borderWidth:     1,
          borderRadius:    6,
        },
      ],
    },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      animation:           { duration: 600 },
      plugins: {
        legend: {
          position: 'top',
          labels:   { color: '#94a3b8', boxWidth: 12 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ₹${Number(ctx.raw).toLocaleString('en-IN')}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8' },
          grid:  { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          ticks: {
            color:    '#94a3b8',
            callback: (val) => '₹' + Number(val).toLocaleString('en-IN'),
          },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
    },
  });
};

// ── Pie Chart (Category Breakdown) ────────────────────────────
const renderPieChart = (data) => {
  const ctx = document.getElementById('pieChart');
  if (!ctx) return;

  if (pieChartInstance) {
    pieChartInstance.destroy();
    pieChartInstance = null;
  }

  if (!data || data.length === 0) {
    ctx.parentElement.innerHTML =
      '<p style="text-align:center;color:var(--text-muted);padding-top:100px;">No expense data</p>';
    return;
  }

  const labels = data.map(d => d.category_name);
  const values = data.map(d => parseFloat(d.total) || 0);

  const colors = [
    '#6c63ff','#22c55e','#ef4444','#f59e0b',
    '#3b82f6','#ec4899','#14b8a6','#8b5cf6',
    '#f97316','#06b6d4','#84cc16','#e11d48',
  ];

  pieChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data:            values,
        backgroundColor: colors.slice(0, values.length),
        borderColor:     '#1a1a2e',
        borderWidth:     3,
      }],
    },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      animation:           { duration: 600 },
      plugins: {
        legend: {
          position: 'right',
          labels:   { color: '#94a3b8', boxWidth: 12, padding: 16 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const item = data[ctx.dataIndex];
              return ` ₹${Number(item.total).toLocaleString('en-IN')} (${item.percentage}%)`;
            },
          },
        },
      },
    },
  });
};