// uto-support.js - 宇土市 暮らしの支援・補助金総合ガイド 検索・条件シミュレーター制御
(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // 要素参照
    const searchInput = document.getElementById('utoSupSearch');
    const searchClearBtn = document.getElementById('utoSupSearchClear');
    const quickTagChips = document.querySelectorAll('.quick-tag-chip');
    const catButtons = document.querySelectorAll('.uto-sup-cat-btn');
    const presetButtons = document.querySelectorAll('.uto-sim-preset-btn');
    const resetBtn = document.getElementById('utoSimResetBtn');
    const simDetails = document.getElementById('utoSimDetails');
    const simToggleText = document.querySelector('.uto-sim-summary-toggle .toggle-text');
    const activeBar = document.getElementById('utoSimActiveBar');
    const activeTagsContainer = document.getElementById('utoSimActiveTags');
    const simResultCount = document.getElementById('utoSimResultCount');
    const simScrollBtn = document.getElementById('utoSimScrollBtn');
    const simClearBtn = document.getElementById('utoSimClearBtn');
    const filterCheckboxes = document.querySelectorAll('.uto-filter-chips input[type="checkbox"]');

    const sections = document.querySelectorAll('.uto-sup-section');
    const cards = document.querySelectorAll('.uto-card');
    const countDisplay = document.getElementById('utoSupCount');
    const emptyNotice = document.getElementById('utoSupEmpty');

    let activeCategory = 'all';
    let currentPreset = null;

    // 市民目線の同義語・ひらがな検索辞書
    const SYNONYMS = {
      'やね': ['屋根', '応急修理', 'リフォーム', '住まい'],
      'あまもり': ['屋根', '応急修理', 'リフォーム'],
      'かいたい': ['解体', '公費解体', '自費解体', '空家', '空き家'],
      'こども': ['子ども', '児童', '就学', '保育', '乳幼児', '小中高'],
      'いりょうひ': ['医療費', '助成', '給付'],
      'ほいく': ['保育', '認定こども園', '幼稚園', '副食費'],
      'かいご': ['介護', '在宅', '高齢者', '緊急通報', '配食'],
      'ほじょきん': ['補助金', '助成', '支援金'],
      'めんじょ': ['減免', '猶予', '免除'],
      'げんめん': ['減免', '猶予', '免除'],
      'きゅうふ': ['給付', '手当', '支援金'],
      'じぎょう': ['事業者', '商工', '小規模', '創業', '農業', '持続化'],
      'かせつ': ['仮設', '応急住宅', 'みなし仮設', '住まい'],
      'すいどう': ['水道', '下水道', '給水', '浄化槽'],
      'たいしん': ['耐震', '木造', '改修', 'シェルター'],
      'しょうひんけん': ['商品券', 'リフォーム', '助成']
    };

    // フィルタ定義名マッピング（適用中タグ表示用）
    const labelMap = {
      // life
      child_infant: '乳幼児（0〜5歳）',
      child_school: '小中高生（6〜18歳）',
      newlywed: '新婚・若者夫婦',
      working: '現役・勤労世代',
      senior: 'シニア（65歳以上）',
      // family
      childcare: '子育て世帯',
      single_parent: 'ひとり親世帯',
      senior_only: '高齢者のみ世帯',
      disability: '障がい・介護認定',
      // housing
      owned_wood: '持ち家（木造）',
      rental: '借家・賃貸',
      septic: '浄化槽使用',
      vacant: '空き家所有・解体',
      // income
      no_limit: '所得制限なし',
      low_income: '非課税・低所得',
      // disaster
      damage_heavy: '全壊〜中規模半壊',
      damage_half: '半壊（解体含む）',
      damage_partial: '一部損壊（準半壊）',
      none: '被害なし（平時）',
      // work
      employee: '会社員・一般',
      business: '自営業・中小企業',
      agri: '農林水産業',
      startup: '新規創業・起業'
    };

    // プリセット定義
    const presets = {
      childcare: {
        life: ['child_infant', 'child_school'],
        family: ['childcare']
      },
      senior: {
        life: ['senior'],
        family: ['senior_only', 'disability']
      },
      housing: {
        housing: ['owned_wood']
      },
      newlywed: {
        life: ['newlywed'],
        income: ['no_limit']
      },
      disaster: {
        disaster: ['damage_heavy', 'damage_half', 'damage_partial']
      },
      business: {
        work: ['business', 'startup', 'agri']
      }
    };

    // 選択中のフィルタを取得
    function getActiveFilters() {
      const filters = {
        life: [],
        family: [],
        housing: [],
        income: [],
        disaster: [],
        work: []
      };

      filterCheckboxes.forEach(cb => {
        if (cb.checked) {
          const name = cb.name.replace('sim', '').toLowerCase();
          if (filters[name]) {
            filters[name].push(cb.value);
          }
        }
      });

      return filters;
    }

    // カードの属性とフィルタが一致するか判定
    function checkFacetMatch(cardAttr, selectedValues) {
      if (!selectedValues || selectedValues.length === 0) return true;
      if (!cardAttr) return false;

      const attrs = cardAttr.split(',').map(s => s.trim());
      if (attrs.includes('all') || attrs.includes('general')) return true;

      return selectedValues.some(val => attrs.includes(val));
    }

    // カードの検索一致判定（通常一致＋同義語・ひらがな柔軟検索）
    function matchesQuery(cardText, query) {
      if (!query) return true;
      const q = query.trim().toLowerCase();
      if (!q) return true;

      // 複数語スペース区切り（AND検索）対応
      const terms = q.split(/\s+/).filter(Boolean);
      return terms.every(term => {
        if (cardText.includes(term)) return true;
        // 同義語チェック
        for (const [key, synonyms] of Object.entries(SYNONYMS)) {
          if (term.includes(key) || key.includes(term)) {
            if (synonyms.some(s => cardText.includes(s.toLowerCase()))) return true;
          }
        }
        return false;
      });
    }

    // カードフィルタリング実行
    function filterCards() {
      const query = (searchInput ? searchInput.value : '').trim().toLowerCase();

      // クリアボタンの表示切り替え
      if (searchClearBtn) {
        searchClearBtn.style.display = query ? 'flex' : 'none';
      }

      // クイックタグのアクティブ状態更新
      quickTagChips.forEach(chip => {
        const chipQuery = chip.getAttribute('data-query');
        chip.classList.toggle('active', !!(query && query === chipQuery.toLowerCase()));
      });

      const filters = getActiveFilters();
      const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

      let visibleCount = 0;

      sections.forEach(section => {
        const secCat = section.getAttribute('data-cat');
        const secCards = section.querySelectorAll('.uto-card');
        let secVisibleCount = 0;

        const catMatch = (activeCategory === 'all' || secCat === activeCategory);

        secCards.forEach(card => {
          const cardText = card.textContent.toLowerCase();
          const textMatch = matchesQuery(cardText, query);

          // 各ファセットの合致判定
          const lifeMatch = checkFacetMatch(card.getAttribute('data-life'), filters.life);
          const familyMatch = checkFacetMatch(card.getAttribute('data-family'), filters.family);
          const housingMatch = checkFacetMatch(card.getAttribute('data-housing'), filters.housing);
          const incomeMatch = checkFacetMatch(card.getAttribute('data-income'), filters.income);
          const disasterMatch = checkFacetMatch(card.getAttribute('data-disaster'), filters.disaster);
          const workMatch = checkFacetMatch(card.getAttribute('data-work'), filters.work);

          const facetMatch = lifeMatch && familyMatch && housingMatch && incomeMatch && disasterMatch && workMatch;

          const matchBadge = card.querySelector('.uto-badge-match');

          if (catMatch && textMatch && facetMatch) {
            card.style.display = '';
            secVisibleCount++;
            visibleCount++;

            if (hasActiveFilters) {
              card.classList.add('matched');
              if (matchBadge) matchBadge.style.display = 'inline-flex';
            } else {
              card.classList.remove('matched');
              if (matchBadge) matchBadge.style.display = 'none';
            }
          } else {
            card.style.display = 'none';
            card.classList.remove('matched');
            if (matchBadge) matchBadge.style.display = 'none';
          }
        });

        // セクション表示制御
        if (secVisibleCount > 0) {
          section.style.display = '';
          const secCountSpan = section.querySelector('.sec-count');
          if (secCountSpan) {
            secCountSpan.textContent = `（${secVisibleCount}件）`;
          }
        } else {
          section.style.display = 'none';
        }
      });

      // サマリーバー・カウント表示更新
      if (simResultCount) {
        simResultCount.textContent = `${visibleCount}件`;
      }
      if (simScrollBtn) {
        simScrollBtn.innerHTML = `<span>👇 該当する制度を見る（${visibleCount}件）</span>`;
      }
      if (countDisplay) {
        if (hasActiveFilters || query || activeCategory !== 'all') {
          countDisplay.innerHTML = `表示中：<strong style="color:var(--uto-primary-dark); font-size:1.1rem;">${visibleCount}件</strong> / 主要${cards.length}制度 <span class="uto-badge-match" style="display:inline-flex; vertical-align:middle; margin-left:6px;">条件で絞り込み中</span>`;
        } else {
          countDisplay.textContent = `表示中：${visibleCount}件 / 主要${cards.length}制度`;
        }
      }

      // 該当なし表示
      if (emptyNotice) {
        emptyNotice.style.display = visibleCount === 0 ? 'block' : 'none';
      }

      // 適用中条件タグの更新
      updateActiveTags(filters);
    }

    // 適用中条件タグの描画
    function updateActiveTags(filters) {
      if (!activeBar || !activeTagsContainer) return;

      activeTagsContainer.innerHTML = '';
      let tagCount = 0;

      Object.entries(filters).forEach(([, values]) => {
        values.forEach(val => {
          tagCount++;
          const tag = document.createElement('span');
          tag.className = 'active-cond-tag';
          tag.innerHTML = `${labelMap[val] || val} <span class="remove-cond" aria-label="この条件を解除" role="button">×</span>`;

          tag.querySelector('.remove-cond').addEventListener('click', () => {
            const cb = document.querySelector(`.uto-filter-chips input[value="${val}"]`);
            if (cb) {
              cb.checked = false;
              // プリセットボタンの選択も解除
              clearPresetSelection();
              filterCards();
            }
          });

          activeTagsContainer.appendChild(tag);
        });
      });

      activeBar.style.display = tagCount > 0 ? 'flex' : 'none';
    }

    // プリセット選択の解除
    function clearPresetSelection() {
      currentPreset = null;
      presetButtons.forEach(b => b.classList.remove('active'));
    }

    // 全条件リセット
    function resetAll() {
      clearPresetSelection();
      filterCheckboxes.forEach(cb => { cb.checked = false; });
      if (searchInput) searchInput.value = '';
      activeCategory = 'all';
      catButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-target-cat') === 'all');
      });
      if (simDetails) {
        simDetails.open = false;
      }
      filterCards();
    }

    // 詳細条件アコーディオンのトグル開閉テキスト制御
    if (simDetails && simToggleText) {
      simDetails.addEventListener('toggle', () => {
        simToggleText.textContent = simDetails.open ? '条件を閉じる' : '条件を開く';
      });
    }

    // 結果一覧へのスムーズスクロール
    if (simScrollBtn) {
      simScrollBtn.addEventListener('click', () => {
        const target = document.querySelector('.uto-card:not([style*="display: none"])') || document.querySelector('.uto-sup-toolbar');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // 全解除ボタン
    if (simClearBtn) {
      simClearBtn.addEventListener('click', resetAll);
    }

    // プリセットボタンのクリックイベント
    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.getAttribute('data-preset');

        if (currentPreset === presetKey) {
          // すでに選ばれているプリセットを再クリックした場合は解除
          resetAll();
          return;
        }

        // 一旦全チェック解除
        filterCheckboxes.forEach(cb => { cb.checked = false; });
        presetButtons.forEach(b => b.classList.remove('active'));

        btn.classList.add('active');
        currentPreset = presetKey;

        // プリセットの定義をチェックボックスに反映
        const conf = presets[presetKey];
        if (conf) {
          Object.entries(conf).forEach(([, values]) => {
            values.forEach(val => {
              const cb = document.querySelector(`.uto-filter-chips input[value="${val}"]`);
              if (cb) cb.checked = true;
            });
          });
        }

        filterCards();
      });
    });

    // チェックボックス変更イベント
    filterCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        clearPresetSelection();
        filterCards();
      });
    });

    // リセットボタン
    if (resetBtn) {
      resetBtn.addEventListener('click', resetAll);
    }

    // カテゴリボタンのイベント
    catButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        catButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-target-cat') || 'all';
        filterCards();
      });
    });

    // 検索入力のイベント
    if (searchInput) {
      searchInput.addEventListener('input', filterCards);
    }

    // 検索クリアボタン
    if (searchClearBtn && searchInput) {
      searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        filterCards();
      });
    }

    // クイックタグ（お困りごとワンタップ検索）
    quickTagChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        if (!searchInput) return;

        if (searchInput.value === query) {
          // すでに同じタグが選ばれている場合は解除
          searchInput.value = '';
        } else {
          searchInput.value = query;
        }
        filterCards();

        // 該当結果位置へスムーズスクロール
        const firstVisibleCard = document.querySelector('.uto-card:not([style*="display: none"])');
        if (firstVisibleCard) {
          firstVisibleCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });

    // 初期実行
    filterCards();
  });
})();
