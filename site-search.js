(() => {
  "use strict";

  const button = document.querySelector("[data-site-search-open]");
  if (!button) return;

  // 類語・同義語辞書
  const synonymGroups = [
    // 目的・意図
    ["支援", "公的支援", "どんな支援", "支援制度", "生活支援", "被災者支援", "助成", "補助", "給付", "手当"],
    ["現在の状況", "災害の現在の状況", "被害の現在の状況", "いまの状況", "被災状況", "被害状況", "被害", "現状", "地震の状況", "日々の動き"],
    ["支援状況", "支援の状況", "活動状況", "ボランティア状況", "支援活動"],
    ["お金", "生活費", "支払い", "支援金", "給付金", "貸付", "融資", "無利子", "義援金", "配分", "弔慰金", "見舞金"],
    // 住まい・家
    ["家", "住宅", "住まい", "住居", "建物", "家屋", "自宅", "マイホーム"],
    ["修理", "修繕", "直す", "なおす", "応急修理", "公費修理", "住宅修理", "屋根修理", "雨漏り", "ブルーシート"],
    ["解体", "公費解体", "自費解体", "取り壊し", "壊す", "全壊解体", "半壊解体", "公費撤去"],
    ["仮設", "仮設住宅", "応急仮設", "建設型仮設", "みなし仮設", "賃貸型応急住宅", "自宅敷地内仮設", "トレーラーハウス"],
    ["井戸", "浅井戸", "深井戸", "井戸修理", "井戸ポンプ", "ポンプ修理", "水質検査"],
    ["家屋修復", "カビ", "換気", "古民家", "再生", "たてもの修復"],
    // 証明・手続き
    ["罹災証明", "り災証明", "りさい証明", "罹災証明書", "り災", "りさい", "被害認定", "一次調査", "二次調査"],
    ["税", "税金", "市税", "住民税", "固定資産税", "減免", "免除", "猶予", "国民健康保険", "国保", "介護保険料"],
    ["被災者生活再建支援金", "生活再建支援金", "基礎支援金", "加算支援金", "支援金"],
    ["災害援護資金", "援護資金", "特別貸付", "緊急小口資金", "小口資金"],
    ["持続化補助金", "小規模事業者持続化補助金", "災害支援枠", "再出発", "事業者再出発", "セーフティネット", "事業復活", "中小企業"],
    // 被害・避難生活
    ["避難所", "避難場所", "避難", "ひなん", "開設", "アリーナ", "トヨオカ", "避難生活"],
    ["水", "水道", "断水", "給水", "飲用水", "生活用水", "給水所", "宅内配管", "受水槽"],
    ["ごみ", "ゴミ", "災害ごみ", "粗大ごみ", "仮置き場", "がれき", "片付け", "廃棄物"],
    ["車中泊", "軒先避難", "テント", "車中避難"],
    ["ペット", "犬", "猫", "ペット同行", "同行避難", "一時預かり"],
    // 記録・会議・公式
    ["火の国会議", "火の国", "ひのくにかいぎ", "議事録", "ぎじろく", "会議記録", "KVOAD"],
    ["日々の記録", "タイムライン", "経過", "日々のニュース", "歩み"],
    ["本部会議", "災害対策本部", "本部会議資料", "復旧復興本部"],
    ["公式発表", "自治体発表", "お知らせ", "最新情報", "広報", "アーカイブ"],
    ["用語集", "災害用語", "言葉の意味", "解説"],
    // 支援者・ボランティア
    ["ボランティア", "災害VC", "ボラセン", "ボラバス", "災害ボランティア", "ボランティア募集", "片付け支援"],
    ["寄付", "寄附", "募金", "義援金振込", "肥後銀行", "活動資金"],
    ["物資", "食料", "炊き出し", "フードバンク", "配給"],
    // 要配慮者・対象別
    ["高齢者", "お年寄り", "シニア", "介護", "デイサービス", "地域支え合いセンター", "支え合いセンター"],
    ["障がい", "障害", "車椅子", "要配慮", "きょうされん", "障害者センター"],
    ["子ども", "こども", "学校", "保育", "教育", "就学援助", "給食"],
    ["外国人", "がいこくじん", "多言語", "やさしい日本語", "相談会"],
    ["相談", "窓口", "電話相談", "法律相談", "弁護士", "司法書士", "行政書士", "きくみみ"],
    // 自治体
    ["八代", "八代市", "やつしろ"],
    ["宇土", "宇土市", "うと"],
    ["宇城", "宇城市", "うき"],
    ["氷川", "氷川町", "ひかわ"],
    ["熊本市", "熊本", "くまもと"]
  ];

  // 文字列正規化
  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
      .replace(/[\s　・,，.。/／_＿\-ー!?！？「」『』（）()【】\[\]]/g, "");

  const clean = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c]
    );

  // 類語展開
  const getVariants = (word) => {
    const q = normalize(word);
    if (!q) return [];
    const values = new Set([q]);
    synonymGroups.forEach((group) => {
      const words = group.map(normalize);
      if (words.some((w) => w.includes(q) || q.includes(w))) {
        words.forEach((w) => values.add(w));
      }
    });
    return [...values].filter(Boolean);
  };

  // 2-gram 類似度
  const bigrams = (val) => {
    const q = normalize(val);
    const res = [];
    for (let i = 0; i < q.length - 1; i++) res.push(q.slice(i, i + 2));
    return res;
  };

  const similarity = (left, right) => {
    if (left === right) return 1;
    const a = bigrams(left), b = bigrams(right);
    if (!a.length || !b.length) return 0;
    const pool = [...b];
    let hits = 0;
    a.forEach((pair) => {
      const idx = pool.indexOf(pair);
      if (idx >= 0) {
        hits++;
        pool.splice(idx, 1);
      }
    });
    return (2 * hits) / (a.length + b.length);
  };

  // スコア算出
  const scoreItem = (item, queryWords) => {
    const titleNorm = normalize(item.title);
    const descNorm = normalize(item.description);
    const headingsNorm = (item.headings || []).map(normalize);
    const areaNorm = normalize(item.area || "");
    const catNorm = normalize(item.category || "");

    let totalScore = 0;
    const matchedHeadings = [];

    // すべての検索単語に対するマッチング（AND検索）
    for (const rawWord of queryWords) {
      const variants = getVariants(rawWord);
      let wordBest = 0;

      for (const v of variants) {
        if (!v) continue;

        // タイトル
        if (titleNorm === v) wordBest = Math.max(wordBest, 1200);
        else if (titleNorm.startsWith(v)) wordBest = Math.max(wordBest, 950);
        else if (titleNorm.includes(v)) wordBest = Math.max(wordBest, 800);

        // 地域（エリア）
        if (areaNorm.includes(v) || v.includes(areaNorm)) {
          wordBest = Math.max(wordBest, 750);
        }

        // 見出し
        item.headings?.forEach((h, idx) => {
          const hn = headingsNorm[idx];
          if (hn === v) {
            wordBest = Math.max(wordBest, 720);
            if (!matchedHeadings.includes(h)) matchedHeadings.push(h);
          } else if (hn.includes(v) || v.includes(hn)) {
            wordBest = Math.max(wordBest, 600);
            if (!matchedHeadings.includes(h)) matchedHeadings.push(h);
          }
        });

        // カテゴリ
        if (catNorm.includes(v)) wordBest = Math.max(wordBest, 500);

        // 説明文
        if (descNorm.includes(v)) wordBest = Math.max(wordBest, 450);

        // ファジー類似度
        if (v.length >= 3) {
          const simTitle = similarity(v, titleNorm);
          if (simTitle >= 0.7) wordBest = Math.max(wordBest, Math.round(500 * simTitle));
        }
      }

      // いずれのバリエーションにも引っかからなかった単語があれば 0 点（AND一致）
      if (wordBest === 0) return { score: 0, matchedHeadings: [] };
      totalScore += wordBest;
    }

    // 優先度（priority）加点
    if (item.priority) {
      totalScore += item.priority * 1.5;
    }

    return { score: totalScore, matchedHeadings: matchedHeadings.slice(0, 2) };
  };

  // インデックスの遅延ロード
  let indexPromise;
  const loadIndex = () =>
    (indexPromise ||= fetch("public-data/site-search-index.json", { credentials: "same-origin" }).then((res) =>
      res.ok ? res.json() : Promise.reject(new Error("index load error"))
    ));

  // モーダルHTML挿入
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="site-search-layer" data-site-search-layer hidden>
      <div class="site-search-backdrop" data-site-search-close></div>
      <section class="site-search-dialog" role="dialog" aria-modal="true" aria-labelledby="site-search-title">
        <header>
          <div class="site-search-header-titles">
            <span class="site-search-kicker">熊本の支援・災害情報 総合検索</span>
            <h2 id="site-search-title">知りたい情報を探す</h2>
          </div>
          <button type="button" data-site-search-close aria-label="検索を閉じる">×</button>
        </header>

        <label for="site-search-input" class="site-search-label">キーワード・目的・お住まいの地域を入力してください</label>
        <div class="site-search-input-box">
          <span class="site-search-icon" aria-hidden="true">⌕</span>
          <input
            id="site-search-input"
            type="search"
            maxlength="60"
            autocomplete="off"
            spellcheck="false"
            placeholder="例：八代 井戸、応急修理、公費解体、支援金、避難所の今、ボランティア"
          />
          <button type="button" data-site-search-clear aria-label="入力を消す">消す</button>
        </div>

        <div class="site-search-filter-tabs" data-site-search-tabs role="tablist" aria-label="目的別絞り込み">
          <button type="button" role="tab" class="is-active" data-cat="all">すべて</button>
          <button type="button" role="tab" data-cat="支援制度・お金">支援金・制度</button>
          <button type="button" role="tab" data-cat="住まい・解体">住まい・解体</button>
          <button type="button" role="tab" data-cat="被害・避難所">被害・避難所</button>
          <button type="button" role="tab" data-cat="日々の記録・会議">日々の記録・会議</button>
          <button type="button" role="tab" data-cat="支援活動・VC">ボランティア</button>
          <button type="button" role="tab" data-cat="地域特設">自治体特設</button>
        </div>

        <div class="site-search-status" data-site-search-status aria-live="polite"></div>

        <div class="site-search-default-guide" data-site-search-default>
          <div class="site-search-chips-section">
            <p class="site-search-section-title">よく検索されているキーワード（タップですぐ検索）</p>
            <div class="site-search-chips">
              <button type="button" data-search-chip="り災証明書">り災証明書</button>
              <button type="button" data-search-chip="家の公費修理">家の公費修理</button>
              <button type="button" data-search-chip="公費解体">公費解体</button>
              <button type="button" data-search-chip="仮設住宅">仮設住宅</button>
              <button type="button" data-search-chip="八代 井戸修理">八代 井戸修理</button>
              <button type="button" data-search-chip="被災者生活再建支援金">被災者生活再建支援金</button>
              <button type="button" data-search-chip="災害援護資金">災害援護資金（貸付）</button>
              <button type="button" data-search-chip="税金減免">税金・保険料減免</button>
              <button type="button" data-search-chip="避難所">避難所の開設状況</button>
              <button type="button" data-search-chip="断水 給水">断水・給水状況</button>
              <button type="button" data-search-chip="ボランティア">災害ボランティア募集</button>
              <button type="button" data-search-chip="日々の記録">日々の状況まとめ</button>
              <button type="button" data-search-chip="火の国会議">火の国会議 議事録</button>
              <button type="button" data-search-chip="八代市">八代市の支援</button>
              <button type="button" data-search-chip="宇土市">宇土市の支援</button>
              <button type="button" data-search-chip="宇城市">宇城市の支援</button>
              <button type="button" data-search-chip="氷川町">氷川町の支援</button>
            </div>
          </div>

          <div class="site-search-intent-cards">
            <p class="site-search-section-title">目的から代表的なページを開く</p>
            <div class="site-search-cards-grid">
              <a href="municipality-support-compare.html" class="site-search-card">
                <span class="site-search-card-cat cat-money">支援制度・お金</span>
                <b>公的支援制度を自治体別に比較する</b>
                <small>八代・宇土・宇城・氷川など21市町村の制度一覧と最大支給額・条件を一括比較</small>
              </a>
              <a href="affected.html" class="site-search-card">
                <span class="site-search-card-cat cat-money">被災された方へ</span>
                <b>困りごと別 生活再建ナビ</b>
                <small>住まい、証明書、生活資金、健康・医療など、直面する困りごとから即座に確認</small>
              </a>
              <a href="demolition.html" class="site-search-card">
                <span class="site-search-card-cat cat-house">住まい・解体</span>
                <b>公費解体・自費解体（費用償還）ガイド</b>
                <small>倒壊家屋の公費撤去の要件、写真の撮り方、申請手順を市町村別に解説</small>
              </a>
              <a href="shelters.html" class="site-search-card">
                <span class="site-search-card-cat cat-shelter">被害・避難所</span>
                <b>開設中の避難所と支援の現在状況</b>
                <small>県内各市町村で開設されている避難所一覧、設備、ペット同行、集約状況</small>
              </a>
              <a href="timeline.html" class="site-search-card">
                <span class="site-search-card-cat cat-record">日々の記録</span>
                <b>日々の記録（発災からの歩みと最新動向）</b>
                <small>被害統計、ライフライン復旧推移、支援団体の動きを日次でたどる総合年表</small>
              </a>
              <a href="meetings.html" class="site-search-card">
                <span class="site-search-card-cat cat-record">火の国会議</span>
                <b>火の国会議 構造化議事録</b>
                <small>官民・支援団体による現地情報共有会議の全記録・課題・原本PDFアーカイブ</small>
              </a>
              <a href="volunteer-centers.html" class="site-search-card">
                <span class="site-search-card-cat cat-vc">支援する方</span>
                <b>各地の災害ボランティアセンター稼働状況</b>
                <small>募集要件、ボランティアバス、受付状況、地域支え合いセンターへの移行</small>
              </a>
              <a href="sitemap.html" class="site-search-card">
                <span class="site-search-card-cat cat-guide">総合サイトマップ</span>
                <b>全70ページ以上の支援情報一覧</b>
                <small>サイト内に掲載されたすべての特設ガイド・公的資料・市町別ページを一覧</small>
              </a>
            </div>
          </div>
        </div>

        <div class="site-search-results" data-site-search-results hidden></div>

        <p class="site-search-privacy">※ 入力した言葉は外部へ送信・保存されません。個人情報（氏名・住所・電話番号など）は入力しないでください。</p>
      </section>
    </div>`
  );

  const layer = document.querySelector("[data-site-search-layer]");
  const input = layer.querySelector("input");
  const status = layer.querySelector("[data-site-search-status]");
  const results = layer.querySelector("[data-site-search-results]");
  const defaultGuide = layer.querySelector("[data-site-search-default]");
  const tabButtons = layer.querySelectorAll("[data-site-search-tabs] button");

  let previousFocus = button;
  let timer = 0;
  let composing = false;
  let currentCategory = "all";

  const closeDialog = () => {
    layer.hidden = true;
    document.body.classList.remove("site-search-open");
    button.setAttribute("aria-expanded", "false");
    previousFocus?.focus();
  };

  const getCategoryClass = (cat) => {
    if (cat.includes("お金") || cat.includes("制度")) return "cat-money";
    if (cat.includes("住まい") || cat.includes("解体")) return "cat-house";
    if (cat.includes("被害") || cat.includes("避難")) return "cat-shelter";
    if (cat.includes("記録") || cat.includes("会議")) return "cat-record";
    if (cat.includes("VC") || cat.includes("支援活動")) return "cat-vc";
    return "cat-guide";
  };

  // 検索実行
  const runSearch = async () => {
    const rawVal = input.value.trim().slice(0, 60);
    if (!rawVal) {
      status.textContent = "";
      results.hidden = true;
      defaultGuide.hidden = false;
      return;
    }

    // クエリの前処理：助詞・語尾（「〜があるのか」「〜はどうなっている」「〜について」等）のトリミング
    const cleanWord = (w) =>
      w
        .replace(/(があるのか|がありますか|はどうですか|はどうすればいい|について|とは|を調べる|を探す|はどうなっていますか|はどうなっている|はどう|はどうしたら)$/g, "")
        .replace(/(のか|ですか|ますか|について|とは|はどう|は|が|の)$/g, "")
        .trim();

    let queryWords = rawVal
      .split(/[\s　]+/)
      .map((w) => w.trim())
      .filter(Boolean);

    if (queryWords.length === 1) {
      const trimmed = cleanWord(queryWords[0]);
      if (trimmed && trimmed.length >= 2) {
        queryWords = [trimmed];
      }
    }

    defaultGuide.hidden = true;
    results.hidden = false;
    status.innerHTML = `<span class="site-search-loading">「${clean(rawVal)}」を検索しています...</span>`;

    try {
      const data = await loadIndex();
      let scored = (data.items || [])
        .map((item) => {
          const { score, matchedHeadings } = scoreItem(item, queryWords);
          return { item, score, matchedHeadings };
        })
        .filter((r) => r.score > 0);

      // カテゴリ絞り込み
      if (currentCategory !== "all") {
        if (currentCategory === "地域特設") {
          scored = scored.filter((r) => r.item.area && r.item.area !== "熊本県全域");
        } else {
          scored = scored.filter((r) => r.item.category === currentCategory);
        }
      }

      scored.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, "ja"));

      const totalMatches = scored.length;
      const displayItems = scored.slice(0, 15);

      if (!totalMatches) {
        status.innerHTML = `<span class="site-search-count">「${clean(rawVal)}」に一致するページは見つかりませんでした。</span>`;
        results.innerHTML = `
          <div class="site-search-empty-box">
            <b>お探しの情報が見つかりませんでした</b>
            <p>短い言葉や一般的な言葉（例：「八代」「井戸」「修理」「解体」「避難所」など）に変えてお試しください。</p>
            <div class="site-search-empty-suggestions">
              <span>おすすめの検索：</span>
              <button type="button" data-search-chip="支援制度">支援制度一覧</button>
              <button type="button" data-search-chip="公費修理">住宅の公費修理</button>
              <button type="button" data-search-chip="日々の記録">日々の状況</button>
              <button type="button" data-search-chip="避難所">避難所</button>
            </div>
          </div>
        `;
        return;
      }

      status.innerHTML = `<span class="site-search-count"><b>${totalMatches}件</b>の関連ページが見つかりました（${clean(rawVal)}）</span>`;

      results.innerHTML = `
        <ul class="site-search-results-list">
          ${displayItems
            .map(({ item, matchedHeadings }) => {
              const catClass = getCategoryClass(item.category);
              const areaBadge =
                item.area && item.area !== "熊本県全域"
                  ? `<span class="site-search-area-badge">${clean(item.area)}</span>`
                  : "";
              const headingsSnippet =
                matchedHeadings && matchedHeadings.length
                  ? `<div class="site-search-matched-headings"><span class="heading-lead">一致した見出し:</span> ${matchedHeadings
                      .map((h) => `<code>${clean(h)}</code>`)
                      .join(" ")}</div>`
                  : "";

              return `
                <li>
                  <a href="${clean(item.url)}" class="site-search-result-link">
                    <div class="site-search-result-meta">
                      <span class="site-search-cat-badge ${catClass}">${clean(item.category)}</span>
                      ${areaBadge}
                    </div>
                    <b class="site-search-result-title">${clean(item.title)}</b>
                    <p class="site-search-result-desc">${clean(item.description)}</p>
                    ${headingsSnippet}
                    <i class="site-search-arrow" aria-hidden="true">→</i>
                  </a>
                </li>
              `;
            })
            .join("")}
        </ul>
        ${
          totalMatches > 15
            ? `<p class="site-search-more-note">※スコア上位15件を表示しています。さらに絞り込むには市町村名（例：「八代」「宇土」）や目的を追加してください。</p>`
            : ""
        }
      `;
    } catch {
      status.textContent = "検索データを読み込めませんでした。";
      results.innerHTML =
        '<div class="site-search-empty-box"><b>ページを再読み込みして、もう一度お試しください。</b></div>';
    }
  };

  const scheduleSearch = () => {
    clearTimeout(timer);
    timer = setTimeout(runSearch, 80);
  };

  // ボタンクリックでモーダル開く
  button.addEventListener("click", () => {
    previousFocus = document.activeElement;
    layer.hidden = false;
    document.body.classList.add("site-search-open");
    button.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => input.focus());
    if (input.value.trim()) runSearch();
    else {
      status.textContent = "";
      results.hidden = true;
      defaultGuide.hidden = false;
    }
  });

  // モーダル閉じる
  layer.querySelectorAll("[data-site-search-close]").forEach((el) => el.addEventListener("click", closeDialog));

  // クリアボタン
  layer.querySelector("[data-site-search-clear]").addEventListener("click", () => {
    input.value = "";
    runSearch();
    input.focus();
  });

  // カテゴリタブ切り替え
  tabButtons.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabButtons.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      currentCategory = tab.dataset.cat || "all";
      runSearch();
    });
  });

  // チップクリックで検索ワード代入＆即実行
  layer.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-search-chip]");
    if (!chip) return;
    const query = chip.dataset.searchChip || chip.textContent;
    input.value = query;
    runSearch();
    input.focus();
  });

  // 入力イベント（IME変換対応）
  input.addEventListener("compositionstart", () => (composing = true));
  input.addEventListener("compositionend", () => {
    composing = false;
    scheduleSearch();
  });
  input.addEventListener("input", () => {
    if (!composing) scheduleSearch();
  });

  // キーボードナビゲーション
  layer.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDialog();
    if (e.key === "ArrowDown" && document.activeElement === input) {
      e.preventDefault();
      results.querySelector("a")?.focus();
    }
  });
})();
