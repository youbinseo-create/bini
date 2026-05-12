# Tarot Card Production Tracker

이 문서는 78장 카드 이미지를 배포 가능한 상태로 끌어올리기 위한 제작 현황표다.

## 현재 요약

- 전체 카드: 78장
- 앱에 연결된 이미지: 28장
- 아직 이미지 없는 카드: 50장
- 현재 앱 이미지 크기: 490x840 JPG
- 목표 앱 이미지: 720x1234 WebP 또는 JPG
- 목표 마스터: 2048x3072 이상 PNG

현재 이미지는 “작동 확인용 초안”에 가깝다. 사용자는 앱을 체험할 수 있지만, 브랜드 카드덱으로 팔거나 프리미엄 리포트에 붙이기에는 해상도와 통일감이 부족하다.

## 연결된 카드

```text
00_the-fool_hyecho
03_empress_shin-saimdang
05_hierophant_toegye
06_lovers_chunhyang
07_chariot_yi-sunsin
09_hermit_kim-jeongho
10_wheel_jeong-dojeon
11_justice_jeong-yakyong
14_temperance_heo-jun
16_tower_jo-gwangjo
18_moon_hwang-jini
21_world_sejong
22_ace-of-wands_jumong
23_two-of-wands_onjo
24_three-of-wands_jang-bogo
25_four-of-wands_kim-yusin
26_five-of-wands_gyebaek
27_six-of-wands_gang-gamchan
28_seven-of-wands_eulji-mundeok
29_eight-of-wands_gwak-jaeu
36_queen-of-wands_uisang
40_five-of-cups_heo-nanseolheon
41_six-of-cups_kim-hongdo
48_king-of-cups_soseono
57_eight-of-swords_park-jega
59_ten-of-swords_seong-sammun
64_ace-of-pentacles_mun-ikjeom
76_king-of-pentacles_kim-mandeok
```

## 1차 제작 후보

메이저 아르카나는 사용자가 가장 먼저 기대하는 카드군이다. 누락된 메이저부터 채워야 앱이 “진짜 타로”처럼 보인다.

```text
01_magician
02_high-priestess
04_emperor
08_strength
12_hanged-man
13_death
15_devil
17_star
19_sun
20_judgement
```

## 수익화 관점 핵심 카드

아래 카드는 향후 유료 리포트, 반복 패턴 분석, 상담 연결에 쓰기 좋다. 단순 운세보다 “내가 왜 이 패턴을 반복하는가”를 설명하기 좋기 때문이다.

```text
07_chariot_yi-sunsin: 선택, 의지, 기준
13_death: 전환, 종료, 새 시작
40_five-of-cups_heo-nanseolheon: 상실, 감정 정리
57_eight-of-swords_park-jega: 막힌 생각, 관점 전환
64_ace-of-pentacles_mun-ikjeom: 현실적 시작, 돈과 기회
```

## 카드별 검수 기준

- 카드 의미가 이미지 중심 사물로 보이는가
- 앱에서 작게 보여도 실루엣이 읽히는가
- 인물 얼굴, 손, 장신구가 깨지지 않는가
- 이미지 안에 깨진 글자나 가짜 한글이 없는가
- 같은 슈트끼리 색과 분위기가 이어지는가
- 카드가 너무 무속/공포/게임 일러스트처럼 기울지 않는가
- 자기성찰 앱답게 고급스럽고 차분한가

## 다음 제작 순서

1. 1차 제작 후보 10장을 고해상도 마스터로 만든다.
2. 앱용 720x1234 버전으로 변환한다.
3. `tarot/assets/cards`에 연결한다.
4. 모바일 결과 화면에서 카드가 해석을 밀어내지 않는지 확인한다.
5. 카드별 `visualPrompt`와 실제 이미지가 어긋나면 데이터를 수정한다.
