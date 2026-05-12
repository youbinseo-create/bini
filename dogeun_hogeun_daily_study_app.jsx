import React, { useEffect, useMemo, useState } from "react";
import { Calendar, CheckCircle2, Brain, Languages, BookOpen, Calculator, Trophy, Trash2, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const STORAGE_KEY = "dogeun-hogeun-daily-study-v1";

const ENGLISH_DATA = {
  basic: [
    { word: "apple", meaning: "사과", sentence: "I eat an apple every morning." },
    { word: "book", meaning: "책", sentence: "This book is fun to read." },
    { word: "water", meaning: "물", sentence: "Please drink some water." },
    { word: "happy", meaning: "행복한", sentence: "I feel happy today." },
    { word: "school", meaning: "학교", sentence: "We go to school at 8." },
    { word: "friend", meaning: "친구", sentence: "My friend likes soccer." },
    { word: "family", meaning: "가족", sentence: "I love my family very much." },
    { word: "sun", meaning: "해", sentence: "The sun is bright today." },
    { word: "dog", meaning: "강아지", sentence: "The dog runs fast." },
    { word: "milk", meaning: "우유", sentence: "She drinks milk before bed." },
    { word: "banana", meaning: "바나나", sentence: "A banana is yellow." },
    { word: "chair", meaning: "의자", sentence: "Sit on the chair, please." },
    { word: "bread", meaning: "빵", sentence: "We ate bread for breakfast." },
    { word: "pencil", meaning: "연필", sentence: "I need a pencil for class." },
    { word: "smile", meaning: "웃다", sentence: "Please smile for the photo." },
    { word: "window", meaning: "창문", sentence: "Open the window a little." },
    { word: "teacher", meaning: "선생님", sentence: "Our teacher is kind." },
    { word: "rain", meaning: "비", sentence: "It will rain this afternoon." },
    { word: "play", meaning: "놀다", sentence: "The kids play outside." },
    { word: "star", meaning: "별", sentence: "I can see one bright star." },
  ],
  school: [
    { word: "classroom", meaning: "교실", sentence: "Our classroom is clean." },
    { word: "eraser", meaning: "지우개", sentence: "Use an eraser to fix it." },
    { word: "notebook", meaning: "공책", sentence: "Write it in your notebook." },
    { word: "homework", meaning: "숙제", sentence: "I finished my homework." },
    { word: "lesson", meaning: "수업", sentence: "Today's lesson is easy." },
    { word: "library", meaning: "도서관", sentence: "We read books in the library." },
    { word: "answer", meaning: "정답", sentence: "Your answer is correct." },
    { word: "question", meaning: "질문", sentence: "Do you have a question?" },
    { word: "student", meaning: "학생", sentence: "Every student has a desk." },
    { word: "science", meaning: "과학", sentence: "Science is exciting." },
  ],
};

const JAPANESE_DATA = {
  basic: [
    { word: "こんにちは", meaning: "안녕하세요", sentence: "こんにちは、げんきですか。" },
    { word: "ありがとう", meaning: "고마워요", sentence: "てつだってくれて、ありがとう。" },
    { word: "みず", meaning: "물", sentence: "みずを のみます。" },
    { word: "がっこう", meaning: "학교", sentence: "がっこうへ いきます。" },
    { word: "ともだち", meaning: "친구", sentence: "ともだちと あそびます。" },
    { word: "いぬ", meaning: "강아지", sentence: "いぬが はしっています。" },
    { word: "ねこ", meaning: "고양이", sentence: "ねこが ねています。" },
    { word: "ほん", meaning: "책", sentence: "ほんを よみます。" },
    { word: "りんご", meaning: "사과", sentence: "りんごを たべます。" },
    { word: "えがお", meaning: "웃는 얼굴", sentence: "えがおが すてきです。" },
    { word: "せんせい", meaning: "선생님", sentence: "せんせいに あいさつします。" },
    { word: "かぞく", meaning: "가족", sentence: "かぞくで ごはんを たべます。" },
    { word: "そら", meaning: "하늘", sentence: "そらが あおいです。" },
    { word: "あさ", meaning: "아침", sentence: "あさ はやく おきます。" },
    { word: "ゆき", meaning: "눈", sentence: "ゆきが ふっています。" },
    { word: "おんがく", meaning: "음악", sentence: "おんがくを ききます。" },
    { word: "くだもの", meaning: "과일", sentence: "くだものが すきです。" },
    { word: "じてんしゃ", meaning: "자전거", sentence: "じてんしゃに のります。" },
    { word: "ゆうき", meaning: "용기", sentence: "ゆうきを もって ちょうせんします。" },
    { word: "たのしい", meaning: "즐거운", sentence: "きょうは たのしい ひです。" },
  ],
  greeting: [
    { word: "おはよう", meaning: "좋은 아침", sentence: "おはよう、きょうも がんばろう。" },
    { word: "こんばんは", meaning: "안녕하세요(저녁)", sentence: "こんばんは、さむいですね。" },
    { word: "さようなら", meaning: "안녕히 가세요", sentence: "せんせいに さようなら と いいます。" },
    { word: "またね", meaning: "또 봐", sentence: "ともだちに またね と いいます。" },
    { word: "すみません", meaning: "실례합니다/죄송합니다", sentence: "すみません、もういちど おねがいします。" },
    { word: "おねがいします", meaning: "부탁합니다", sentence: "よろしく おねがいします。" },
    { word: "はい", meaning: "네", sentence: "はい、わかりました。" },
    { word: "いいえ", meaning: "아니요", sentence: "いいえ、ちがいます。" },
    { word: "はじめまして", meaning: "처음 뵙겠습니다", sentence: "はじめまして、どうぞ よろしく。" },
    { word: "おやすみ", meaning: "잘 자", sentence: "おやすみ、また あした。" },
  ],
};

const HANJA_DATA = {
  basic: [
    { word: "學", meaning: "배울 학", sentence: "學校(학교): 배우는 곳" },
    { word: "校", meaning: "학교 교", sentence: "校門(교문): 학교 문" },
    { word: "生", meaning: "날 생", sentence: "學生(학생): 배우는 사람" },
    { word: "先", meaning: "먼저 선", sentence: "先生(선생): 먼저 배운 사람" },
    { word: "日", meaning: "날 일", sentence: "今日(금일): 오늘" },
    { word: "月", meaning: "달 월", sentence: "月曜(월요): 월요일" },
    { word: "火", meaning: "불 화", sentence: "火山(화산): 불의 산" },
    { word: "水", meaning: "물 수", sentence: "水泳(수영): 물에서 헤엄" },
    { word: "木", meaning: "나무 목", sentence: "木曜日(목요일): 나무의 날" },
    { word: "金", meaning: "쇠 금", sentence: "金色(금색): 금빛 색" },
    { word: "土", meaning: "흙 토", sentence: "土地(토지): 땅" },
    { word: "山", meaning: "메 산", sentence: "火山(화산): 불 산" },
    { word: "川", meaning: "내 천", sentence: "山川(산천): 산과 강" },
    { word: "大", meaning: "큰 대", sentence: "大人(대인): 큰 사람" },
    { word: "小", meaning: "작을 소", sentence: "小學(소학): 어린이 배움" },
    { word: "中", meaning: "가운데 중", sentence: "中心(중심): 가운데" },
    { word: "上", meaning: "위 상", sentence: "上手(상수/조즈): 잘함" },
    { word: "下", meaning: "아래 하", sentence: "下校(하교): 학교에서 돌아감" },
    { word: "左", meaning: "왼 좌", sentence: "左右(좌우): 왼쪽과 오른쪽" },
    { word: "右", meaning: "오를 우", sentence: "左右(좌우): 왼쪽과 오른쪽" },
  ],
  life: [
    { word: "食", meaning: "먹을 식", sentence: "食事(식사): 밥 먹는 일" },
    { word: "家", meaning: "집 가", sentence: "家族(가족): 집의 사람들" },
    { word: "人", meaning: "사람 인", sentence: "人生(인생): 사람의 삶" },
    { word: "心", meaning: "마음 심", sentence: "安心(안심): 마음 놓음" },
    { word: "力", meaning: "힘 력", sentence: "努力(노력): 힘을 들임" },
    { word: "天", meaning: "하늘 천", sentence: "天氣(천기/날씨): 하늘의 기운" },
    { word: "地", meaning: "땅 지", sentence: "天地(천지): 하늘과 땅" },
    { word: "年", meaning: "해 년", sentence: "少年(소년): 어린 나이" },
    { word: "時", meaning: "때 시", sentence: "時間(시간): 때의 사이" },
    { word: "花", meaning: "꽃 화", sentence: "花園(화원): 꽃 동산" },
  ],
};

const subjectConfig = {
  english: { label: "영어", short: "E", icon: Languages, color: "bg-blue-100 text-blue-700" },
  japanese: { label: "일본어", short: "J", icon: BookOpen, color: "bg-rose-100 text-rose-700" },
  hanja: { label: "한자", short: "H", icon: Brain, color: "bg-amber-100 text-amber-700" },
  math: { label: "수학", short: "M", icon: Calculator, color: "bg-emerald-100 text-emerald-700" },
  quiz: { label: "퀴즈", short: "Q", icon: Trophy, color: "bg-violet-100 text-violet-700" },
};

const mathGrades = {
  grade1: { label: "초1", ops: ["+", "-"] },
  grade2: { label: "초2", ops: ["+", "-"] },
  grade3: { label: "초3", ops: ["+", "-", "×"] },
  grade4: { label: "초4", ops: ["+", "-", "×", "÷"] },
  grade5: { label: "초5", ops: ["+", "-", "×", "÷"] },
  grade6: { label: "초6", ops: ["+", "-", "×", "÷"] },
};

function formatDateKey(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
}

function getDailyIndex(seed, length) {
  const numeric = Number(seed.replace(/-/g, ""));
  return numeric % length;
}

function getWordsForToday(dataset, category, dateKey) {
  const list = dataset[category] || [];
  if (list.length === 0) return [];
  const start = getDailyIndex(dateKey, list.length);
  const result = [];
  for (let i = 0; i < 10; i += 1) {
    result.push(list[(start + i) % list.length]);
  }
  return result;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMathProblem(gradeKey) {
  const ops = mathGrades[gradeKey].ops;
  const op = ops[randomInt(0, ops.length - 1)];

  let a = 0;
  let b = 0;
  if (gradeKey === "grade1") {
    a = randomInt(1, 20);
    b = randomInt(1, 20);
  } else if (gradeKey === "grade2") {
    a = randomInt(10, 99);
    b = randomInt(1, 99);
  } else if (gradeKey === "grade3") {
    a = randomInt(2, 30);
    b = randomInt(2, 12);
  } else {
    a = randomInt(2, 100);
    b = randomInt(2, 20);
  }

  let question = "";
  let answer = 0;

  if (op === "+") {
    question = `${a} + ${b}`;
    answer = a + b;
  } else if (op === "-") {
    if (a < b) [a, b] = [b, a];
    question = `${a} - ${b}`;
    answer = a - b;
  } else if (op === "×") {
    question = `${a} × ${b}`;
    answer = a * b;
  } else {
    answer = a;
    const dividend = a * b;
    question = `${dividend} ÷ ${b}`;
  }

  return { id: crypto.randomUUID(), question, answer };
}

function generateMathSet(gradeKey, count) {
  return Array.from({ length: count }, () => generateMathProblem(gradeKey));
}

function buildQuizOptions(correctAnswer, type = "text") {
  const set = new Set([String(correctAnswer)]);
  while (set.size < 4) {
    if (type === "number") {
      const delta = randomInt(-10, 10) || 1;
      set.add(String(Number(correctAnswer) + delta));
    } else {
      const fillers = ["학교", "친구", "사과", "행복", "물", "가족", "하늘", "공부", "용기", "고양이"];
      set.add(fillers[randomInt(0, fillers.length - 1)]);
    }
  }
  return [...set].sort(() => Math.random() - 0.5);
}

function getInitialState() {
  return {
    records: {},
    categories: { english: "basic", japanese: "basic", hanja: "basic" },
    mathGrade: "grade1",
    mathCount: 10,
    children: ["도근", "호근"],
  };
}

export default function DogeunHogeunDailyStudyApp() {
  const [state, setState] = useState(getInitialState);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedChild, setSelectedChild] = useState("도근");
  const [mathProblems, setMathProblems] = useState([]);
  const [mathAnswers, setMathAnswers] = useState({});
  const [quizSubject, setQuizSubject] = useState("english");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizChoice, setQuizChoice] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const dateKey = formatDateKey(selectedDate);
  const todayEnglish = useMemo(() => getWordsForToday(ENGLISH_DATA, state.categories.english, dateKey), [state.categories.english, dateKey]);
  const todayJapanese = useMemo(() => getWordsForToday(JAPANESE_DATA, state.categories.japanese, dateKey), [state.categories.japanese, dateKey]);
  const todayHanja = useMemo(() => getWordsForToday(HANJA_DATA, state.categories.hanja, dateKey), [state.categories.hanja, dateKey]);

  const currentRecord = state.records[dateKey]?.[selectedChild] || {
    englishDone: false,
    japaneseDone: false,
    hanjaDone: false,
    englishCount: 0,
    japaneseCount: 0,
    hanjaCount: 0,
    mathDone: false,
    mathCount: 0,
    quizDone: false,
    quizScore: 0,
    quizTotal: 0,
  };

  const monthGrid = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const startDay = first.getDay();
    const total = last.getDate();
    const cells = [];
    for (let i = 0; i < startDay; i += 1) cells.push(null);
    for (let d = 1; d <= total; d += 1) cells.push(new Date(y, m, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [currentMonth]);

  const stats = useMemo(() => {
    let english = 0;
    let japanese = 0;
    let hanja = 0;
    let math = 0;
    let quizTotal = 0;
    let studyDays = 0;

    Object.values(state.records).forEach((byChild) => {
      const childRecord = byChild[selectedChild];
      if (!childRecord) return;
      const didStudy = childRecord.englishCount || childRecord.japaneseCount || childRecord.hanjaCount || childRecord.mathCount || childRecord.quizTotal;
      if (didStudy) studyDays += 1;
      english += childRecord.englishCount || 0;
      japanese += childRecord.japaneseCount || 0;
      hanja += childRecord.hanjaCount || 0;
      math += childRecord.mathCount || 0;
      if (childRecord.quizTotal) {
        quizTotal += Math.round((childRecord.quizScore / childRecord.quizTotal) * 100);
      }
    });

    const quizAttempts = Object.values(state.records).filter((byChild) => byChild[selectedChild]?.quizTotal).length;

    return {
      english,
      japanese,
      hanja,
      math,
      studyDays,
      quizAverage: quizAttempts ? Math.round(quizTotal / quizAttempts) : 0,
    };
  }, [state.records, selectedChild]);

  const quizQuestions = useMemo(() => {
    if (quizSubject === "english") {
      return todayEnglish.map((item) => ({
        prompt: `${item.word}의 뜻은?`,
        answer: item.meaning,
        options: buildQuizOptions(item.meaning),
      }));
    }
    if (quizSubject === "japanese") {
      return todayJapanese.map((item) => ({
        prompt: `${item.word}의 뜻은?`,
        answer: item.meaning,
        options: buildQuizOptions(item.meaning),
      }));
    }
    if (quizSubject === "hanja") {
      return todayHanja.map((item) => ({
        prompt: `${item.word}의 뜻은?`,
        answer: item.meaning,
        options: buildQuizOptions(item.meaning),
      }));
    }
    const mathQuiz = generateMathSet(state.mathGrade, 10).map((item) => ({
      prompt: `${item.question} = ?`,
      answer: String(item.answer),
      options: buildQuizOptions(item.answer, "number"),
    }));
    return mathQuiz;
  }, [quizSubject, todayEnglish, todayJapanese, todayHanja, state.mathGrade]);

  const activeQuiz = quizQuestions[quizIndex];

  function updateRecord(patch) {
    setState((prev) => ({
      ...prev,
      records: {
        ...prev.records,
        [dateKey]: {
          ...(prev.records[dateKey] || {}),
          [selectedChild]: {
            ...(prev.records[dateKey]?.[selectedChild] || {}),
            ...patch,
          },
        },
      },
    }));
  }

  function markWordsDone(subject, count = 10) {
    if (subject === "english") updateRecord({ englishDone: true, englishCount: count });
    if (subject === "japanese") updateRecord({ japaneseDone: true, japaneseCount: count });
    if (subject === "hanja") updateRecord({ hanjaDone: true, hanjaCount: count });
  }

  function resetDayRecord() {
    setState((prev) => {
      const next = structuredClone(prev);
      if (next.records[dateKey]) delete next.records[dateKey][selectedChild];
      if (next.records[dateKey] && Object.keys(next.records[dateKey]).length === 0) delete next.records[dateKey];
      return next;
    });
  }

  function startMath() {
    const set = generateMathSet(state.mathGrade, state.mathCount);
    setMathProblems(set);
    setMathAnswers({});
  }

  function submitMath() {
    const correct = mathProblems.filter((p) => String(p.answer) === String(mathAnswers[p.id] ?? "")).length;
    updateRecord({ mathDone: true, mathCount: mathProblems.length, mathCorrect: correct, mathTotal: mathProblems.length });
  }

  function restartQuiz() {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswered(false);
    setQuizChoice("");
  }

  function handleQuizChoice(option) {
    if (quizAnswered) return;
    setQuizChoice(option);
    setQuizAnswered(true);
    if (option === activeQuiz.answer) {
      setQuizScore((s) => s + 1);
    }
  }

  function goNextQuiz() {
    if (quizIndex === quizQuestions.length - 1) {
      updateRecord({ quizDone: true, quizScore: quizChoice === activeQuiz.answer ? quizScore + 1 : quizScore, quizTotal: quizQuestions.length });
      return;
    }
    setQuizIndex((i) => i + 1);
    setQuizAnswered(false);
    setQuizChoice("");
  }

  function subjectSummaryForDate(date) {
    const key = formatDateKey(date);
    const rec = state.records[key]?.[selectedChild];
    if (!rec) return [];
    const badges = [];
    if (rec.englishCount) badges.push(`E${rec.englishCount}`);
    if (rec.japaneseCount) badges.push(`J${rec.japaneseCount}`);
    if (rec.hanjaCount) badges.push(`H${rec.hanjaCount}`);
    if (rec.mathCount) badges.push(`M${rec.mathCount}`);
    if (rec.quizTotal) badges.push(`Q${rec.quizScore}/${rec.quizTotal}`);
    return badges;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <Card className="rounded-3xl shadow-sm border-0">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">도근,호근 일일공부</CardTitle>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-6">달력으로 매일 공부 기록을 남기고, 언어·수학·퀴즈를 한 번에 관리해요.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedChild} onValueChange={setSelectedChild}>
                    <SelectTrigger className="w-full sm:w-32 rounded-2xl">
                      <SelectValue placeholder="아이 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.children.map((child) => (
                        <SelectItem key={child} value={child}>{child}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge className="rounded-full px-4 py-2 text-sm">{selectedChild} 공부중</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
                {Object.entries(subjectConfig).map(([key, item]) => {
                  const Icon = item.icon;
                  const value = key === "english"
                    ? stats.english
                    : key === "japanese"
                    ? stats.japanese
                    : key === "hanja"
                    ? stats.hanja
                    : key === "math"
                    ? stats.math
                    : `${stats.quizAverage}%`;
                  return (
                    <div key={key} className="rounded-3xl bg-white border p-4 flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">{item.label}</div>
                        <div className="text-xl font-bold">{value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-lg">오늘의 기록</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                {currentRecord.englishCount ? <Badge className="rounded-full">영어 {currentRecord.englishCount}개</Badge> : null}
                {currentRecord.japaneseCount ? <Badge className="rounded-full">일본어 {currentRecord.japaneseCount}개</Badge> : null}
                {currentRecord.hanjaCount ? <Badge className="rounded-full">한자 {currentRecord.hanjaCount}개</Badge> : null}
                {currentRecord.mathCount ? <Badge className="rounded-full">수학 {currentRecord.mathCount}문제</Badge> : null}
                {currentRecord.quizTotal ? <Badge className="rounded-full">퀴즈 {currentRecord.quizScore}/{currentRecord.quizTotal}</Badge> : null}
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="font-semibold mb-2">{dateKey}</div>
                <div className="text-slate-600 leading-7">
                  {currentRecord.englishCount ? `오늘 영어 단어 ${currentRecord.englishCount}개 완료. ` : ""}
                  {currentRecord.japaneseCount ? `일본어 단어 ${currentRecord.japaneseCount}개 완료. ` : ""}
                  {currentRecord.hanjaCount ? `한자 ${currentRecord.hanjaCount}개 완료. ` : ""}
                  {currentRecord.mathCount ? `수학 ${currentRecord.mathCount}문제 풀이. ` : ""}
                  {currentRecord.quizTotal ? `퀴즈 ${currentRecord.quizScore}/${currentRecord.quizTotal}.` : "공부 기록을 남겨보세요."}
                </div>
              </div>
              <Button variant="outline" className="w-full rounded-2xl" onClick={resetDayRecord}>
                <Trash2 className="mr-2 h-4 w-4" /> 기록 삭제
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.15fr_1fr]">
          <Card className="rounded-3xl shadow-sm border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl"><Calendar className="h-5 w-5" /> 달력</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="rounded-2xl" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>이전</Button>
                  <div className="font-semibold min-w-28 text-center">{currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월</div>
                  <Button variant="outline" className="rounded-2xl" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>다음</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[11px] sm:text-sm font-semibold text-slate-500">
                {["일", "월", "화", "수", "목", "금", "토"].map((d) => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {monthGrid.map((date, idx) => {
                  if (!date) return <div key={idx} className="aspect-square rounded-2xl bg-transparent" />;
                  const key = formatDateKey(date);
                  const selected = key === dateKey;
                  const tags = subjectSummaryForDate(date);
                  const isToday = key === formatDateKey(new Date());
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDate(date)}
                      className={`aspect-square min-h-[72px] sm:min-h-[96px] rounded-2xl border p-1.5 sm:p-2 text-left transition hover:shadow-sm ${selected ? "border-slate-900 bg-slate-900 text-white" : "bg-white"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs sm:text-sm">{date.getDate()}</span>
                        {isToday ? <CheckCircle2 className={`h-4 w-4 ${selected ? "text-white" : "text-emerald-500"}`} /> : null}
                      </div>
                      <div className="mt-2 space-y-1">
                        {tags.slice(0, 3).map((tag) => (
                          <div key={tag} className={`text-[9px] sm:text-[10px] px-1 py-0.5 rounded-full inline-block mr-1 mb-1 ${selected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"}`}>{tag}</div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-xl">기록 / 통계</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm"><span>언어 학습 누적</span><span>{stats.english + stats.japanese + stats.hanja}개</span></div>
                <Progress value={Math.min(100, ((stats.english + stats.japanese + stats.hanja) / 300) * 100)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-blue-50 p-4"><div className="text-sm text-slate-500">영어</div><div className="text-2xl font-bold">{stats.english}</div></div>
                <div className="rounded-3xl bg-rose-50 p-4"><div className="text-sm text-slate-500">일본어</div><div className="text-2xl font-bold">{stats.japanese}</div></div>
                <div className="rounded-3xl bg-amber-50 p-4"><div className="text-sm text-slate-500">한자</div><div className="text-2xl font-bold">{stats.hanja}</div></div>
                <div className="rounded-3xl bg-emerald-50 p-4"><div className="text-sm text-slate-500">수학</div><div className="text-2xl font-bold">{stats.math}</div></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border p-4"><div className="text-sm text-slate-500">공부한 날짜</div><div className="text-2xl font-bold">{stats.studyDays}일</div></div>
                <div className="rounded-3xl border p-4"><div className="text-sm text-slate-500">퀴즈 평균</div><div className="text-2xl font-bold">{stats.quizAverage}%</div></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="english" className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 rounded-3xl h-auto p-1 bg-white shadow-sm border gap-1">
            <TabsTrigger value="english" className="rounded-2xl py-3">영어</TabsTrigger>
            <TabsTrigger value="japanese" className="rounded-2xl py-3">일본어</TabsTrigger>
            <TabsTrigger value="hanja" className="rounded-2xl py-3">한자</TabsTrigger>
            <TabsTrigger value="math" className="rounded-2xl py-3">수학</TabsTrigger>
            <TabsTrigger value="quiz" className="rounded-2xl py-3">퀴즈</TabsTrigger>
          </TabsList>

          <TabsContent value="english">
            <LanguagePanel
              title="영어"
              categories={Object.keys(ENGLISH_DATA)}
              categoryLabels={{ basic: "기초", school: "학교" }}
              value={state.categories.english}
              onChange={(v) => setState((prev) => ({ ...prev, categories: { ...prev.categories, english: v } }))}
              words={todayEnglish}
              onComplete={() => markWordsDone("english")}
              done={currentRecord.englishDone}
            />
          </TabsContent>

          <TabsContent value="japanese">
            <LanguagePanel
              title="일본어"
              categories={Object.keys(JAPANESE_DATA)}
              categoryLabels={{ basic: "기초", greeting: "인사" }}
              value={state.categories.japanese}
              onChange={(v) => setState((prev) => ({ ...prev, categories: { ...prev.categories, japanese: v } }))}
              words={todayJapanese}
              onComplete={() => markWordsDone("japanese")}
              done={currentRecord.japaneseDone}
            />
          </TabsContent>

          <TabsContent value="hanja">
            <LanguagePanel
              title="한자"
              categories={Object.keys(HANJA_DATA)}
              categoryLabels={{ basic: "기초", life: "생활" }}
              value={state.categories.hanja}
              onChange={(v) => setState((prev) => ({ ...prev, categories: { ...prev.categories, hanja: v } }))}
              words={todayHanja}
              onComplete={() => markWordsDone("hanja")}
              done={currentRecord.hanjaDone}
            />
          </TabsContent>

          <TabsContent value="math">
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl">수학 문제 만들기</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <div className="text-sm font-medium mb-2">학년</div>
                    <Select value={state.mathGrade} onValueChange={(v) => setState((prev) => ({ ...prev, mathGrade: v }))}>
                      <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(mathGrades).map(([key, val]) => <SelectItem key={key} value={key}>{val.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">문제 수</div>
                    <Select value={String(state.mathCount)} onValueChange={(v) => setState((prev) => ({ ...prev, mathCount: Number(v) }))}>
                      <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[10, 20, 30].map((n) => <SelectItem key={n} value={String(n)}>{n}문제</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full rounded-2xl" onClick={startMath}>문제 생성</Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                  {mathProblems.map((problem, idx) => (
                    <div key={problem.id} className="rounded-3xl border bg-white p-4">
                      <div className="text-sm text-slate-500 mb-2">문제 {idx + 1}</div>
                      <div className="text-lg sm:text-xl font-bold mb-3">{problem.question}</div>
                      <Input
                        type="number"
                        value={mathAnswers[problem.id] ?? ""}
                        onChange={(e) => setMathAnswers((prev) => ({ ...prev, [problem.id]: e.target.value }))}
                        className="rounded-2xl"
                        placeholder="정답 입력"
                      />
                    </div>
                  ))}
                </div>

                {mathProblems.length > 0 ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="rounded-2xl" onClick={submitMath}>결과 저장</Button>
                    <Button variant="outline" className="rounded-2xl" onClick={startMath}><RotateCcw className="mr-2 h-4 w-4" />다시 만들기</Button>
                  </div>
                ) : null}

                {currentRecord.mathTotal ? (
                  <div className="rounded-3xl bg-emerald-50 p-4 text-emerald-900">
                    최근 기록: {currentRecord.mathCorrect || 0} / {currentRecord.mathTotal} 정답
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <CardTitle className="text-2xl">퀴즈</CardTitle>
                  <div className="flex items-center gap-3">
                    <Select value={quizSubject} onValueChange={(v) => { setQuizSubject(v); restartQuiz(); }}>
                      <SelectTrigger className="w-full sm:w-40 rounded-2xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">영어</SelectItem>
                        <SelectItem value="japanese">일본어</SelectItem>
                        <SelectItem value="hanja">한자</SelectItem>
                        <SelectItem value="math">수학</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="rounded-2xl" onClick={restartQuiz}>처음부터</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{quizIndex + 1} / {quizQuestions.length}</span>
                  <span>현재 점수 {quizScore}</span>
                </div>
                <Progress value={((quizIndex + 1) / quizQuestions.length) * 100} />

                {activeQuiz ? (
                  <div className="rounded-3xl border p-5 bg-white">
                    <div className="text-sm text-slate-500 mb-2">문제</div>
                    <div className="text-xl sm:text-2xl font-bold mb-5 leading-snug">{activeQuiz.prompt}</div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                      {activeQuiz.options.map((option) => {
                        const correct = quizAnswered && option === activeQuiz.answer;
                        const wrong = quizAnswered && option === quizChoice && option !== activeQuiz.answer;
                        return (
                          <button
                            key={option}
                            onClick={() => handleQuizChoice(option)}
                            className={`rounded-2xl border p-4 text-left transition ${correct ? "border-emerald-500 bg-emerald-50" : wrong ? "border-red-500 bg-red-50" : "hover:bg-slate-50"}`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {quizAnswered ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="rounded-2xl" onClick={goNextQuiz}>{quizIndex === quizQuestions.length - 1 ? "결과 저장" : "다음 문제"}</Button>
                  </div>
                ) : null}

                {currentRecord.quizTotal ? (
                  <div className="rounded-3xl bg-violet-50 p-4 text-violet-900">최근 저장 점수: {currentRecord.quizScore} / {currentRecord.quizTotal}</div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LanguagePanel({ title, categories, categoryLabels, value, onChange, words, onComplete, done }) {
  return (
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-2xl">{title} 오늘의 10개 단어</CardTitle>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full sm:w-40 rounded-2xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{categoryLabels[category] || category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          {words.map((item, idx) => (
            <motion.div
              key={`${item.word}-${idx}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border bg-white p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-500">단어 {idx + 1}</div>
                  <div className="text-xl sm:text-2xl font-bold mt-1 break-words">{item.word}</div>
                </div>
                <Badge className="rounded-full">{item.meaning}</Badge>
              </div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-3 sm:p-4 text-sm sm:text-base text-slate-700 leading-6">{item.sentence}</div>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button className="rounded-2xl" onClick={onComplete}>오늘 학습 완료 저장</Button>
          {done ? <Badge className="rounded-full px-4 py-2">완료됨</Badge> : null}
        </div>
      </CardContent>
    </Card>
  );
}
