# Deck Format Spec

Created: 2026-05-14

## Why This Exists

The latest diversity samples are better as individual illustrations, but the deck format is not consistent enough yet.

Current problem:

```text
The character and pose diversity improved.
But card ratio, border density, symbol placement, figure scale, and visual weight are drifting.
```

A deck needs two things at the same time:

```text
1. Same product format
2. Different character/story per card
```

Think of it like a fashion magazine series: each photo can have a different model, pose, and mood, but the cover grid, title area, margins, and logo position must feel related.

## Standard Card Ratio

Use one fixed production ratio:

```text
2:3 vertical card
Recommended working canvas: 1024 x 1536
Recommended print upscale later: 2048 x 3072 or higher
```

Do not accept random generated sizes as final deck assets. If the generator outputs near-card sizes such as `992 x 1586` or `982 x 1602`, treat them as concept drafts, not final deck masters.

## Fixed Layout Zones

Every card should share these zones:

```text
Outer trim: full image edge
Border zone: 4-6% from edge
Inner art zone: central 78-84% of card
Top emblem zone: optional small card number/title area later
Lower-left symbol medallion: classic tarot reference
Lower-right symbol medallion: Korean historical/seonhyeon reference
Four corner symbols: small reading-frame symbols
Bottom quiet zone: future title/keyword area, keep visually calm
```

## What May Change

These should change from card to card:

```text
Character age
Face type
Pose
Camera angle
Gesture
Costume silhouette
Background scene
Main emotional tone
Primary symbolic prop
Color accent
```

## What Must Stay Consistent

These should stay consistent across the deck:

```text
2:3 vertical ratio
Rounded card corners
Gold/najeon border language
Four-corner reading-frame system
Lower-left tarot-symbol medallion
Lower-right seonhyeon-symbol medallion
No readable text inside generated art
No fake glyphs or calligraphy fragments
Premium bright mother-of-pearl material
Elegant Korean hanji/lacquer texture
Collectible editorial illustration quality
```

## Figure Scale Rules

To avoid every card becoming the same portrait:

```text
Close editorial portrait: max 25% of cards
Waist-up portrait: max 35% of cards
Three-quarter body: max 25% of cards
Full body or environmental scene: at least 15% of cards
```

But even when the crop changes, the card frame must remain consistent.

## Symbol Scale Rules

Symbol medallions should feel like deck UI, not random decoration.

```text
Lower-left medallion: 13-17% of card width
Lower-right medallion: 13-17% of card width
Corner symbols: 6-9% of card width
Main figure face: usually 12-22% of card height
Border thickness: visually consistent across all cards
```

If a symbol becomes larger than the face, it is probably too loud.

## Prompt Add-On

Add this to future generation prompts:

```text
Use a strict 2:3 vertical collectible tarot card layout on a 1024x1536 canvas. Keep the same deck format as prior cards: rounded corners, consistent gold and mother-of-pearl border, fixed lower-left tarot-symbol medallion, fixed lower-right historical-symbol medallion, four small corner symbols, and a calm bottom title zone left blank. The character pose and scene may be unique, but the frame, margin system, symbol positions, and visual hierarchy must match a unified printed deck.
```

## Current Concept Status

The following files are concept drafts, not final format masters:

```text
symbol-layer-changje-s6.png
symbol-layer-seolgye-s1.png
symbol-layer-inyeon-s1.png
symbol-layer-jigeon-s1.png
symbol-layer-chiyu-s1.png
symbol-layer-gyeoldan-s1.png
symbol-layer-gwanchal-s1.png
symbol-layer-jigeon-s2-diversity.png
symbol-layer-gwanchal-s2-diversity.png
```

Next production step:

```text
Create a locked deck template first, then regenerate or composite final cards into that template.
```

## Format Lock S3 Result

Created files:

```text
tarot/assets/concepts/seonhyeon-najeon-style/symbol-layer-jigeon-s3-format-lock.png
tarot/assets/concepts/seonhyeon-najeon-style/symbol-layer-gwanchal-s3-format-lock.png
tarot/assets/concepts/seonhyeon-najeon-style/format-lock-pair-s3.png
```

Validation:

```text
Jigeon S3: 1024 x 1536, ratio 0.667
Gwanchal S3: 1024 x 1536, ratio 0.667
```

Judgment:

```text
This is the strongest deck-format direction so far.
The cards now read as the same product line while preserving different character poses and moods.
```

Adjustment for the next batch:

```text
Reduce lower medallion visual weight by about 5-8%.
Keep the blank bottom title zone.
Keep the same border and corner symbol language.
```

## Format Lock Batch 2 Result

Created files:

```text
symbol-layer-seolgye-s3-format-lock.png
symbol-layer-inyeon-s3-format-lock.png
symbol-layer-chiyu-s3-format-lock.png
symbol-layer-gyeoldan-s3-format-lock.png
format-lock-batch2-s3.png
```

Validation:

```text
Seolgye S3: 1024 x 1536, pass
Inyeon S3: 992 x 1586, concept only
Chiyu S3: 1024 x 1536, pass
Gyeoldan S3: 992 x 1586, concept only
```

Rule update:

```text
Do not mark a card as a final deck master until it passes exact dimension validation.
Prompt format locking helps, but generated outputs can still drift.
```

## Korean Costume And Setting Rule

User correction on 2026-05-15:

```text
옷차림에 유의해줘. 중국풍이 아니라 한국풍으로 만들어야해.
```

This is essential. The deck must not read as generic East Asian fantasy, Chinese hanfu, or wuxia styling.

Allowed Korean visual anchors:

```text
hanbok jeogori and chima
durumagi, dopo, jeonbok, baeja
gat, manggeon, samo, ikseongwan when historically suitable
norigae, daenggi, binyeo, jokduri, Korean-style hair ribbons
Joseon/Goryeo-inspired ceremonial robes with restrained volume
Korean lamellar or ceremonial armor when needed
bojagi, jogakbo, hanji, dancheong, najeonchilgi, moon jar, lotus lantern
Korean palace/hanok proportions, tiled roofs, wooden lattice doors
```

Avoid:

```text
Chinese hanfu silhouettes
wuxia/fantasy warrior robes
oversized flowing immortal sleeves
Chinese hair crowns or phoenix crowns
Chinese palace gates, round moon gates, dragon-heavy ornament
calligraphy-like background bands
hanzi-like architectural decoration
generic xianxia ribbons and floating sashes
```

Prompt add-on:

```text
Use clearly Korean Joseon/Goryeo-inspired costume and setting, not Chinese hanfu or wuxia fantasy. Use hanbok-based layers such as durumagi, dopo, jeogori/chima, jeonbok, gat/manggeon/binyeo/norigae/daenggi where appropriate. Korean hanok/palace proportions, dancheong, hanji, najeonchilgi, bojagi, moon jar, and lotus lantern details. Avoid Chinese hair crowns, hanfu silhouettes, xianxia ribbons, dragon-heavy ornament, Chinese palace gates, and any hanzi-like decorative marks.
```
