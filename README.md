# bini

GitHub Pages 배포용 저장소입니다.

## 공개 주소

- 카드 뒤집기 게임: `https://youbinseo-create.github.io/bini/`
- 오늘의 결 카드: `https://youbinseo-create.github.io/bini/tarot/`

## 폴더 구조

```text
index.html                    # 카드 뒤집기 게임
assets/cards/...              # 카드 뒤집기 게임 이미지
tarot/index.html              # 오늘의 결 카드 앱
tarot/cards-data.js           # 타로 카드 데이터
tarot/assets/cards/*.jpg      # 타로 카드 이미지
```

루트 `index.html`은 기존 카드 뒤집기 게임을 유지합니다.
타로 앱은 `/tarot/` 하위 경로에서만 동작하도록 분리했습니다.
