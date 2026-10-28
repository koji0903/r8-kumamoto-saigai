// 災害対策本部会議の一覧は追記型として扱う。
// 自治体サイトやアーカイブページの一時的な取得失敗で、過去の会議が
// 消えたように見える場合は、確認済みデータを上書きしないために使う。

export const meetingIdentity = meeting =>
  `${Number(meeting?.meeting)}:${Number(meeting?.part) || 0}`;

export const findMissingMeetingIdentities = (previousMeetings = [], fetchedMeetings = []) => {
  const fetched = new Set(fetchedMeetings.map(meetingIdentity));
  return previousMeetings
    .map(meetingIdentity)
    .filter(identity => !fetched.has(identity));
};
