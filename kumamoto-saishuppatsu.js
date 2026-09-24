/**
 * くまもと事業者再出発支援補助金 シミュレーター & インタラクション
 */
(()=>{
  // 印刷ボタン
  const printBtn = document.getElementById("printGuideBtn");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // 印刷時はFAQと補足の折りたたみをすべて開く（閉じたdetailsは印刷されないため）
  let reclose = [];
  window.addEventListener("beforeprint", () => {
    reclose = [...document.querySelectorAll("details:not([open])")];
    for (const item of reclose) item.open = true;
  });
  window.addEventListener("afterprint", () => {
    for (const item of reclose) item.open = false;
    reclose = [];
  });

  // ページ内リンクでdetailsを指した場合は自動で開く
  const openTarget = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    if (target?.tagName === "DETAILS") target.open = true;
  };
  window.addEventListener("hashchange", openTarget);
  openTarget();

  // シミュレーター要素
  const typeSelect = document.getElementById("simType");
  const costInput = document.getElementById("simCost");
  const insuranceInput = document.getElementById("simInsurance");
  const targetExpenseEl = document.getElementById("resTargetExpense");
  const subsidyRateEl = document.getElementById("resSubsidyRate");
  const subsidyAmountEl = document.getElementById("resSubsidyAmount");
  const selfBurdenEl = document.getElementById("resSelfBurden");

  if (!typeSelect || !costInput || !insuranceInput) return;

  const formatYen = num => {
    return Math.floor(num).toLocaleString("ja-JP") + " 円";
  };

  const calculate = () => {
    const type = typeSelect.value;
    const cost = Math.max(0, Number(costInput.value) || 0) * 10000; // 万円単位を円へ
    const insurance = Math.max(0, Number(insuranceInput.value) || 0) * 10000;

    // 補助対象経費 = 総経費 - 保険金等
    const targetExpense = Math.max(0, cost - insurance);

    let subsidyAmount = 0;
    let rateText = "";

    if (type === "sme") {
      // 中小企業等：3/4、上限3億円
      rateText = "3/4（上限3億円）";
      subsidyAmount = Math.min(300000000, Math.floor(targetExpense * 0.75));
    } else if (type === "mid") {
      // 中堅企業：1/2、上限3億円
      rateText = "1/2（上限3億円）";
      subsidyAmount = Math.min(300000000, Math.floor(targetExpense * 0.5));
    } else if (type === "multiple_sme") {
      // 多重被災（中小）：5億円まで10/10、超える部分3/4、上限15億円
      rateText = "5億円まで10/10（超過部3/4・上限15億円）";
      if (targetExpense <= 500000000) {
        subsidyAmount = targetExpense;
      } else {
        const over = targetExpense - 500000000;
        subsidyAmount = Math.min(1500000000, 500000000 + Math.floor(over * 0.75));
      }
    } else if (type === "multiple_mid") {
      // 多重被災（中堅）：5億円まで10/10、超える部分1/2、上限15億円
      rateText = "5億円まで10/10（超過部1/2・上限15億円）";
      if (targetExpense <= 500000000) {
        subsidyAmount = targetExpense;
      } else {
        const over = targetExpense - 500000000;
        subsidyAmount = Math.min(1500000000, 500000000 + Math.floor(over * 0.5));
      }
    } else if (type === "specific_sme") {
      // 特定被災事業者（中小）：①の補助率に準ずる＝3/4、上限15億円（定額補助なし）
      rateText = "3/4（上限15億円・定額補助なし）";
      subsidyAmount = Math.min(1500000000, Math.floor(targetExpense * 0.75));
    } else if (type === "specific_mid") {
      // 特定被災事業者（中堅）：②の補助率に準ずる＝1/2、上限15億円（定額補助なし）
      rateText = "1/2（上限15億円・定額補助なし）";
      subsidyAmount = Math.min(1500000000, Math.floor(targetExpense * 0.5));
    }

    // 千円未満切り捨て（制度概要P4準拠）
    subsidyAmount = Math.floor(subsidyAmount / 1000) * 1000;

    // 実質自己負担額 = 補助対象経費 - 補助金額
    const selfBurden = Math.max(0, targetExpense - subsidyAmount);

    targetExpenseEl.textContent = formatYen(targetExpense);
    subsidyRateEl.textContent = rateText;
    subsidyAmountEl.textContent = formatYen(subsidyAmount);
    selfBurdenEl.textContent = formatYen(selfBurden);
  };

  typeSelect.addEventListener("change", calculate);
  costInput.addEventListener("input", calculate);
  insuranceInput.addEventListener("input", calculate);

  // 初期計算
  calculate();
})();
