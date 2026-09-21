// yatsushiro-living-support.js - 八代市 暮らしの支援・補助金総合ガイド 検索・条件シミュレーター制御
(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // 要素参照
    const searchInput = document.getElementById('utoSupSearch');
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

    // カードフィルタリング実行
    function filterCards() {
      const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
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
          const textMatch = (!query || cardText.includes(query));

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

    // 初期実行
    filterCards();
  });
})();
