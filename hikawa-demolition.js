(() => {
  // ---- 1. わたしは使える？ セルフチェック ----------------------------------------
  const questions = [
    {
      key: "damage",
      label: "罹災証明書の判定は？",
      options: [
        ["total", "全壊"],
        ["large", "大規模半壊"],
        ["medium", "中規模半壊"],
        ["half", "半壊"],
        ["semi", "準半壊"],
        ["partial", "一部損壊"],
        ["none", "まだ受け取っていない"]
      ]
    },
    {
      key: "ownership",
      label: "建物の所有・用途は？",
      options: [
        ["individual", "個人所有の家屋等"],
        ["business", "中小企業者の事業所等"],
        ["rental", "賃貸物件（アパート・貸家など）"],
        ["other", "その他・空き家など"]
      ]
    },
    {
      key: "plan",
      label: "解体の希望・状況は？",
      options: [
        ["kouhi", "町に解体・撤去を依頼したい（公費解体）"],
        ["jihi", "すでに自費で解体した・解体中（自費解体・費用償還）"],
        ["undecided", "まだ迷っている・検討中"]
      ]
    }
  ];

  const answers = {};

  const isEligibleDamage = d => ["total", "large", "medium", "half"].includes(d);

  const judge = () => {
    const { damage, ownership, plan } = answers;
    if (!damage || !ownership || !plan) return null;

    // まだ罹災証明を受け取っていない場合
    if (damage === "none") {
      return {
        tone: "wait",
        title: "まず罹災証明書を申請・取得してください",
        body: "公費解体・自費解体ともに、罹災証明書（または被災証明書）の提出が必須です。電話予約の際にもお手元に証明書が必要です。",
        docs: ["り災証明書 または 被災証明書"],
        notes: [
          "氷川町では全戸調査を実施しており、竜北体育センターでり災証明書を交付しています。",
          "申請予約の電話をかける前に、証明書をお手元にご準備ください。"
        ],
        link: ["hikawa-support.html#certificates", "氷川町の証明書案内を見る →"]
      };
    }

    // 対象外判定（準半壊・一部損壊）
    if (damage === "semi" || damage === "partial") {
      return {
        tone: "ng",
        title: "対象の判定に含まれていません",
        body: `氷川町の公費解体・自費解体の対象は「全壊、大規模半壊、中規模半壊又は半壊」です。${damage === "semi" ? "準半壊" : "一部損壊"}は対象外となります。`,
        notes: [
          "準半壊の場合は、住宅の「応急修理制度」（上限36万7千円）などの利用をご検討ください。",
          "建物の損壊判定に疑問がある場合は、り災証明書の再調査について氷川町税務課へご相談ください。"
        ],
        link: ["hikawa-support.html#housing", "氷川町の住まい支援制度一覧を見る →"]
      };
    }

    // 自費解体の場合
    if (plan === "jihi") {
      return {
        tone: "ok",
        title: "自費解体（費用償還）の対象になる可能性があります",
        body: "半壊以上の被災家屋等を自ら解体・撤去した費用についても、費用償還の対象となります。ただし、解体費用が町の基準を超える部分は自己負担となります。",
        docs: [
          "り災証明書 または 被災証明書",
          "本人確認書類（運転免許証、マイナンバーカード等）",
          "【重要】解体工事前・工事中・工事後の状況写真",
          "【重要】解体工事にかかる契約書、見積書、領収書",
          "【重要】廃棄物処理にかかる帳票類（計量伝票、マニフェスト伝票等）"
        ],
        notes: [
          "工事前・工事中・工事後の写真がないと償還を受けられないおそれがあります。必ず撮影・保管してください。",
          "廃棄物処理の伝票（マニフェスト等）も必ず業者から受け取り保管してください。",
          "町の費用償還基準や申請開始時期は、決定次第速やかにお知らせされます。"
        ]
      };
    }

    // 公費解体希望の場合
    if (isEligibleDamage(damage)) {
      const docs = [
        "被災家屋等の解体・撤去に係る申請書（様式第1号）",
        "本人確認書類（運転免許証・マイナンバーカード等）",
        "り災証明書 または 被災証明書",
        "被災家屋等の写真（全景写真、特定できるもの、危険な状況）",
        "建物配置図（敷地内の配置、手書き可）"
      ];
      const notes = [
        "申請の受付は完全予約制です。電話でお手元にり災証明書を準備して予約してください。",
        "予約は「書類提出・受付の日程」であり「解体工事の実施日」ではありません。",
        "解体業者決定後の事前立会いまでに、水道休止・電気引込線撤去・エアコンガス抜き・浄化槽清掃等のライフライン切断手配が必要です。"
      ];

      if (ownership === "rental") {
        docs.push("賃借人全員の解体・撤去同意書（様式第4号）【原本】");
        notes.push("賃貸物件の場合、借家人全員の同意が必要です。複数世帯がある場合は世帯主全員分の同意書が必要です。");
      }
      if (ownership === "business") {
        notes.push("中小企業者が所有する事業所等も対象です。法人の場合は代表者印および法人の印鑑登録証明書をご準備ください。");
      }

      return {
        tone: "ok",
        title: "公費解体の対象になる可能性があります",
        body: "町が所有者に代わって、被災家屋等の解体・撤去を行います。まずは予約専用電話番号で書類提出日を予約してください。",
        docs,
        notes
      };
    }

    return null;
  };

  const qBox = document.querySelector("#demolitionQuestions");
  const rBox = document.querySelector("#demolitionResult");

  const renderCheck = () => {
    if (!qBox || !rBox) return;

    qBox.innerHTML = questions.map((q, i) => `
      <fieldset class="check-question">
        <legend><span>${i + 1}</span>${q.label}</legend>
        <div>
          ${q.options.map(([val, text]) => `
            <button type="button" data-q="${q.key}" data-v="${val}" aria-pressed="${answers[q.key] === val}">
              ${text}
            </button>
          `).join("")}
        </div>
      </fieldset>
    `).join("");

    const result = judge();
    if (!result) {
      const left = questions.filter(q => !answers[q.key]).length;
      rBox.innerHTML = `<div class="check-waiting">あと ${left} 問に答えると、判定の目安と必要書類を表示します。</div>`;
    } else {
      rBox.innerHTML = `
        <article class="check-card tone-${result.tone}">
          <header>
            <span aria-hidden="true">${result.tone === "ok" ? "○" : result.tone === "wait" ? "△" : "×"}</span>
            <div>
              <p>回答からの判定目安</p>
              <h3>${result.title}</h3>
            </div>
          </header>
          <p class="check-body">${result.body}</p>
          ${result.docs ? `
            <div class="check-docs">
              <b>ご準備いただく書類の目安</b>
              <ol>${result.docs.map(d => `<li>${d}</li>`).join("")}</ol>
            </div>
          ` : ""}
          ${result.notes ? `
            <ul class="check-notes">${result.notes.map(n => `<li>${n}</li>`).join("")}</ul>
          ` : ""}
          ${result.link ? `
            <p style="margin-top:14px;"><a class="waste-button secondary" href="${result.link[0]}">${result.link[1]}</a></p>
          ` : ""}
          <p class="check-contact">
            予約専用ダイヤル：<a href="tel:05068872407">050-6887-2407</a> / <a href="tel:05068872848">050-6887-2848</a> / <a href="tel:05068873391">050-6887-3391</a><br>
            問合せ専用ダイヤル：<a href="tel:05068774469">050-6877-4469</a>（9:00〜12:00 / 13:00〜16:00 土日祝も対応）
          </p>
        </article>
      `;
    }

    qBox.querySelectorAll("button").forEach(btn => {
      btn.onclick = () => {
        answers[btn.dataset.q] = btn.dataset.v;
        renderCheck();
      };
    });
  };

  renderCheck();

  // ---- 2. 状況別の必要書類タブ切り替え -------------------------------------------
  const situationNav = document.querySelector("#situationNav");
  const situationPanels = document.querySelectorAll(".situation-panel");

  if (situationNav && situationPanels.length > 0) {
    const buttons = situationNav.querySelectorAll("button");
    buttons.forEach(btn => {
      btn.onclick = () => {
        const targetId = btn.dataset.target;
        buttons.forEach(b => b.setAttribute("aria-selected", b === btn ? "true" : "false"));
        situationPanels.forEach(p => {
          if (p.id === targetId) {
            p.removeAttribute("hidden");
          } else {
            p.setAttribute("hidden", "hidden");
          }
        });
      };
    });
  }
})();
