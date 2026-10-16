/**
 * 災害関連法と支援のしくみ早わかりガイド (disaster-laws.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  // 立場別タブ切り替え
  const tabBtns = document.querySelectorAll(".p-tab-btn");
  const tabPanels = document.querySelectorAll(".p-panel");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");

      tabBtns.forEach((b) => b.classList.remove("active"));
      tabPanels.forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPanel = document.getElementById(`panel-${target}`);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }
    });
  });

  // URLハッシュによるタブ選択（例: #resident, #business, #municipality, #vc, #npo）
  const hash = window.location.hash.replace("#", "");
  if (["resident", "business", "municipality", "vc", "npo"].includes(hash)) {
    const btn = document.querySelector(`.p-tab-btn[data-target="${hash}"]`);
    if (btn) {
      btn.click();
      const container = document.getElementById("perspective-section");
      if (container) {
        container.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  // スムーズスクロール
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href.length > 1 && document.querySelector(href)) {
        e.preventDefault();
        const targetElement = document.querySelector(href);
        const headerOffset = 70;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });
});
