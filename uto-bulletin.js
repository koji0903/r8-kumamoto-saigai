// 期限までの残り日数（uto-bulletin.html）
//
// 紙面に書かれた日付から計算するだけで、日付そのものは書き換えない。
// 期限が過ぎたら「あと◯日」ではなく過ぎたことを出す。過ぎた期限を
// 残っているように見せると、間に合うと思わせてしまう。
// JavaScriptが無効でも紙面の日付は本文に書いてあるので読める。
(() => {
  "use strict";
  const items = document.querySelectorAll("[data-deadline]");
  if (!items.length) return;

  // 日付だけで比べる（時刻で1日ずれないように、日本時間の0時に揃える）
  const today = new Date();
  const startOfDay = date => Date.parse(`${date}T00:00:00+09:00`);
  const todayKey = new Date(today.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const todayStart = startOfDay(todayKey);

  for (const item of items) {
    const date = item.dataset.deadline;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const days = Math.round((startOfDay(date) - todayStart) / 86400000);
    const badge = item.querySelector("[data-deadline-badge]");
    if (!badge) continue;

    if (days > 0) {
      badge.textContent = `あと${days}日`;
      badge.className = `deadline-badge${days <= 10 ? " is-soon" : ""}`;
      badge.hidden = false;
    } else if (days === 0) {
      badge.textContent = "本日まで";
      badge.className = "deadline-badge is-today";
      badge.hidden = false;
    } else {
      badge.textContent = "期限を過ぎています";
      badge.className = "deadline-badge is-past";
      badge.hidden = false;
      item.classList.add("is-past");
      item.classList.remove("is-near");
      const note = item.querySelector("[data-deadline-note]");
      if (note) {
        note.textContent = "紙面に書かれた期限を過ぎています。延長されている場合があるため、担当課へご確認ください。";
        note.hidden = false;
      }
    }
  }

  const asOf = document.querySelector("[data-deadline-asof]");
  if (asOf) {
    asOf.textContent = `残り日数は${todayKey.replaceAll("-", "/")}時点の計算です。紙面の日付そのものは変えていません。`;
    asOf.hidden = false;
  }
})();
