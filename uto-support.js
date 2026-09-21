// uto-support.js - 宇土市 暮らしの支援・補助金総合ガイド 検索・フィルタリング制御
(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('utoSupSearch');
    const catButtons = document.querySelectorAll('.uto-sup-cat-btn');
    const sections = document.querySelectorAll('.uto-sup-section');
    const cards = document.querySelectorAll('.uto-card');
    const countDisplay = document.getElementById('utoSupCount');
    const emptyNotice = document.getElementById('utoSupEmpty');

    let activeCategory = 'all';

    function filterCards() {
      const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
      let visibleCount = 0;

      sections.forEach(section => {
        const secCat = section.getAttribute('data-cat');
        const secCards = section.querySelectorAll('.uto-card');
        let secVisibleCount = 0;

        // カテゴリ一致判定
        const catMatch = (activeCategory === 'all' || secCat === activeCategory);

        secCards.forEach(card => {
          const cardText = card.textContent.toLowerCase();
          const textMatch = (!query || cardText.includes(query));

          if (catMatch && textMatch) {
            card.style.display = '';
            secVisibleCount++;
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });

        // セクション内のカードが0件ならセクション自体を非表示
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

      if (countDisplay) {
        countDisplay.textContent = `表示中：${visibleCount}件 / 全${cards.length}制度`;
      }

      if (emptyNotice) {
        emptyNotice.style.display = visibleCount === 0 ? 'block' : 'none';
      }
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
