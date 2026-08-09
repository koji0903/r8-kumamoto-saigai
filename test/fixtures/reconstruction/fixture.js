window.RECONSTRUCTION_FIXTURE = {
  marker: "TEST DATA / DEMO / NOT FOR PRODUCTION",
  home: {
    title: "家が壊れた",
    intro: "まず、家の状況と自治体の公式情報を確認しましょう。",
    checks: [
      "家の被害について、市町村の案内を確認しましょう。",
      "修理などを進める前に、利用できる支援がないか確認しましょう。",
      "分からないときは、一人で判断せず公式窓口へ確認しましょう。"
    ]
  },
  programs: [
    {
      id: "demo_emergency_housing_repair",
      title: "壊れた家の必要な部分を修理する支援",
      officialName: "災害救助法に基づく被災住宅の応急修理",
      summary: "住まいの修理について、支援を受けられる可能性があります。利用には条件の確認が必要です。",
      category: "home",
      availability: { state: "confirmed", label: "公式情報で確認済み", confirmed: true },
      municipalities: [
        {
          id: "municipality_uto",
          name: "宇土市",
          officialUrl: "https://www.city.uto.lg.jp/",
          statusLabel: "宇土市での申請方法を確認中",
          reception: { state: "pending", label: "現在、公式情報を確認中です", confirmed: false },
          applicationMethodLabel: "申請方法を確認中",
          contact: null,
          deadline: null,
          fallback: "最新情報は宇土市公式情報をご確認ください。相談先が確認でき次第更新します。"
        }
      ],
      nextSteps: [
        { title: "修理業者へ支払う前に相談する", description: "修理を進める前に、被災した市町村へ制度を利用できるか確認します。" },
        { title: "修理前の状態を写真に残す", description: "安全に撮影できる範囲で、被害箇所が分かる写真を残します。" }
      ],
      warnings: ["自治体へ相談する前に、修理代金を支払わないでください。"],
      documents: [
        { name: "応急修理申込書", requiredLevel: "required" },
        { name: "り災証明書", requiredLevel: "required" },
        { name: "修理前の被害状況が分かる写真", requiredLevel: "required" }
      ],
      consultationItems: [
        { prompt: "り災証明書の住家被害区分を確認してください。", reason: "被害区分によって制度条件が異なるためです。", unknownHandling: "分からない場合は推測せず、市町村へ確認します。" },
        { prompt: "日常生活に必要な部分が壊れ、今のままでは住めない状態か確認してください。", reason: "住まいの現在の状態を確認する必要があるためです。", unknownHandling: "対象可否を断定せず、市町村へ確認します。" },
        { prompt: "必要な部分を修理すれば再び生活できる見込みがあるか確認してください。", reason: "修理後の居住見込みが条件に関係するためです。", unknownHandling: "建物の安全性を推測せず、市町村や専門家へつなぎます。" }
      ],
      officialSources: [
        { title: "【令和8年熊本地震】被災した住宅の応急修理について", url: "https://www.pref.kumamoto.jp/soshiki/27/275109.html", organization: "熊本県" },
        { title: "災害救助法の概要", url: "https://www.bousai.go.jp/taisaku/hisaisyagyousei/pdf/saigaikyujo_gaiyou.pdf", organization: "内閣府" }
      ],
      lastCheckedLabel: "2026年8月9日確認"
    }
  ]
};
