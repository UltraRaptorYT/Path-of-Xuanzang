export type Side = "left" | "right";

export interface StationChoice {
  zh: string;
  en: string;
}

export interface StationRound {
  id: string;
  video: string;
  type: "poll" | "quiz";
  questionZh: string;
  questionEn: string;
  choices: Record<Side, StationChoice>;
  correctSide?: Side;
  revealZh?: string;
  revealEn?: string;
}

export const station1Rounds: StationRound[] = [
  {
    id: "journey-to-west",
    video: "/videos/Station1(pt1).mp4",
    type: "poll",
    questionZh: "你曾经看过《西游记》吗？",
    questionEn: "Have you ever watched Journey to the West?",
    choices: {
      left: { zh: "是", en: "Yes" },
      right: { zh: "否", en: "No" },
    },
  },
  {
    id: "real-person",
    video: "/videos/Station1(pt2).mp4",
    type: "poll",
    questionZh:
      "你知道《西游记》中的唐三藏，其实是以一位真实的历史人物为原型吗？",
    questionEn:
      "Did you know Tang Sanzang was based on a real historical figure?",
    choices: {
      left: { zh: "是", en: "Yes" },
      right: { zh: "否", en: "No" },
    },
    revealZh:
      "唐三藏的原型是唐代高僧玄奘大师（602–664年），他亲自前往印度求取佛法。",
    revealEn:
      "Tang Sanzang was inspired by Master Xuanzang (602–664 CE), a Tang Dynasty monk who travelled to India to seek authentic Buddhist teachings.",
  },
  {
    id: "facing-distress",
    video: "/videos/Station1(pt3).mp4",
    type: "quiz",
    questionZh: "面对困境时，玄奘大师是如何面对的呢？",
    questionEn: "When faced with distress, what did Master Xuanzang do?",
    choices: {
      left: {
        zh: "坚定求法，克服困难",
        en: "Persevere through every obstacle to seek the Dharma",
      },
      right: { zh: "呼救：悟空救我！", en: "Cry for help: “Wukong, save me!”" },
    },
    correctSide: "left",
    revealZh: "他依靠坚定不退的求法愿心、对三宝的信心，以及利益众生的发心。",
    revealEn:
      "He relied on his unwavering resolve to seek the Dharma, his faith in the Three Jewels, and his aspiration to benefit all sentient beings.",
  },
  {
    id: "fearless-monk",
    video: "/videos/Station1(pt4).mp4",
    type: "quiz",
    questionZh: "玄奘大师是一位柔弱、需要孙悟空保护的僧人吗？",
    questionEn:
      "Was Master Xuanzang a weak monk who needed protection from Sun Wukong?",
    choices: {
      left: {
        zh: "是：需要神通弟子保护",
        en: "Yes: a timid traveller protected by magical disciples",
      },
      right: {
        zh: "否：无畏求法者, 独自穿越险境",
        en: "No: a fearless monk who crossed deserts, mountains, bandits and kings alone",
      },
    },
    correctSide: "right",
    revealZh:
      "真实的玄奘无须孙悟空相助。他用十七年跋涉约两万五千公里，凭着自己的信念、毅力与智慧，将佛法带回中土。",
    revealEn:
      "The real Xuanzang needed no Monkey King. Across 17 years and roughly 25,000 km, his own courage and unwavering vow carried the Dharma home.",
  },
  {
    id: "purpose-of-india-journey",
    video: "/videos/Station1(pt5).mp4",
    type: "quiz",
    questionZh: "玄奘大师前往印度的主要目的是什么？",
    questionEn: "What was Master Xuanzang’s main purpose for going to India?",
    choices: {
      left: {
        zh: "求取原典，厘清佛法分歧",
        en: "Find original scriptures and resolve conflicting teachings",
      },
      right: {
        zh: "冒险度假，寻找法宝",
        en: "Adventure and holiday: find magical treasures",
      },
    },
    correctSide: "left",
    revealZh: "他为求法而远行，希望正确、完整地理解佛陀的教法。",
    revealEn:
      "He went to seek the Dharma, hoping to understand the Buddha’s teachings correctly and completely.",
  },
];

export const journeyStops = [
  {
    zh: "洛阳｜起点",
    en: "Luoyang · Starting point",
    detailZh: "隋末战乱，玄奘离开洛阳。",
    detailEn: "Xuanzang leaves Luoyang amid the turmoil at the end of the Sui dynasty.",
  },
  {
    zh: "长安｜初次求学",
    en: "Chang’an · First studies",
    detailZh: "在长安研习佛法，拜访高僧。",
    detailEn: "He studies Buddhist teachings and visits respected masters.",
  },
  {
    zh: "四川｜空慧寺",
    en: "Sichuan · Konghui Temple",
    detailZh: "广学经论，参访诸位大德。",
    detailEn: "He studies widely and learns from teachers in Sichuan.",
  },
  {
    zh: "四川｜三年精进",
    en: "Sichuan · Three years of study",
    detailZh: "深入研习当地法师讲授的经论。",
    detailEn: "Three years of focused study with local masters.",
  },
  {
    zh: "长江三峡｜险途",
    en: "Three Gorges · Perilous crossing",
    detailZh: "独自踏上西行路，经历艰险水路。",
    detailEn: "He faces a dangerous river crossing on the journey west.",
  },
  {
    zh: "长安｜重返长安",
    en: "Chang’an · Return",
    detailZh: "回到长安继续参访、求学。",
    detailEn: "He returns to Chang’an and continues his studies.",
  },
  {
    zh: "长安｜发现经书残缺",
    en: "Chang’an · A discovery",
    detailZh: "发现汉译佛经仍有缺漏与分歧。",
    detailEn: "He finds gaps and conflicting interpretations in Chinese scriptures.",
  },
  {
    zh: "长安｜决意西行",
    en: "Chang’an · The vow",
    detailZh: "为求完整佛法，决定亲赴印度。",
    detailEn: "He vows to travel to India for complete Buddhist teachings.",
  },
];
