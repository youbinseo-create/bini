# 지속 검증 체크리스트

## 배포 확인

- `/bini/`는 카드 뒤집기 게임으로 보여야 한다.
- `/bini/tarot/`는 오늘의 결 카드 앱으로 보여야 한다.
- `/bini/tarot/index.html`도 정상 동작해야 한다.
- `cards-data.js`와 `cards-data.json`의 카드 수와 주요 필드가 일치해야 한다.

## 타로 앱 핵심 기능

- 1장 리딩 가능
- 3장 리딩 가능
- 질문 없이 리딩 가능
- 질문 입력 후 리딩 가능
- 결과에 심화 리포트 미리보기가 표시됨
- 감정 태그 선택 가능
- 메모 입력 가능
- 리딩 저장 가능
- 저장한 리딩 다시 보기 가능
- 개별 삭제 가능
- 전체 기록 비우기 가능
- 반복 카드/주제/감정 인사이트가 갱신됨

## 데이터 검증

78장 모두 아래 필드를 가져야 한다.

```text
answer
reflection
question
guidanceTitle
guidance
archetype
historicalScene
coreMeaning
light
shadow
love
work
money
inner
questionPrompts
action
journalPrompt
premiumNote
visualPrompt
production
```

## 수익화 검증

- 상담 CTA가 결과보다 먼저 과하게 노출되지 않는가?
- 저장 후 기록 화면으로 자연스럽게 이어지는가?
- 반복 주제/반복 카드가 상담 또는 리포트 CTA의 근거가 되는가?
- 불안을 조장하는 문구가 없는가?
- 유료 리포트/상담으로 이어질 데이터가 저장되는가?

## 경쟁 앱 월간 점검

- 포스텔러: 신규 운세 패키지, 가격, 주제 수, 신년운세 흐름
- 점신: 운세 보고서, 광고 제거/패스, 전문가 상담 구조
- 홍카페: 상담사 연결, 후기, 코인/가격, 오프라인 연결
- 천명: 상담사 추천, 방문/채팅/전화 상담 구조
- 타로문: 실시간 상담, 연애/재회 주제, 상담 채널
- Labyrinthos: 저널, 리포트, 덱 판매, 학습 구조
- Biddy Tarot: 커뮤니티, 강의, 리소스 구조
- CHANI: 저널, 명상, 자기발견 콘텐츠

## 릴리즈 전 필수 명령

```powershell
git status --short
```

그리고 원격 기준으로:

```powershell
Invoke-WebRequest -UseBasicParsing https://raw.githubusercontent.com/youbinseo-create/bini/main/tarot/cards-data.json
Invoke-WebRequest -UseBasicParsing https://youbinseo-create.github.io/bini/
Invoke-WebRequest -UseBasicParsing https://youbinseo-create.github.io/bini/tarot/
```
