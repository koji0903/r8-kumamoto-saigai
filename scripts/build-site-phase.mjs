import fs from "node:fs";
import { validatePhase } from "./reconstruction-operations-policy.mjs";

const config=JSON.parse(fs.readFileSync("config/site-phase.json","utf8"));
if(!validatePhase(config.phase))throw new Error(`不正なsitePhase: ${config.phase}`);
if(!config.updatedAt||!config.updatedBy||!config.reason)throw new Error("sitePhaseの変更記録が不足しています");
const output=`window.SITE_PHASE=${JSON.stringify({phase:config.phase,updatedAt:config.updatedAt})};\ndocument.documentElement.dataset.sitePhase=window.SITE_PHASE.phase;\n`;
if(process.argv.includes("--check")){
  if(!fs.existsSync("site-phase.js")||fs.readFileSync("site-phase.js","utf8")!==output)throw new Error("site-phase.jsがconfig/site-phase.jsonと一致しません");
  console.log(`sitePhase確認: ${config.phase}`);
}else{
  fs.writeFileSync("site-phase.js",output);
  console.log(`sitePhase生成: ${config.phase}`);
}
