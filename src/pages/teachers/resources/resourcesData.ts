import {
  BookOpen,
  Gamepad2,
  Users,
  Globe,
  FileText,
  LibraryBig,
  GraduationCap,
  Headphones,
  Mic,
  Sparkles,
  ShoppingCart,
  MessageCircle,
  Music,
  Video,
} from "lucide-react";

export type ResourceLink = {
  name: string;
  type: string;
  url: string;
  description?: string;
  icon?: any;
};

export type ResourceCategory = {
  title: string;
  icon: any;
  description: string;
  resources: ResourceLink[];
};

export type TeachingGame = {
  id: string;
  title: string;
  audience: string;
  icon: any;
  shortDescription: string;
  steps: string[];
  illustrationEmoji: string;
  illustrationLabel: string;
};

export type TeachingGameCategory = {
  title: string;
  description: string;
  icon: any;
  games: TeachingGame[];
};

export const resourceCategories: ResourceCategory[] = [
  {
    title: "Worksheets & Lesson Materials",
    icon: FileText,
    description: "Ready-made lessons, worksheets, and classroom activities",
    resources: [
      {
        name: "LinguaHouse",
        type: "Lessons",
        url: "https://www.linguahouse.com/en-GB",
        description: "Lesson plans and worksheets (teens/adults + some kids; free + paid; includes IELTS).",
        icon: BookOpen,
      },
      {
        name: "One Stop English",
        type: "Lessons",
        url: "https://www.onestopenglish.com/",
        description: "Resources for all ages (paid; limited free per user).",
        icon: BookOpen,
      },
      {
        name: "Games4ESL",
        type: "Kids Lessons",
        url: "https://games4esl.com/",
        description: "Games, videos and lesson plans for young learners.",
        icon: BookOpen,
      },
      {
        name: "ESL Brains",
        type: "Lessons",
        url: "https://eslbrains.com/",
        description: "Worksheets for teens/adults (some free; paid membership available).",
        icon: FileText,
      },
      {
        name: "ISL Collective",
        type: "Worksheets",
        url: "https://en.islcollective.com/",
        description: "Free worksheets for all ages.",
        icon: FileText,
      },
      {
        name: "Teach-This",
        type: "Worksheets",
        url: "https://www.teach-this.com/",
        description: "Paid worksheets + free teaching tips by topic.",
        icon: FileText,
      },
      {
        name: "TEFL Lemon",
        type: "Resources",
        url: "https://www.tefllemon.com/",
        description: "Free resources for teens/adults (pre-intermediate+), plus some kids flashcard games.",
        icon: FileText,
      },
      {
        name: "Ellii",
        type: "Lessons",
        url: "https://ellii.com/",
        description: "Teacher resource library (paid).",
        icon: BookOpen,
      },
      {
        name: "Tim’s Free Lesson Plans",
        type: "Lessons",
        url: "https://freeenglishlessonplans.com/",
        description: "Free lesson plans (mostly teens/adults).",
        icon: BookOpen,
      },
      {
        name: "Fluentize",
        type: "Worksheets",
        url: "https://app.fluentize.com/",
        description: "Free worksheets for teens/adults.",
        icon: FileText,
      },
      {
        name: "Debatable English",
        type: "Speaking",
        url: "https://debatableenglish.wordpress.com/",
        description: "Free speaking worksheets (teens/adults).",
        icon: MessageCircle,
      },
      {
        name: "EnglishHubPro",
        type: "Lessons",
        url: "https://enghub.pro/",
        description: "Lesson plans and materials for all ages (free + paid).",
        icon: FileText,
      },
      {
        name: "ESL Pals",
        type: "Lessons",
        url: "https://eslpals.com/",
        description: "Lesson plans for online/offline teaching (free + paid).",
        icon: FileText,
      },
      {
        name: "The English Flows",
        type: "Lessons",
        url: "https://theenglishflows.com/",
        description: "Teen/adult lesson plans (mostly paid; some free).",
        icon: FileText,
      },
    ],
  },
  {
    title: "Interactive Games & Classroom Tools",
    icon: Gamepad2,
    description: "Interactive tools and games for engagement",
    resources: [
      { name: "Wordwall", type: "Games", url: "https://wordwall.net/", description: "Interactive games for all ages (free).", icon: Gamepad2 },
      { name: "Kahoot", type: "Games", url: "https://kahoot.com/", description: "Interactive quizzes for all ages.", icon: Gamepad2 },
      { name: "Blooket", type: "Games", url: "https://www.blooket.com/", description: "Interactive games for all ages.", icon: Gamepad2 },
      { name: "Baamboozle", type: "Games", url: "https://www.baamboozle.com/", description: "Whole-class vocabulary game.", icon: Gamepad2 },
      { name: "Games to Learn English", type: "Games", url: "https://www.gamestolearnenglish.com/", description: "Downloadable classroom games.", icon: Gamepad2 },
      { name: "Quizlet", type: "Flashcards", url: "https://quizlet.com/", description: "Flashcards + study games (free + paid).", icon: Gamepad2 },
      { name: "Wayground", type: "Tools", url: "https://wayground.com/?lng=en", description: "Classroom tracker + interactive games.", icon: Users },
    ],
  },
  {
    title: "Reference & Teacher Support",
    icon: LibraryBig,
    description: "Dictionaries, pronunciation, and trusted content",
    resources: [
      { name: "Oxford Learner’s Dictionaries", type: "Dictionary", url: "https://www.oxfordlearnersdictionaries.com/", description: "Free learner dictionary + paid thesaurus.", icon: LibraryBig },
      { name: "Collins Learner’s Dictionary", type: "Dictionary", url: "https://www.collinsdictionary.com/", description: "Free online dictionary.", icon: LibraryBig },
      { name: "English Current", type: "Worksheets", url: "https://www.englishcurrent.com/", description: "Free and paid worksheets/videos (teens/adults).", icon: Globe },
      { name: "BBC Learning English (Teachers)", type: "Videos", url: "https://www.bbc.co.uk/learningenglish/english/teachers", description: "Teaching different skills with lots of videos.", icon: Video },
      { name: "Voice of America (Learning English)", type: "Videos", url: "https://learningenglish.voanews.com/", description: "Free video lessons for explaining topics.", icon: Video },
      { name: "YouGlish", type: "Pronunciation", url: "https://youglish.com/", description: "Pronunciation practice across accents.", icon: Mic },
      { name: "LyricsTraining (LingoClip)", type: "Listening", url: "https://lingoclip.com/", description: "Listening practice using songs (teens/adults).", icon: Music },
    ],
  },
  {
    title: "IELTS, SAT & Exam Prep",
    icon: GraduationCap,
    description: "Exam-specific lesson plans and practice materials",
    resources: [
      { name: "British Council – Teach IELTS", type: "IELTS", url: "https://takeielts.britishcouncil.org/teach-ielts/teaching-resources", description: "Free IELTS lesson plans.", icon: GraduationCap },
      { name: "Khan Academy", type: "SAT", url: "https://www.khanacademy.org/", description: "Free SAT lessons and practice.", icon: GraduationCap },
      { name: "Off2Class", type: "IELTS & SAT", url: "https://www.off2class.com/", description: "Online lessons (paid + some free).", icon: GraduationCap },
      { name: "Twee", type: "IELTS", url: "https://app.twee.com/", description: "Lesson generator with IELTS materials (paid).", icon: Sparkles },
    ],
  },
  {
    title: "British Council (Adults / Teens / Kids)",
    icon: Globe,
    description: "Age-targeted free worksheets and lesson plans",
    resources: [
      { name: "LearnEnglish (Adults)", type: "Adults", url: "https://learnenglish.britishcouncil.org/", description: "Free resources and seminars for adults.", icon: Globe },
      { name: "LearnEnglish Teens", type: "Teens", url: "https://learnenglishteens.britishcouncil.org/", description: "Free resources and seminars for teens.", icon: Globe },
      { name: "LearnEnglish Kids", type: "Kids", url: "https://learnenglishkids.britishcouncil.org/", description: "Free resources and seminars for kids.", icon: Globe },
    ],
  },
  {
    title: "Kids & Phonics",
    icon: BookOpen,
    description: "Young learner activities + phonics practice",
    resources: [
      { name: "ESL KidStuff", type: "Kids Lessons", url: "https://eslkidstuff.com/", description: "Free lesson plans for kids (up to ~10).", icon: BookOpen },
      { name: "Education.com", type: "Kids", url: "https://www.education.com/", description: "Kids resources + interactive games (limited free).", icon: Gamepad2 },
      { name: "Twinkl", type: "Kids", url: "https://www.twinkl.com/", description: "Free and paid lessons + games for kids.", icon: FileText },
      { name: "Starfall", type: "Phonics", url: "https://www.starfall.com/", description: "Phonics practice and games for young learners.", icon: BookOpen },
      { name: "PhonicsPlay", type: "Phonics", url: "https://phonicsplaycomics.co.uk/", description: "Phonics games + reading practice.", icon: BookOpen },
      { name: "Phonics Bloom", type: "Phonics", url: "https://www.phonicsbloom.com/", description: "Phonics games for ages ~4–7.", icon: BookOpen },
    ],
  },
  {
    title: "Teacher Marketplaces & Communities",
    icon: ShoppingCart,
    description: "Paid + community-shared teaching materials",
    resources: [
      { name: "Teachers Pay Teachers", type: "Marketplace", url: "https://www.teacherspayteachers.com/", description: "Paid worksheets and resources for all levels.", icon: ShoppingCart },
      { name: "Share My Lesson", type: "Community", url: "https://sharemylesson.com/", description: "Teaching ideas and resources (some free, some paid).", icon: Users },
      { name: "The Economist Educational Foundation", type: "Discussion", url: "https://talk.economistfoundation.org/", description: "Free lesson plans (upper-intermediate+).", icon: MessageCircle },
    ],
  },
  {
    title: "AI & Lesson Planning Helpers",
    icon: Sparkles,
    description: "AI tools to generate lesson plans and activities",
    resources: [
      { name: "MagicSchool AI", type: "AI Planning", url: "https://www.magicschool.ai/", description: "AI lesson plan generator (free + paid).", icon: Sparkles },
    ],
  },
];

// NOTE: Teaching Aid Games are rendered on a dedicated page and kept in that file
// to avoid bloating the hub + link pages.
export const TEACHING_GAMES_COUNT = 23;

export function getCounts() {
  const linkCount = resourceCategories.reduce((sum, c) => sum + (c.resources?.length || 0), 0);
  return {
    linkCount,
    gameCount: TEACHING_GAMES_COUNT,
    categoriesCount: resourceCategories.length,
    totalItems: linkCount + TEACHING_GAMES_COUNT,
  };
}

export const hubSections = {
  resourceLinks: ["Worksheets & Lesson Materials", "Interactive Games & Classroom Tools", "Reference & Teacher Support", "British Council (Adults / Teens / Kids)", "Teacher Marketplaces & Communities"],
  examPrep: ["IELTS, SAT & Exam Prep"],
  kidsPhonics: ["Kids & Phonics"],
  aiTools: ["AI & Lesson Planning Helpers"],
};


