(()=>{
  // 1. マトリクス切り替え（複数世帯 / 単数世帯）
  const tabMultiple = document.querySelector("#tabMultiple");
  const tabSingle = document.querySelector("#tabSingle");
  const matrixMultiple = document.querySelector("#matrixMultiple");
  const matrixSingle = document.querySelector("#matrixSingle");

  if (tabMultiple && tabSingle && matrixMultiple && matrixSingle) {
    tabMultiple.addEventListener("click", () => {
      tabMultiple.classList.add("active");
      tabMultiple.setAttribute("aria-pressed", "true");
      tabSingle.classList.remove("active");
      tabSingle.setAttribute("aria-pressed", "false");
      matrixMultiple.style.display = "block";
      matrixSingle.style.display = "none";
    });

    tabSingle.addEventListener("click", () => {
      tabSingle.classList.add("active");
      tabSingle.setAttribute("aria-pressed", "true");
      tabMultiple.classList.remove("active");
      tabMultiple.setAttribute("aria-pressed", "false");
      matrixSingle.style.display = "block";
      matrixMultiple.style.display = "none";
    });
  }

  // 2. インタラクティブ診断シミュレーター
  const answers = {
    damage: null,
    members: null,
    method: null
  };

  const AMOUNTS = {
    multiple: {
      full: { base: 100, methods: { build: 200, repair: 100, rent: 50, none: 0 } },
      demolish: { base: 100, methods: { build: 200, repair: 100, rent: 50, none: 0 } },
      long: { base: 100, methods: { build: 200, repair: 100, rent: 50, none: 0 } },
      large: { base: 50, methods: { build: 200, repair: 100, rent: 50, none: 0 } },
      middle: { base: 0, methods: { build: 100, repair: 50, rent: 25, none: 0 } }
    },
    single: {
      full: { base: 75, methods: { build: 150, repair: 75, rent: 37.5, none: 0 } },
      demolish: { base: 75, methods: { build: 150, repair: 75, rent: 37.5, none: 0 } },
      long: { base: 75, methods: { build: 150, repair: 75, rent: 37.5, none: 0 } },
      large: { base: 37.5, methods: { build: 150, repair: 75, rent: 37.5, none: 0 } },
      middle: { base: 0, methods: { build: 75, repair: 37.5, rent: 18.75, none: 0 } }
    }
  };

  const METHOD_LABELS = {
    build: "建設・購入",
    repair: "補修",
    rent: "賃借（民間アパート等）",
    none: "まだ決まっていない（基礎支援金のみ）"
  };

  const DAMAGE_LABELS = {
    full: "全壊",
    demolish: "半壊／中規模半壊（やむを得ず全部解体）",
    long: "長期避難世帯",
    large: "大規模半壊",
    middle: "中規模半壊（解体しない）",
    half: "半壊（解体しない）",
    semi: "準半壊・一部損壊",
    unknown: "まだり災証明書がない／不明"
  };

  const resultBox = document.querySelector("#simResult");

  function renderResult() {
    if (!resultBox) return;

    const { damage, members, method } = answers;

    if (!damage || !members || !method) {
      const remaining = [!damage && "り災証明書の判定", !members && "世帯人数", !method && "住宅の再建方法"].filter(Boolean);
      resultBox.innerHTML = `
        <div class="sim-card tone-wait" style="border: 2px dashed #d97706; background: #fffdf5; padding: 24px; text-align: center;">
          <p style="margin:0; font-size: 16px; font-weight: 800; color: #b45309;">
            上記の選択肢（残り：${remaining.join("・")}）をお選びいただくと、支給見込額と必要な申請書類が自動表示されます。
          </p>
        </div>
      `;
      return;
    }

    // 判定による分岐
    if (damage === "unknown") {
      resultBox.innerHTML = `
        <article class="sim-card tone-wait">
          <header class="sim-card-header">
            <span class="sim-card-icon">？</span>
            <div>
              <h3>まずは「り災証明書」の交付をお待ちください</h3>
              <p>被災者生活再建支援金の申請には、市が発行するり災証明書の判定区分が必要です。</p>
            </div>
          </header>
          <div class="sim-card-body">
            <p style="font-size:15px; line-height:1.8;">
              り災証明書の「住家の被害の程度」が<strong>中規模半壊以上</strong>（または半壊でやむを得ず全部解体する場合）に支給対象となります。証明書を受け取られたら、再度判定を選んでご確認ください。
            </p>
            <div style="margin-top:16px;">
              <a class="waste-button secondary" href="yatsushiro-support.html#check">八代市のり災証明・支援制度一覧を見る →</a>
            </div>
          </div>
        </article>
      `;
      return;
    }

    if (damage === "semi") {
      resultBox.innerHTML = `
        <article class="sim-card tone-ng">
          <header class="sim-card-header">
            <span class="sim-card-icon">×</span>
            <div>
              <h3>被災者生活再建支援金の対象外です</h3>
              <p>準半壊・一部損壊の方は国の被災者生活再建支援制度の支給対象には含まれていません。</p>
            </div>
          </header>
          <div class="sim-card-body">
            <p style="font-size:15px; line-height:1.8;">
              本制度は中規模半壊以上の被害を受けた世帯が対象となります。ただし、準半壊の方には八代市の<strong>「住宅の応急修理制度（上限36.7万円）」</strong>や、屋根・雨漏り等を防ぐ<strong>「住家の緊急修理（上限5.64万円）」</strong>などの支援制度が用意されています。
            </p>
            <div style="margin-top:16px;">
              <a class="waste-button secondary" href="yatsushiro-support.html#repair">八代市の住宅応急修理・緊急修理を確認する →</a>
            </div>
          </div>
        </article>
      `;
      return;
    }

    if (damage === "half") {
      resultBox.innerHTML = `
        <article class="sim-card tone-wait">
          <header class="sim-card-header">
            <span class="sim-card-icon">！</span>
            <div>
              <h3>半壊のまま住み続ける・補修する場合は本支援金の対象外です</h3>
              <p>ただし、やむを得ず「全部解体」する場合は全壊同額の対象になります！</p>
            </div>
          </header>
          <div class="sim-card-body">
            <div style="padding:16px; border-radius:8px; background:#fff8f3; border-left:6px solid #d8552f; margin-bottom:16px;">
              <b style="color:#9a3412; font-size:16px; display:block; margin-bottom:6px;">重要：半壊解体世帯の特例</b>
              <p style="margin:0; font-size:14px; line-height:1.75;">
                り災判定が「半壊」であっても、危険防止や高額な補修費用等のやむを得ない事由により住宅を<strong>全部解体</strong>した場合は、「解体世帯」として<strong>全壊と同額（最大300万円／単身225万円）</strong>の支給対象となります。<br>
                ※一部解体は対象外です。解体工事を行う前に必ず八代市生活援護課へご相談ください。
              </p>
            </div>
            <p style="font-size:15px; line-height:1.8;">
              解体せず補修して住み続ける場合は、八代市の<strong>住宅の応急修理制度（最大75.7万円）</strong>をご活用ください。
            </p>
            <div style="margin-top:16px;">
              <a class="waste-button primary" href="#promise-title">解体前に知っておくべき3つの約束を見る ↑</a>
            </div>
          </div>
        </article>
      `;
      return;
    }

    // 対象世帯の計算
    const dataset = AMOUNTS[members][damage];
    const baseAmount = dataset.base;
    const addAmount = dataset.methods[method];
    const totalAmount = baseAmount + addAmount;

    const docs = [
      "被災者生活再建支援金支給申請書（様式）",
      "り災証明書（写し）",
      "住民票の写し（世帯全員・続柄記載） ※マイナンバー記入で省略可",
      "預金通帳の写し（被災時世帯主または同一世帯員名義） ※公金受取口座利用で省略可"
    ];

    if (damage === "demolish") {
      docs.push("解体証明書（市町村発行）または建物滅失登記簿謄本（法務局発行）");
      docs.push("敷地被害解体の場合は「敷地被害証明書類（応急危険度判定結果・修復見積等）」");
    }

    if (damage === "long") {
      docs.push("長期避難世帯証明書（八代市発行）");
    }

    if (method !== "none") {
      if (method === "build") {
        docs.push("建設工事請負契約書 または 不動産売買契約書の写し（双方署名押印、工期・引渡日記載）");
      } else if (method === "repair") {
        docs.push("工事請負契約書の写し（契約書がない場合は見積書＋領収書、注文請書＋領収書など）");
      } else if (method === "rent") {
        docs.push("建物賃貸借契約書の写し（民間アパート等。公営住宅・仮設住宅・介護施設等は対象外）");
      }
    }

    const notes = [];
    if (damage === "middle") {
      notes.push("中規模半壊は「基礎支援金」の支給はなく、「加算支援金」のみの支給となります。ただし解体した場合は半壊解体として基礎支援金も対象になります。");
    }
    if (members === "single") {
      notes.push("被災時に1人暮らし（単身世帯）だった場合、支給額は複数人世帯の4分の3となります。");
    }
    if (method === "rent") {
      notes.push("賃借で加算支援金を受給した後でも、申請期限（37か月）内に住宅を建設・購入した場合は、差額分の追加申請が可能です。");
    }
    if (method === "repair") {
      notes.push("「補修」で加算支援金を受給した場合、制度上生活再建が完了したとみなされるため、後から「建設・購入」への差額申請はできません。");
    }

    resultBox.innerHTML = `
      <article class="sim-card tone-ok">
        <header class="sim-card-header">
          <span class="sim-card-icon">○</span>
          <div>
            <h3>支給対象世帯に該当します</h3>
            <p>${DAMAGE_LABELS[damage]} ／ ${members === "multiple" ? "複数人世帯（2人以上）" : "単身世帯（1人）"} ／ 再建方法：${METHOD_LABELS[method]}</p>
          </div>
        </header>
        <div class="sim-card-body">
          <div class="sim-amount-banner">
            <div>
              <span class="amount-label">支援金支給見込額（合計）</span>
              <div style="font-size:12px; color:#7c2d12;">※指定金融機関口座へ一括または順次振込</div>
            </div>
            <strong class="amount-val">${totalAmount} <small style="font-size:0.45em;">万円</small></strong>
          </div>

          <dl class="sim-breakdown">
            <div>
              <dt>① 基礎支援金（住宅の被害程度）</dt>
              <dd>${baseAmount > 0 ? baseAmount + " 万円" : "対象外（加算のみ）"}</dd>
            </div>
            <div>
              <dt>② 加算支援金（再建方法：${METHOD_LABELS[method]}）</dt>
              <dd>${addAmount > 0 ? addAmount + " 万円" : "未定（後日申請可）"}</dd>
            </div>
          </dl>

          <div class="sim-docs-block">
            <h4>申請に必要な書類（あなたの場合）</h4>
            <ol>
              ${docs.map(doc => `<li>${doc}</li>`).join("")}
            </ol>
          </div>

          ${notes.length > 0 ? `
            <ul class="sim-notes-list">
              ${notes.map(note => `<li>※ ${note}</li>`).join("")}
            </ul>
          ` : ""}

          <div style="margin-top:20px; padding-top:16px; border-top:1px dashed #cbd5e1; font-size:14px; color:#475569;">
            <strong>申請期限：</strong>基礎支援金は発災から13か月以内、加算支援金は37か月以内です。書類受付から振込まで2〜3か月前後かかります。
          </div>
        </div>
      </article>
    `;
  }

  // ボタンイベント登録
  document.querySelectorAll(".sim-options button").forEach(btn => {
    btn.addEventListener("click", () => {
      const field = btn.getAttribute("data-field");
      const val = btn.getAttribute("data-val");

      answers[field] = val;

      const parent = btn.closest(".sim-options");
      parent.querySelectorAll("button").forEach(b => {
        b.setAttribute("aria-pressed", "false");
      });
      btn.setAttribute("aria-pressed", "true");

      renderResult();
    });
  });

  renderResult();
})();
