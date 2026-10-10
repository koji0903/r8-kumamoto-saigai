(() => {
  // 自治体別公費解体セルフチェック汎用スクリプト
  const config = window.DEMOLITION_CONFIG || {
    muniName: "自治体",
    portalLink: "disaster.html",
    supportHousingLink: "affected.html#housing",
    phoneText: "専用ダイヤル",
    notesDamageNone: "り災証明書の判定（半壊以上）が必須となります。証明書をお手元にご準備ください。"
  };

  const questions = [
    {
      key: "damage",
      label: "り災証明書の判定は？",
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
        ["kouhi", "自治体に解体・撤去を依頼したい（公費解体）"],
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

    if (damage === "none") {
      return {
        tone: "wait",
        title: "まずり災証明書を申請・取得してください",
        body: `公費解体・自費解体ともに、り災証明書の提出が必須です。受付時にもお手元に証明書が必要です。`,
        docs: ["り災証明書（半壊以上）"],
        notes: [
          config.notesDamageNone || "り災証明書の交付窓口で証明書をお受け取りください。",
          "申請・予約の前に証明書をお手元にご準備ください。"
        ],
        link: [config.portalLink, `${config.muniName}の支援情報を見る →`]
      };
    }

    if (damage === "semi" || damage === "partial") {
      return {
        tone: "ng",
        title: "公費解体の対象判定に含まれていません",
        body: `${config.muniName}の公費解体・自費解体の対象は「全壊、大規模半壊、中規模半壊、半壊」です。${damage === "semi" ? "準半壊" : "一部損壊"}は対象外となります。`,
        notes: [
          "準半壊の場合は、住宅の「応急修理制度」などの利用をご検討ください。",
          "建物の損壊状況に納得がいかない場合は、り災証明書の再調査（2次調査）申請について自治体窓口へご相談ください。"
        ],
        link: [config.supportHousingLink || "affected.html#housing", "住まいの支援制度一覧を見る →"]
      };
    }

    if (plan === "jihi") {
      return {
        tone: "ok",
        title: "自費解体（費用償還）の対象になる可能性があります",
        body: "半壊以上の被災家屋等を自ら解体・撤去した費用についても、費用償還の対象となります。ただし、自治体の基準（熊本県標準単価上限）を超える部分は全額自己負担となります。",
        docs: [
          "解体工事請負契約書",
          "工事内訳がわかる見積書原本",
          "支払いを証明する領収書原本",
          "工事前・工事中・工事後の写真（必須）",
          "産業廃棄物管理票（マニフェスト）等の処分証明書"
        ],
        notes: [
          "自治体ごとの契約締切日および申請締切日を必ずご確認ください。",
          "自治体の事前届出・事前相談が必須となっている場合があります。着工前に窓口へ確認してください。"
        ],
        link: ["#demolition-self", "自費解体の注意点と必要書類を見る →"]
      };
    }

    // 公費解体
    const docs = [
      "公費解体申請書",
      "り災証明書（全壊・大規模半壊・中規模半壊・半壊）",
      "登記事項証明書（登記簿謄本）または固定資産税課税台帳登録事項証明書",
      "身分証明書の写し（運転免許証、マイナンバーカード等）",
      "被災家屋等の全景写真および配置図"
    ];

    if (ownership === "rental") {
      docs.push("借家人・居住者の同意書");
    }
    if (ownership === "business") {
      docs.push("中小企業者であることを証明する書類（確定申告書写し等）");
    }

    return {
      tone: "ok",
      title: "公費解体の対象要件を満たしています",
      body: `${config.muniName}による全額負担での公費解体・撤去の対象となる可能性が高いです。所有者・共有者・抵当権者全員の同意書等をご準備のうえ、受付窓口へ申請してください。`,
      docs,
      notes: [
        "解体工事の実施順序は申請順ではなく、危険度や周辺への二次被害リスク、現場調整等により決定されます。",
        "業者決定後の事前立会いまでに、電気・ガス・水道休止、浄化槽清掃等の手配が必要です。"
      ],
      link: ["#demolition-docs", "申請に必要な書類を確認する →"]
    };
  };

  const renderQuestions = () => {
    const container = document.getElementById("demolitionQuestions");
    if (!container) return;

    container.innerHTML = questions.map((q, qIdx) => `
      <fieldset class="check-question">
        <legend><span>${qIdx + 1}</span>${q.label}</legend>
        <div>
          ${q.options.map(([val, label]) => `
            <button type="button" data-key="${q.key}" data-val="${val}" aria-pressed="${answers[q.key] === val}">
              ${label}
            </button>
          `).join("")}
        </div>
      </fieldset>
    `).join("");

    container.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-key");
        const val = btn.getAttribute("data-val");
        answers[key] = val;
        renderQuestions();
        renderResult();
      });
    });
  };

  const renderResult = () => {
    const resultContainer = document.getElementById("demolitionResult");
    if (!resultContainer) return;

    const res = judge();
    if (!res) {
      resultContainer.innerHTML = `
        <div class="result-placeholder">
          <p>上の3つの質問をすべて選択すると、判定結果とご準備いただく書類がここに表示されます。</p>
        </div>
      `;
      return;
    }

    resultContainer.innerHTML = `
      <div class="result-card result-${res.tone}">
        <div class="result-header">
          <span class="result-badge">${res.tone === "ok" ? "対象見込み" : res.tone === "wait" ? "要確認" : "対象外"}</span>
          <h3>${res.title}</h3>
        </div>
        <p class="result-body">${res.body}</p>
        
        ${res.docs && res.docs.length ? `
          <div class="result-docs">
            <h4>ご準備いただく主な書類：</h4>
            <ul>
              ${res.docs.map(d => `<li>${d}</li>`).join("")}
            </ul>
          </div>
        ` : ""}

        ${res.notes && res.notes.length ? `
          <div class="result-notes">
            <h4>ご注意点：</h4>
            <ul>
              ${res.notes.map(n => `<li>${n}</li>`).join("")}
            </ul>
          </div>
        ` : ""}

        ${res.link ? `
          <div class="result-action">
            <a class="waste-button primary" href="${res.link[0]}">${res.link[1]}</a>
          </div>
        ` : ""}
      </div>
    `;
  };

  // タブ切り替えロジック
  const setupTabs = () => {
    const nav = document.getElementById("situationNav");
    if (!nav) return;
    const buttons = nav.querySelectorAll(".situation-btn");
    const panels = document.querySelectorAll(".situation-panel");

    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        buttons.forEach(b => b.setAttribute("aria-selected", b === btn ? "true" : "false"));
        panels.forEach(p => {
          if (p.id === targetId) {
            p.removeAttribute("hidden");
          } else {
            p.setAttribute("hidden", "");
          }
        });
      });
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderQuestions();
    renderResult();
    setupTabs();
  });
})();
