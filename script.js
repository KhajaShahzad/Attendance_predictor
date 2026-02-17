function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── Info Popup Toggle ────────────────────────────────────────────────────────
function toggleInfo() {
  const popup = document.getElementById('infoPopup');
  popup.classList.toggle('show');
}

// ─── Main Calculation ─────────────────────────────────────────────────────────
function calculateAttendance() {
  const heldRaw     = document.getElementById('held').value;
  const attendedRaw = document.getElementById('attended').value;
  const requiredRaw = document.getElementById('required').value;

  // Validate empty fields
  if (!heldRaw || !attendedRaw || !requiredRaw) {
    showToast('Please fill in all fields');
    return;
  }

  const held     = Number(heldRaw);
  const attended = Number(attendedRaw);
  const required = Number(requiredRaw);

  // Validate values
  if (held <= 0) {
    showToast('Total classes must be greater than 0');
    return;
  }
  if (attended < 0 || attended > held) {
    showToast('Attended must be between 0 and total classes');
    return;
  }
  if (required < 1 || required > 100) {
    showToast('Required % must be between 1 and 100');
    return;
  }

  // ─── Core Math ─────────────────────────────────────────────────────────────
  const current    = (attended / held) * 100;
  const nextAttend = ((attended + 1) / (held + 1)) * 100;
  const nextMiss   = (attended / (held + 1)) * 100;

  // Safe bunk calculation
  let safeBunk = 0;
  let tH = held, tA = attended;
  while ((tA / (tH + 1)) * 100 >= required && safeBunk < 1000) {
    tH++;
    safeBunk++;
  }

  // Must attend (recovery) calculation
  let mustAttend = 0;
  let tH2 = held, tA2 = attended;
  while ((tA2 / tH2) * 100 < required && mustAttend < 1000) {
    tH2++;
    tA2++;
    mustAttend++;
  }

  // ─── Render Results ─────────────────────────────────────────────────────────
  const isSafe = current >= required;

  // Current %
  document.getElementById('currentVal').textContent = current.toFixed(2) + '%';

  // Next class stats
  document.getElementById('nextAttend').textContent = nextAttend.toFixed(2) + '%';
  document.getElementById('nextMiss').textContent   = nextMiss.toFixed(2) + '%';

  // Progress bar
  const barFill = document.getElementById('barFill');
  barFill.style.width      = Math.min(current, 100) + '%';
  barFill.style.background = isSafe
    ? 'linear-gradient(90deg, #34d399, #6ee7b7)'
    : 'linear-gradient(90deg, #f87171, #fca5a5)';

  // Status pill
  const pill = document.getElementById('statusPill');
  pill.className   = 'status-pill ' + (isSafe ? 'safe' : 'danger');
  pill.textContent = isSafe ? ' Safe' : ' At Risk';

  // Verdict box
  const verdict = document.getElementById('verdict');
  if (safeBunk > 0) {
    verdict.className = 'verdict ok';
    verdict.innerHTML =
      `<strong>🎉 You can relax a bit!</strong>` +
      `You can skip <strong style="color:#34d399">${safeBunk} more class${safeBunk > 1 ? 'es' : ''}</strong>` +
      ` and still maintain ${required}% attendance.`;
  } else {
    verdict.className = 'verdict warn';
    verdict.innerHTML =
      `<strong>⚠️ Recovery needed</strong>` +
      `Attend the next <strong style="color:#f87171">${mustAttend} consecutive class${mustAttend > 1 ? 'es' : ''}</strong>` +
      ` without missing any to reach ${required}%.`;
  }

  // Animate results in (re-trigger animation each time)
  const resultsEl = document.getElementById('results');
  resultsEl.classList.remove('show');
  void resultsEl.offsetWidth; // force reflow
  resultsEl.classList.add('show');
}