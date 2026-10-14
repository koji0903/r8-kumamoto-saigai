/**
 * 氷川町 中小企業資金繰り支援（利子補給）シミュレーター & インタラクション
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
  const resultNote = document.getElementById('calcResultNote');

  function calculateSubsidy() {
    if (!amountInput || !rateInput || !yearsSelect || !resultDisplay) return;

    const principal = parseFloat(amountInput.value) * 10000; // 万円 -> 円
    const annualRate = parseFloat(rateInput.value) / 100; // % -> 小数
    const years = parseInt(yearsSelect.value, 10);
    const graceYears = graceSelect ? parseInt(graceSelect.value, 10) : 0;

    if (isNaN(principal) || principal <= 0 || isNaN(annualRate) || annualRate <= 0) {
      resultDisplay.textContent = '0 円';
      if (resultNote) resultNote.textContent = '借入額と想定金利を正しく入力してください';
      return;
    }

    // 初回償還月から最長5年間（60か月）の利子総額を元利均等・元金均等等の近似で計算（元金均等方式で安全側に試算）
    // 据置期間中は元本減少しない
    const totalMonths = years * 12;
    const graceMonths = graceYears * 12;
    const subsidyMonths = Math.min(60, totalMonths); // 最長5年(60ヶ月)
    const repaymentMonths = totalMonths - graceMonths;

    let totalInterest = 0;
    let currentBalance = principal;
    const monthlyPrincipalRepayment = repaymentMonths > 0 ? principal / repaymentMonths : 0;

    for (let m = 1; m <= subsidyMonths; m++) {
      // 当月利息 = 残高 * 年利 / 12
      const monthInterest = currentBalance * (annualRate / 12);
      totalInterest += monthInterest;

      // 据置期間経過後は元金均等返済
      if (m > graceMonths && currentBalance > 0) {
        currentBalance = Math.max(0, currentBalance - monthlyPrincipalRepayment);
      }
    }

    const totalYen = Math.round(totalInterest);
    const totalMan = (totalYen / 10000).toFixed(1);

    resultDisplay.innerHTML = `約 ${Number(totalYen).toLocaleString()} <small>円 （約 ${totalMan} 万円）</small>`;
    if (resultNote) {
      resultNote.textContent = `※5年間（60か月）で支払う利子の全額が氷川町から補助され、実質負担 0 円（無利子）になります。`;
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
