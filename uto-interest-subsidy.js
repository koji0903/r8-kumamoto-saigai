/**
 * 宇土市 中小企業等利子補給金 シミュレーター & インタラクション
 */
(() => {
  'use strict';

  // 印刷ボタン
  const printBtn = document.getElementById('printGuideBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // スムーズスクロール
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#' || !href) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
        history.pushState(null, '', href);
      }
    });
  });

  // 利子補給シミュレーター
  const amountInput = document.getElementById('calcAmount');
  const rateInput = document.getElementById('calcRate');
  const yearsSelect = document.getElementById('calcYears');
  const graceSelect = document.getElementById('calcGrace');
  const resultDisplay = document.getElementById('calcResultVal');
  const y1Display = document.getElementById('calcY1Val');
  const y2Display = document.getElementById('calcY2Val');
  const y3Display = document.getElementById('calcY3Val');
  const resultNote = document.getElementById('calcResultNote');

  function calculateSubsidy() {
    if (!amountInput || !rateInput || !yearsSelect || !resultDisplay) return;

    const principal = parseFloat(amountInput.value) * 10000; // 万円 -> 円
    const annualRate = parseFloat(rateInput.value) / 100; // % -> 小数
    const years = parseInt(yearsSelect.value, 10);
    const graceYears = graceSelect ? parseInt(graceSelect.value, 10) : 0;

    if (isNaN(principal) || principal <= 0 || isNaN(annualRate) || annualRate <= 0) {
      resultDisplay.textContent = '0 円';
      if (y1Display) y1Display.textContent = '-';
      if (y2Display) y2Display.textContent = '-';
      if (y3Display) y3Display.textContent = '-';
      if (resultNote) resultNote.textContent = '借入額と想定金利を正しく入力してください';
      return;
    }

    const totalMonths = years * 12;
    const graceMonths = graceYears * 12;
    const subsidyMonths = Math.min(36, totalMonths); // 宇土市は最長3年(36ヶ月)
    const repaymentMonths = totalMonths - graceMonths;

    let currentBalance = principal;
    const monthlyPrincipalRepayment = repaymentMonths > 0 ? principal / repaymentMonths : 0;

    let yearInterest = [0, 0, 0];
    let yearSubsidy = [0, 0, 0];
    const annualCap = 1000000; // 年間100万円限度

    for (let m = 1; m <= subsidyMonths; m++) {
      const monthInterest = currentBalance * (annualRate / 12);
      const yearIdx = Math.floor((m - 1) / 12);
      if (yearIdx < 3) {
        yearInterest[yearIdx] += monthInterest;
      }

      // 据置期間経過後は元金均等返済
      if (m > graceMonths && currentBalance > 0) {
        currentBalance = Math.max(0, currentBalance - monthlyPrincipalRepayment);
      }
    }

    let totalSubsidy = 0;
    let hitCap = false;

    for (let y = 0; y < 3; y++) {
      const rawInt = yearInterest[y];
      const sub = Math.min(rawInt, annualCap);
      if (rawInt > annualCap) hitCap = true;
      yearSubsidy[y] = Math.round(sub);
      totalSubsidy += yearSubsidy[y];
    }

    const totalMan = (totalSubsidy / 10000).toFixed(1);
    resultDisplay.innerHTML = `約 ${Number(totalSubsidy).toLocaleString()} <small>円 （約 ${totalMan} 万円）</small>`;

    if (y1Display) y1Display.textContent = `約 ${(yearSubsidy[0] / 10000).toFixed(1)} 万円`;
    if (y2Display) y2Display.textContent = `約 ${(yearSubsidy[1] / 10000).toFixed(1)} 万円`;
    if (y3Display) y3Display.textContent = `約 ${(yearSubsidy[2] / 10000).toFixed(1)} 万円`;

    if (resultNote) {
      if (hitCap) {
        resultNote.textContent = `※年間100万円の限度額が適用されています。3年間で最大300万円まで宇土市から利子補給金が交付されます。`;
      } else {
        resultNote.textContent = `※初回返済日から最長3年間（36か月）に支払う利子の全額が宇土市から補助され、実質負担 0 円（無利子）になります。`;
      }
    }
  }

  if (amountInput && rateInput && yearsSelect) {
    [amountInput, rateInput, yearsSelect, graceSelect].forEach(el => {
      if (el) {
        el.addEventListener('input', calculateSubsidy);
        el.addEventListener('change', calculateSubsidy);
      }
    });
    calculateSubsidy();
  }
})();
