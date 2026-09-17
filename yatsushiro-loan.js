(() => {
  "use strict";

  // 1. 診断シミュレーターの状態管理
  const state = {
    members: null,      // "1", "2", "3", "4", "5", "lost_house"
    damage: null,       // "full", "half", "furniture", "none"
    injury: null,       // "none", "injured"
    specialCircum: null // "yes", "no"
  };

  // 所得制限上限額
  const INCOME_LIMITS = {
    "1": "220万円",
    "2": "430万円",
    "3": "620万円",
    "4": "730万円",
    "5": "760万円（以降1人増すごとに+30万円）",
    "lost_house": "1,270万円（住居滅失の特例）"
  };

  const simResult = document.querySelector("#simResult");
  const specialCircumGroup = document.querySelector("#specialCircumGroup");

  // ボタンクリックのバインド
  document.querySelectorAll(".sim-options").forEach(group => {
    const field = group.dataset.field;
    group.querySelectorAll(".sim-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        group.querySelectorAll(".sim-btn").forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
        state[field] = btn.dataset.value;

        // 全壊または半壊の場合のみ特別事情（取り壊し等）の選択を表示
        if (field === "damage") {
          if (btn.dataset.value === "full" || btn.dataset.value === "half") {
            if (specialCircumGroup) specialCircumGroup.style.display = "block";
          } else {
            if (specialCircumGroup) specialCircumGroup.style.display = "none";
            state.specialCircum = "no";
          }
        }

        renderResult();
      });
    });
  });

  function calculateLoan() {
    const { members, damage, injury, specialCircum } = state;

    if (!members || !damage || !injury) {
      return null;
    }

    const isSpecial = specialCircum === "yes";
    const isInjured = injury === "injured";

    let maxAmount = 0;
    let eligible = true;
    let note = "";

    if (damage === "none" && !isInjured) {
      eligible = false;
      maxAmount = 0;
      note = "住居・家財の損害がなく、世帯主に1か月以上の負傷もない場合は、本貸付の対象となりません。";
    } else if (damage === "none" && isInjured) {
      maxAmount = 150;
      note = "家財・住居の損害はありませんが、世帯主の1か月以上の負傷療養に伴う貸付対象となります。";
    } else if (damage === "furniture") {
      maxAmount = isInjured ? 250 : 150;
      note = isInjured
        ? "家財1/3以上の損害に加え、世帯主の負傷があるため上限250万円となります。"
        : "家財1/3以上の損害に対する貸付限度額（150万円）が適用されます。";
    } else if (damage === "half") {
      if (isInjured) {
        maxAmount = isSpecial ? 350 : 270;
        note = isSpecial
          ? "住居半壊等＋世帯主負傷＋住居建て直しに伴う取り壊し等の特別事情により、上限350万円が適用されます。"
          : "住居半壊等＋世帯主負傷により、上限270万円が適用されます。";
      } else {
        maxAmount = isSpecial ? 250 : 170;
        note = isSpecial
          ? "住居半壊等＋住居建て直しに伴う取り壊し等の特別事情により、上限250万円が適用されます。"
          : "住居半壊等に対する通常の貸付限度額（170万円）が適用されます。";
      }
    } else if (damage === "full") {
      if (isInjured) {
        maxAmount = 350;
        note = "住居全壊＋世帯主負傷により、本制度の最高限度額350万円が適用されます。";
      } else {
        maxAmount = isSpecial ? 350 : 250;
        note = isSpecial
          ? "住居全壊＋住居立て直しに伴う取り壊し等の特別事情により、上限350万円が適用されます。"
          : "住居全壊に対する通常の貸付限度額（250万円）が適用されます。";
      }
    }

    return {
      eligible,
      maxAmount,
      incomeLimit: INCOME_LIMITS[members] || "基準額以下",
      isInjured,
      note
    };
  }

  function renderResult() {
    if (!simResult) return;

    const res = calculateLoan();

    if (!res) {
      simResult.innerHTML = `
        <div class="sim-result-card warning" style="text-align: center;">
          <p style="margin: 0; font-size: 15px; font-weight: 800; color: #b45309;">
            上記の設問（世帯人数、被害の程度、世帯主の負傷状況）を選択すると、貸付限度額・所得要件・必要書類が自動計算されます。
          </p>
        </div>
      `;
      return;
    }

    if (!res.eligible) {
      simResult.innerHTML = `
        <div class="sim-result-card warning">
          <div class="result-header">
            <div>
              <span class="sim-step-badge" style="background:#dc2626;">対象外の判定</span>
              <h3 style="margin: 8px 0 0; font-size: 20px; color: #991b1b;">本貸付の対象要件に該当しない可能性があります</h3>
            </div>
          </div>
          <p style="margin: 14px 0 0; font-size: 14px; color: #7f1d1d; line-height: 1.6;">
            ${res.note}
          </p>
          <div style="margin-top: 16px; padding: 12px 16px; background: #fff; border-radius: 8px; font-size: 13px;">
            ※その他の被災者支援制度（被災者生活再建支援金や社会福祉協議会の特例貸付等）が利用できる場合があります。八代市健康福祉政策課（0965-33-4003）までご相談ください。
          </div>
        </div>
      `;
      return;
    }

    simResult.innerHTML = `
      <div class="sim-result-card success" role="region" aria-live="polite">
        <div class="result-header">
          <div>
            <span class="sim-step-badge" style="background:#2563eb;">診断結果</span>
            <h3 style="margin: 6px 0 0; font-size: 19px; color: var(--l-ink);">あなたの世帯の貸付限度額・条件</h3>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 12px; font-weight: 800; color: var(--l-muted);">貸付限度額</span>
            <div class="result-max-amount">最大 ${res.maxAmount} 万円</div>
          </div>
        </div>

        <p style="margin: 12px 0 0; font-size: 14px; color: #1e3a8a; line-height: 1.6; font-weight: 700;">
          ${res.note}
        </p>

        <div class="result-grid">
          <div class="result-item">
            <dt>市町村民税前年総所得要件</dt>
            <dd>${res.incomeLimit} 以下</dd>
          </div>
          <div class="result-item">
            <dt>貸付利率（利息）</dt>
            <dd>年 1.0％<br><small style="font-size: 12px; color: #059669; font-weight: 800;">★保証人を立てる場合は「全期間無利子（0％）」／据置期間中は無利子</small></dd>
          </div>
          <div class="result-item">
            <dt>据置期間・償還期間</dt>
            <dd>据置 3年（特別事情時5年）<br>償還 10年以内（据置含む）</dd>
          </div>
          <div class="result-item">
            <dt>申請期限</dt>
            <dd style="color: #dc2626;">令和8年11月2日（月）</dd>
          </div>
        </div>

        <div class="result-docs-box">
          <h4>ご用意いただく必要書類</h4>
          <ul>
            <li><strong>八代市災害援護資金借入申込書</strong>（市役所窓口または八代市HPよりダウンロード）</li>
            <li><strong>り災証明書（写し）</strong> または <strong>被災証明書（写し）</strong></li>
            <li><strong>世帯主の本人確認書類</strong>（マイナンバーカード・運転免許証等）・<strong>印鑑</strong>・<strong>預金通帳</strong></li>
            <li><strong>世帯全員の住民票謄本</strong></li>
            <li><strong>令和8年度（令和7年分）所得課税証明書</strong>（世帯員全員分）</li>
            <li><strong>完納証明書 または 課税がない証明書</strong>（現年度含む3年度分）</li>
            ${res.isInjured ? '<li><strong style="color:#b91c1c;">【負傷による申請】医師の診断書</strong>（療養見込期間1か月以上および療養費概算額の記載があるもの）</li>' : ''}
            <li><strong style="color:#1d4ed8;">【保証人を立てる場合】保証人の住民票謄本・所得課税証明書・完納証明書（3年分）</strong></li>
          </ul>
        </div>
      </div>
    `;
  }
})();
