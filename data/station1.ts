export type Side = "left" | "right";

export interface StationRound {
  id: string;
  video: string;
  type: "poll" | "quiz";
  questionZh: string;
  questionEn: string;
  correctSide?: Side;
  revealZh?: string;
  revealEn?: string;
}

export const station1Rounds: StationRound[] = [
  {
    id: "journey-to-west",
    video: "/videos/Station1(part1).mp4",
    type: "poll",
    questionZh: "你曾经看过《西游记》吗？",
    questionEn: "Have you ever watched Journey to the West?",
  },
  {
    id: "real-person",
    video: "/videos/Station1(part2).mp4",
    type: "quiz",
    questionZh: "你知道《西游记》中的唐三藏，其实是以一位真实的历史人物为原型吗？",
    questionEn: "Did you know Tang Sanzang was based on a real historical figure?",
    correctSide: "left",
    revealZh: "唐三藏的原型是玄奘大师。",
    revealEn: "Tang Sanzang was inspired by Master Xuanzang.",
  },
];

export const finalVideo = "/videos/Station1(part3).mp4";

export const journeyStops = [
  { zh: "长安", en: "CHANG'AN" },
  { zh: "凉州", en: "LIANGZHOU" },
  { zh: "敦煌", en: "DUNHUANG" },
  { zh: "高昌", en: "GAOCHANG" },
  { zh: "天竺", en: "INDIA" },
];
