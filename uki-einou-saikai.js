/**
 * 宇城市 営農再開支援事業（ハード事業） シミュレーター & インタラクション
 */
(()=>{
  // 印刷ボタン
  const printBtn = document.getElementById("printGuideBtn");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // 印刷時はFAQの折りたたみをすべて開く（閉じたdetailsは印刷されないため）
  let reclose = [];
  window.addEventListener("beforeprint", () => {
    reclose = [...document.querySelectorAll("details:not([open])")];
    for (const item of reclose) item.open = true;
  });
  window.addEventListener("afterprint", () => {
    for (const item of reclose) item.open = false;
    reclose = [];
  });

  // シミュレーター
  const menuSelect = document.getElementById("simMenu");
  const costInput = document.getElementById("simCost");
  const overInput = document.getElementById("simOver");
  const subsidyEl = document.getElementById("resSubsidy");
  const targetEl = document.getElementById("resTarget");
  const rateEl = document.getElementById("resRate");
  const selfEl = document.getElementById("resSelf");

  if (!menuSelect || !costInput || !overInput) return;

  // 補助率の表示は分数のまま伝える（公表値が「9/10以内」等のため）
  const rateLabels = {
    "0.9": "9/10 以内",
    "0.7": "7/10 以内",
    "0.7b": "7/10 以内",
    "0.8": "8/10 以内"
  };

  const formatYen = num => `${Math.floor(num).toLocaleString("ja-JP")} 円`;

  const calculate = () => {
    const value = menuSelect.value;
    const rate = Number.parseFloat(value);
    const cost = Math.max(0, Number(costInput.value) || 0) * 10000;
    const over = Math.min(cost, Math.max(0, Number(overInput.value) || 0) * 10000);

    // 原形復旧を超える部分は補助対象外（全額自己負担）
    const target = Math.max(0, cost - over);
    const subsidy = Math.floor(target * rate);
    const self = Math.max(0, cost - subsidy);

    targetEl.textContent = formatYen(target);
    rateEl.textContent = rateLabels[value] || "";
    subsidyEl.textContent = formatYen(subsidy);
    selfEl.textContent = formatYen(self);
  };

  menuSelect.addEventListener("change", calculate);
  costInput.addEventListener("input", calculate);
  overInput.addEventListener("input", calculate);

  calculate();
})();
