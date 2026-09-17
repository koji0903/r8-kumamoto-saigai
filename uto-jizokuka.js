/**
 * 宇土市 小規模事業者持続化補助金＜災害支援枠（令和8年熊本地震）＞
 * 自社診断シミュレーター & FAQアコーディオン & 相談メモ印刷
 */

(function () {
  'use strict';

  // 診断ステート
  const state = {
    industrySize: 'commerce_small', // commerce_small, other_small, over_size
    damageType: 'direct',          // direct, indirect, none
    teigakuEligible: 'no'          // yes, no
  };

  function updateSimulator() {
    const resultContainer = document.getElementById('simResult');
    if (!resultContainer) return;

    // 1. 規模チェック
    if (state.industrySize === 'over_size') {
      resultContainer.innerHTML = `
        <div class="sim-result-header">
          <div class="sim-result-title">判定結果：持続化補助金の小規模事業者基準を超えています</div>
          <div class="sim-result-amount" style="color: #64748b;">対象外の可能性<small>（従業員基準超過）</small></div>
        </div>
        <div class="sim-result-grid">
          <div class="sim-result-card" style="grid-column: 1 / -1;">
            <h4>ご注意・別の支援策の検討</h4>
            <p>本補助金は「小規模事業者」を対象としています。従業員数が商業・サービス業（宿泊・娯楽除く）で5人、その他の業種で20人を超える場合は、小規模事業者持続化補助金の対象外となります。</p>
            <p><strong>次のステップ：</strong>中規模・中小企業向けの「なりわい再建支援補助金」など、他の災害支援制度が活用できる可能性があります。宇土市役所 商工振興係（0964-27-3328）または熊本県産業復興相談センターへご相談ください。</p>
          </div>
        </div>
      `;
      return;
    }

    // 2. 被害チェック
    if (state.damageType === 'none') {
      resultContainer.innerHTML = `
        <div class="sim-result-header">
          <div class="sim-result-title">判定結果：災害による被害が確認できません</div>
          <div class="sim-result-amount" style="color: #64748b;">対象外の可能性</div>
        </div>
        <div class="sim-result-grid">
          <div class="sim-result-card" style="grid-column: 1 / -1;">
            <h4>要件のご確認</h4>
            <p>本補助金（災害支援枠）は、令和8年熊本地震により事業用資産に損壊を受けた事業者（直接被害）、または地震に起因して売上が20%以上減少した事業者（間接被害）が対象です。</p>
            <p>通常の販路開拓等を支援する一般型の持続化補助金など、別枠の公募をご確認ください。</p>
          </div>
        </div>
      `;
      return;
    }

    // 3. 対象判定
    let maxAmount = '200万円';
    let rateText = '2/3 以内';
    let isTeigaku = false;
    let requiredProof = '';

    if (state.damageType === 'direct') {
      if (state.teigakuEligible === 'yes') {
        maxAmount = '200万円';
        rateText = '定額（10/10・自己負担なし）';
        isTeigaku = true;
      } else {
        maxAmount = '200万円';
        rateText = '2/3 以内（自己負担 1/3）';
      }
      requiredProof = '事業所や事業用資産の被害がわかる公的書類（罹災証明書・被災証明書など）';
    } else {
      // 間接被害
      maxAmount = '100万円';
      rateText = '2/3 以内（自己負担 1/3）';
      requiredProof = '令和8年7月〜9月の任意1か月の売上高が前年同期比で20%以上減少したことがわかる公的書類（セーフティネット保証4号認定書など）';
    }

    resultContainer.innerHTML = `
      <div class="sim-result-header">
        <div>
          <div class="sim-result-title">判定結果：補助金の対象となる見込みです！</div>
          <div style="font-size: 14px; color: #475569; margin-top: 4px;">
            区分：<strong>${state.damageType === 'direct' ? '［直接被害］' : '［間接被害］'}</strong>
            ${isTeigaku ? '<span style="background: #fef08a; color: #854d0e; padding: 2px 6px; border-radius: 4px; font-weight: 800; margin-left: 6px;">定額補助該当</span>' : ''}
          </div>
        </div>
        <div class="sim-result-amount">
          最大 ${maxAmount} <small>（補助率 ${rateText}）</small>
        </div>
      </div>
      <div class="sim-result-grid">
        <div class="sim-result-card">
          <h4>自治体（宇土市）で事前に取得する書類</h4>
          <ul>
            <li><strong>${requiredProof}</strong></li>
            <li>※宇土市役所（経済部・税務課・防災関連窓口）で発行申請を行ってください。</li>
          </ul>
        </div>
        <div class="sim-result-card">
          <h4>公募申請に必須の書類</h4>
          <ul>
            <li>応募対象者確認シート</li>
            <li>様式1（交付申請書）</li>
            <li>様式2（経営計画書）※自ら策定</li>
            <li><strong>様式3（支援機関確認書）※商工会で発行（締切：10月9日）</strong></li>
            <li>様式4（誓約書）</li>
            ${isTeigaku ? '<li>様式6（新型コロナ影響売上減少確認書）</li><li>様式7（売上高要件確認書）</li>' : ''}
          </ul>
        </div>
        <div class="sim-result-card" style="grid-column: 1 / -1; background: #fffbeb; border-color: #fcd34d;">
          <h4 style="color: #b45309;">今すぐ行うべきアクション</h4>
          <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.65; color: #78350f;">
            <li>宇土市商工会（<strong>0964-22-5555</strong>）へ事前相談の電話予約を入れる。</li>
            <li>経営計画書（様式2）の骨子を作成する（被害状況、復旧・販路開拓計画、必要な設備見積り）。</li>
            <li><strong>令和8年10月9日（金）まで</strong>に商工会窓口へ計画書を持参し、支援機関確認書（様式3）の発行を依頼する。</li>
            <li>確認書受領後、<strong>10月16日（金）まで</strong>に申請書類を提出（郵送またはJグランツ）。</li>
          </ol>
        </div>
      </div>
    `;
  }

  // ボタンイベントの初期化
  function initSimulator() {
    const buttons = document.querySelectorAll('.sim-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', function () {
        const group = this.getAttribute('data-group');
        const value = this.getAttribute('data-value');
        if (!group || !value) return;

        // グループ内のactive切り替え
        const siblingButtons = document.querySelectorAll(`.sim-btn[data-group="${group}"]`);
        siblingButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        // ステート更新
        state[group] = value;

        // 定額要件の表示切り替え（直接被害のときのみ表示）
        const teigakuSection = document.getElementById('simTeigakuGroup');
        if (teigakuSection) {
          if (state.damageType === 'direct') {
            teigakuSection.style.display = 'block';
          } else {
            teigakuSection.style.display = 'none';
            state.teigakuEligible = 'no';
          }
        }

        updateSimulator();
      });
    });

    updateSimulator();
  }

  // FAQアコーディオン
  function initFaq() {
    const questions = document.querySelectorAll('.faq-question');
    questions.forEach(q => {
      q.addEventListener('click', function () {
        const parent = this.closest('.faq-item');
        if (!parent) return;
        parent.classList.toggle('open');
      });
    });
  }

  // 印刷ボタン
  function initPrint() {
    const printBtn = document.getElementById('printGuideBtn');
    if (printBtn) {
      printBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.print();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSimulator();
    initFaq();
    initPrint();
  });
})();
