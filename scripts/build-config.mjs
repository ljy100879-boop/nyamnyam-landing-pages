// .env 를 읽어 브라우저용 amplitude-config.js 를 만듭니다.
// 사용법: node scripts/build-config.mjs
//
// 브라우저에 들어가는 값은 API 키와 서버 지역뿐입니다.
// AMPLITUDE_SECRET_KEY 는 어떤 경우에도 출력 파일에 넣지 않습니다.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env");

if (!existsSync(envPath)) {
  console.error(".env 파일이 없습니다. .env.example 을 복사해 .env 를 만들고 값을 채우세요.");
  process.exit(1);
}

const env = {};
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const apiKey = env.AMPLITUDE_API_KEY;
if (!apiKey) {
  console.error(".env 에 AMPLITUDE_API_KEY 가 비어 있습니다.");
  process.exit(1);
}
const serverZone = (env.AMPLITUDE_SERVER_ZONE || "US").toUpperCase() === "EU" ? "EU" : "US";

const out = `// 자동 생성 파일입니다. 직접 고치지 말고 .env 수정 후 \`node scripts/build-config.mjs\` 를 실행하세요.
// Amplitude 브라우저 API 키는 이벤트 전송용 공개 키입니다. (비밀 키는 포함되지 않음)
window.AMPLITUDE_CONFIG = ${JSON.stringify({ apiKey, serverZone }, null, 2)};
`;
writeFileSync(join(root, "amplitude-config.js"), out);
console.log(`amplitude-config.js 생성 완료 (serverZone: ${serverZone})`);
