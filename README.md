# GAMDO 벽 정원

아이패드 서버에서 새 꽃을 가져와 표시하는 정원 화면입니다. Cloudflare Workers에 배포하며 별도 데이터베이스는 만들지 않습니다.

## 먼저 읽기

[배포 순서와 설정 안내](DEPLOYMENT.md)를 따라 아이패드 저장소를 먼저 배포하고, 정원 저장소를 연결하세요. GitHub Pages 전용 프로젝트가 아닙니다.

## 명령

```sh
npm install
npm run check
npm run dev
```

`npm run deploy` 전 `wrangler.json` 설정을 채워야 합니다. 실제 비밀번호·API 키는 `wrangler secret put`으로 서버에 저장합니다. `.dev.vars.example`은 로컬 실행용 예시이며 실제 `.dev.vars`는 업로드하지 않습니다.

## 파일

- `public/`: 현재 GAMDO의 화면·폰트·생성형 SVG 그래픽
- `src/worker.mjs`: 이 저장소의 서버 진입점
- `wrangler.json`: Cloudflare 배포 설정
- `tests/`: 외부 API 비용 없이 실행하는 동작 확인

현재 운영 중인 Sites와는 독립된 복사본입니다.
