/**
 * priority-support-summary.js
 * 熊本市・宇土市・宇城市・氷川町・八代市 災害支援制度まとめ・比較
 */
(() => {
  "use strict";

  const MUNI_MAP = {
    "kumamoto": "熊本市",
    "uto": "宇土市",
    "uki": "宇城市",
    "hikawa": "氷川町",
    "yatsushiro": "八代市"
  };

  const REVERSE_MUNI_MAP = {
    "熊本市": "kumamoto",
    "宇土市": "uto",
    "宇城市": "uki",
    "氷川町": "hikawa",
    "八代市": "yatsushiro"
  };

  function initMuniFilter() {
    const filterButtons = document.querySelectorAll("#muniFilterButtons .filter-btn");
    const matrixTable = document.getElementById("matrixTable");
    const muniCards = document.querySelectorAll(".muni-col");

    if (!filterButtons.length || !matrixTable) return;

    function applyFilter(selectedKey) {
      // ボタンのアクティブ状態切替
      filterButtons.forEach(btn => {
        const key = btn.dataset.muni;
        if (key === selectedKey) {
          btn.classList.add("is-active");
          btn.setAttribute("aria-pressed", "true");
        } else {
          btn.classList.remove("is-active");
          btn.setAttribute("aria-pressed", "false");
        }
      });

      // マトリクステーブルの列ハイライト・減光
      const allMuniCells = matrixTable.querySelectorAll("th.col-muni, td.cell-muni");
      allMuniCells.forEach(cell => {
        cell.classList.remove("col-selected", "col-dimmed");
      });

      if (selectedKey !== "all") {
        allMuniCells.forEach(cell => {
          if (cell.classList.contains(`col-${selectedKey}`)) {
            cell.classList.add("col-selected");
          } else {
            cell.classList.add("col-dimmed");
          }
        });
      }

      // 詳細カード内の自治体ブロックのハイライト・減光
      muniCards.forEach(col => {
        col.classList.remove("is-focused", "is-dimmed");
        if (selectedKey !== "all") {
          if (col.dataset.muni === selectedKey) {
            col.classList.add("is-focused");
          } else {
            col.classList.add("is-dimmed");
          }
        }
      });
    }

    // ボタンクリックイベント
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.muni || "all";
        applyFilter(key);

        // URLパラメータ更新
        const url = new URL(window.location.href);
        if (key === "all") {
          url.searchParams.delete("muni");
        } else {
          url.searchParams.set("muni", key);
        }
        window.history.replaceState(null, "", url.toString());
      });
    });

    // 初期パラメータ判定
    const params = new URLSearchParams(window.location.search);
    const initialMuni = params.get("muni");
    if (initialMuni) {
      if (MUNI_MAP[initialMuni]) {
        applyFilter(initialMuni);
      } else if (REVERSE_MUNI_MAP[initialMuni]) {
        applyFilter(REVERSE_MUNI_MAP[initialMuni]);
      }
    }
  }

  // DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMuniFilter);
  } else {
    initMuniFilter();
  }
})();
