/**
 * 八代市 セーフティネット保証4号（令和八年熊本地震）診断シミュレーター & UIスクリプト
 */
(function() {
  'use strict';

  function initSimulator() {
    const patternSelect = document.getElementById('simPattern');
    const recentSalesInput = document.getElementById('simRecentSales');
    const compareRecentInput = document.getElementById('simCompareRecent');
    const futureSalesInput = document.getElementById('simFutureSales');
    const compareFutureInput = document.getElementById('simCompareFuture');

    const rateRecentEl = document.getElementById('simRateRecent');
    const rate3MonthsEl = document.getElementById('simRate3Months');
    const judgeTitleEl = document.getElementById('simJudgeTitle');
    const judgeDescEl = document.getElementById('simJudgeDesc');
    const recommendFormEl = document.getElementById('simRecommendForm');

    const compareRecentLabel = document.getElementById('labelCompareRecent');
    const compareFutureLabel = document.getElementById('labelCompareFuture');

    if (!patternSelect || !recentSalesInput) return;

    // パターン選択切り替え時のラベル更新
    function updateLabels() {
      const pattern = patternSelect.value;
      if (pattern === '1') {
        compareRecentLabel.textContent = '前年同月の売上高（円）:';
        compareFutureLabel.textContent = '前年同期（その後2か月）の売上高（円）:';
      } else if (pattern === '2') {
        compareRecentLabel.textContent = '発災直前3か月の「月平均」売上高（円）:';
        compareFutureLabel.textContent = '発災直前3か月の売上高合計（円）:';
      } else if (pattern === '3') {
        compareRecentLabel.textContent = '発災後3か月の「月平均」売上高（円）:';
        compareFutureLabel.textContent = '発災後3か月の売上高合計（円）:';
      }
      calculate();
    }

    function calculate() {
      const pattern = patternSelect.value;
      const recent = parseFloat(recentSalesInput.value) || 0;
      const compRecent = parseFloat(compareRecentInput.value) || 0;
      const future = parseFloat(futureSalesInput.value) || 0;
      const compFuture = parseFloat(compareFutureInput.value) || 0;

      if (compRecent <= 0 || recent < 0) {
        rateRecentEl.textContent = '-%';
        rate3MonthsEl.textContent = '-%';
        judgeTitleEl.textContent = '売上高を入力してください';
        judgeDescEl.textContent = '最近1か月と前年（または基準期間）の売上高を入力すると、減少率と該当様式を自動判定します。';
        recommendFormEl.style.display = 'none';
        return;
      }

      // 最近1か月の減少率
      const rateRecent = ((compRecent - recent) / compRecent) * 100;
      rateRecentEl.textContent = rateRecent.toFixed(1) + '%';
      if (rateRecent >= 20) {
        rateRecentEl.style.color = '#c2410c';
      } else {
        rateRecentEl.style.color = '#475569';
      }

      // 3か月全体の減少率
      let rate3Months = 0;
      const totalActualFuture = recent + future;
      let totalComp = 0;

      if (pattern === '1') {
        totalComp = compRecent + compFuture;
      } else if (pattern === '2' || pattern === '3') {
        // パターン2, 3は compRecent(月平均) と compFuture(直前3か月合計)
        totalComp = compFuture > 0 ? compFuture : (compRecent * 3);
      }

      if (totalComp > 0 && (future > 0 || compFuture > 0)) {
        rate3Months = ((totalComp - totalActualFuture) / totalComp) * 100;
        rate3MonthsEl.textContent = rate3Months.toFixed(1) + '%';
        if (rate3Months >= 20) {
          rate3MonthsEl.style.color = '#c2410c';
        } else {
          rate3MonthsEl.style.color = '#475569';
        }
      } else {
        rate3MonthsEl.textContent = '計算待ち';
      }

      // 総合判定
      const isRecentOk = rateRecent >= 20;
      const is3MonthsOk = rate3Months >= 20;

      recommendFormEl.style.display = 'block';

      if (isRecentOk && is3MonthsOk) {
        judgeTitleEl.textContent = '🎉 要件を満たしています（セーフティネット保証4号の対象見込み）';
        judgeTitleEl.style.color = '#15803d';
        judgeDescEl.textContent = '最近1か月、およびその後2か月を含む3か月間の売上減少率がいずれも20％以上となっています。';

        if (pattern === '1') {
          recommendFormEl.innerHTML = '<b>提出様式：【様式4-①（通常）】</b><p>業歴1年以上の通常事業者様向けの申請様式です。<a href="#doc-form1">様式4-①をダウンロード ↓</a></p>';
        } else if (pattern === '2') {
          recommendFormEl.innerHTML = '<b>提出様式：【様式4-②（創業者等・発災前売上あり）】</b><p>創業後1年未満または店舗等拡大事業者様向けの申請様式です。<a href="#doc-form2">様式4-②をダウンロード ↓</a></p>';
        } else {
          recommendFormEl.innerHTML = '<b>提出様式：【様式4-③（創業者等・発災前売上なし）】</b><p>発災後に創業または売上が発生した事業者様向けの申請様式です。<a href="#doc-form3">様式4-③をダウンロード ↓</a></p>';
        }
      } else if (isRecentOk && !is3MonthsOk) {
        judgeTitleEl.textContent = '⚠️ 今後2か月の見込み売上をご確認ください';
        judgeTitleEl.style.color = '#b45309';
        judgeDescEl.textContent = '最近1か月は20%以上減少していますが、3か月合計の見込み減少率が20%に達していません。今後2か月の売上見通しを精査してください。';
        recommendFormEl.innerHTML = '<p>※制度上、「最近1か月」と「その後の2か月を含めた3か月間」の<b>両方で20％以上の減少</b>が必要です。</p>';
      } else {
        judgeTitleEl.textContent = '❌ 最近1か月の減少率が20％未満です';
        judgeTitleEl.style.color = '#dc2626';
        judgeDescEl.textContent = 'セーフティネット保証4号の認定には、最近1か月の売上高が前年同月（または基準期間）比で20％以上減少している必要があります。';
        recommendFormEl.innerHTML = '<p>※売上の集計期間（月）を変えることで該当する場合があります。また、小規模事業者持続化補助金（災害支援枠・直接被害）など他の支援制度もご検討ください。</p>';
      }
    }

    patternSelect.addEventListener('change', updateLabels);
    recentSalesInput.addEventListener('input', calculate);
    compareRecentInput.addEventListener('input', calculate);
    futureSalesInput.addEventListener('input', calculate);
    compareFutureInput.addEventListener('input', calculate);

    updateLabels();
  }

  function initPrintButton() {
    const printBtn = document.getElementById('printGuideBtn');
    if (printBtn) {
      printBtn.addEventListener('click', function() {
        window.print();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initSimulator();
      initPrintButton();
    });
  } else {
    initSimulator();
    initPrintButton();
  }
})();
