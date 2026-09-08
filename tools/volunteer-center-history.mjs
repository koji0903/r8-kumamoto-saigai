// 社協サイトの巡回は、一時的な接続失敗や一覧ページの縮小で
// 過去に取得できた記事が見えなくなることがある。検証済みの履歴を
// URL単位で保持し、今回取得分を優先して統合する。
export const mergeVolunteerCenterHistory = (previous = [], current = []) => {
  const merged = new Map(previous.map(update => [update.url, update]));
  for (const update of current) merged.set(update.url, update);
  return [...merged.values()].sort((a, b) =>
    b.date.localeCompare(a.date) || a.url.localeCompare(b.url));
};
