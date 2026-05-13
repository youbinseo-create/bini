# Concept Asset Structure

작성일: 2026-05-13

컨셉 이미지는 성격별로 섞이지 않게 아래 폴더에 보관한다.

## 폴더

```text
tarot/assets/cards/
```

현재 웹앱에 연결된 기존 저해상도 카드 이미지 폴더다. 배포된 앱이 이 경로를 참조하므로 컨셉 정리 때문에 이동하지 않는다.

```text
tarot/assets/concepts/existing-card-style/
```

기존 밝은 화보형/프리미엄 오라클 스타일 컨셉 이미지 보관소다. 현재까지의 V0~V11 이미지, 붉은 실 카드, 기존 카드 뒷면, 리워드 목업이 여기에 들어간다.

```text
tarot/assets/concepts/minhwa-card-style/
```

민화 구조를 카드 앞면 세계관으로 발전시키는 컨셉 이미지 보관소다. 책거리, 호작도, 문자도, 화조도, 모란도, 십장생 구조를 카드별 상징으로 바꾸는 실험을 넣는다.

```text
tarot/assets/concepts/najeon-card-style/
```

나전칠기/자개를 카드 뒷면, 박스, 패키지, 리워드 가격감으로 발전시키는 컨셉 이미지 보관소다. 흑칠, 패각 조각, 금속선, 국화당초문, 자개 점 테두리 실험을 넣는다.

## 현재 대표 파일

```text
existing-card-style/tumblbug-hero-visualart-v8.png
existing-card-style/tumblbug-card-red-thread-v9.png
existing-card-style/tumblbug-reward-mockup-v11.png
minhwa-card-style/style-alt-minhwa-pop-b.png
minhwa-card-style/minhwa-structured-b3.png
minhwa-card-style/minhwa-refined-b4.png
najeon-card-style/style-alt-modern-minimal-a.png
najeon-card-style/najeon-packaging-c2.png
najeon-card-style/najeon-symbolic-c3.png
```

## 운영 규칙

- 생성 원본은 `C:\Users\youbi\.codex\generated_images`에 남긴다.
- 프로젝트에서 비교할 이미지는 위 폴더 중 하나로 복사한다.
- 기존 앱 카드 이미지는 `tarot/assets/cards`에서 이동하지 않는다.
- 카드 앞면 세계관 실험은 `minhwa-card-style`에 넣는다.
- 카드 뒷면/박스/패키지 실험은 `najeon-card-style`에 넣는다.
- 기존 밝은 화보형 또는 텀블벅 상세페이지용 이전 컨셉은 `existing-card-style`에 넣는다.

## 현재 판단

민화 B4는 B3보다 낫다. B3는 자료 요소가 많아 일러스트 설명처럼 보였고, B4는 이전 민화 팝 버전의 밝고 소장욕 있는 느낌을 어느 정도 회복했다.

나전 C3는 C2보다 낫다. C2는 공예 디테일은 늘었지만 상징과 아름다움이 약해졌고, C3는 초기 미니멀 자개 버전의 아름다움과 카드별 상징을 같이 살렸다.

