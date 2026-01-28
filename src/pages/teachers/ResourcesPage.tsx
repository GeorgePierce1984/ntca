import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Gamepad2,
  Download,
  Video,
  Users,
  Globe,
  FileText,
  ExternalLink,
  LibraryBig,
  GraduationCap,
  Headphones,
  Mic,
  Sparkles,
  ShoppingCart,
  MessageCircle,
  Music,
  Volume2,
  X,
  FileDown,
  ClipboardList,
  Shuffle,
  Target,
  Timer,
  Trophy,
} from 'lucide-react';
import { PageTemplate } from '@/components/PageTemplate';
import html2canvas from 'html2canvas';

export const ResourcesPage: React.FC = () => {
  type TeachingGame = {
    id: string;
    title: string;
    audience: string;
    icon: any;
    shortDescription: string;
    steps: string[];
    illustrationEmoji: string;
    illustrationLabel: string;
  };

  const gamesByCategory: Array<{
    title: string;
    description: string;
    icon: any;
    games: TeachingGame[];
  }> = [
    {
      title: "Young Learners (Kindergarten & Primary)",
      description: "High-energy movement + flashcard games for early learners.",
      icon: Trophy,
      games: [
        {
          id: "duck-duck-goose",
          title: "Duck Duck Goose",
          audience: "Young learners",
          icon: Trophy,
          shortDescription: "A classic circle chase game adapted for flashcard vocabulary.",
          illustrationEmoji: "🦆",
          illustrationLabel: "Cartoon ducks",
          steps: [
            "Choose a topic (flashcards).",
            "Instruct learners to sit on the floor in a circle.",
            "Demonstrate the game by taking 2 flashcards and walking around the circle tapping the students on the head with one flashcard after 3 or 4 students switch flashcard and encourage student who you have touched to run after you and then sit down in their place.",
            "Give the student the chance to do the same as you to make sure of understanding by the group.",
            "Now play with students.",
            "If the student doesn’t manage to sit down then give them different flashcards.",
            "After 2 or three students have been change the flashcards.",
          ],
        },
        {
          id: "cowboy-flashcards",
          title: "Cowboy Flashcards",
          audience: "Young learners",
          icon: Shuffle,
          shortDescription: "Quick-draw vocabulary duel (great for energy + recall).",
          illustrationEmoji: "🤠",
          illustrationLabel: "Cowboy showdown",
          steps: [
            "Choose 1 strong student and stand back to back with them.",
            "Give them a flashcard and take a flashcard yourself.",
            "Explain that you are going to count to three and as you count to three as you walk away from each other.",
            "When you say turn the student has to turn and say your word and you have to say the students word whoever says the word first is the winner.",
            "Split students into teams to create more interest.",
            "Pick 2 students and put them back to back.",
            "Repeat the steps in 3 and 4.",
          ],
        },
        {
          id: "flyswatter",
          title: "Flyswatter",
          audience: "Young learners",
          icon: Target,
          shortDescription: "Fast recognition race—students swat the correct flashcard.",
          illustrationEmoji: "🪰",
          illustrationLabel: "Flyswatter challenge",
          steps: [
            "Put a table in the middle of the classroom or stick the flashcards to the board.",
            "Put 2 flashcards on the table on the board you can use 3 or 4 flashcards dependant on level and take choose 2 stronger students give them a flyswatter each.",
            "Say a word and encourage the student to slap the correct word whoever slaps the correct word first is the winner.",
          ],
        },
        {
          id: "jump-cards",
          title: "Jump Cards",
          audience: "Young learners",
          icon: Timer,
          shortDescription: "Movement-based vocabulary: jump to the correct card.",
          illustrationEmoji: "🦘",
          illustrationLabel: "Jumping game",
          steps: [
            "Lay out 4 or 5 flashcards on the ground and pick 2 stronger students.",
            "Put one student either side of the flashcards.",
            "Say one word and jump to the correct word with the students.",
            "Once the students understand say word and allow students to jump to the card.",
            "Repeat 2 or 3 times with the students and then allow 2 new students to try.",
          ],
        },
      ],
    },
    {
      title: "Young Learners & Teens (Vocabulary Games)",
      description: "Simple competition games that keep students motivated.",
      icon: Gamepad2,
      games: [
        {
          id: "trashcan-basketball",
          title: "Trashcan Basketball",
          audience: "Young learners & teens",
          icon: Trophy,
          shortDescription: "Say the word, shoot the ball—points for accuracy.",
          illustrationEmoji: "🏀",
          illustrationLabel: "Basketball hoop",
          steps: [
            "Write some target vocabulary on A4 paper.",
            "Put a trashcan in the centre of the classroom.",
            "Demonstrate by screwing up one of the words and standing at designated spot say the word and throw the ball you have created. If it goes in the trashcan you get a point.",
            "Split the students into teams and get them to line up.",
            "Students take turns if they get it in the trashcan award a point.",
          ],
        },
        {
          id: "vocabulary-tennis",
          title: "Vocabulary Tennis",
          audience: "Young learners & teens",
          icon: Shuffle,
          shortDescription: "Rapid category recall—pass the “ball” with a new word + name.",
          illustrationEmoji: "🎾",
          illustrationLabel: "Tennis rally",
          steps: [
            "Choose target vocabulary.",
            "Explain you will say a word and a students name.",
            "The student whose name you have said then needs to say a different word in the same category and another students name. (choose a stronger student).",
            "If the student doesn’t say the word in a preset time (5 seconds) or repeats a word then they are out.",
            "Continue until you have 1 or 2 students left they are the winners.",
          ],
        },
        {
          id: "paper-fight",
          title: "Paper Fight",
          audience: "Young learners & teens",
          icon: Target,
          shortDescription: "Vocabulary snowballs—throw, catch, recall, and check if needed.",
          illustrationEmoji: "🧻",
          illustrationLabel: "Paper snowballs",
          steps: [
            "Make some flashcards with the target vocabulary you have been learning.",
            "Drill the words with students.",
            "After drilling screw up one card and say the word and throw it to a student (stronger student is best).",
            "Elicit that they have to throw it to another student.",
            "Once the first ball has been thrown to two or three students add another word.",
            "Add more words up to ten.",
            "When students cant remember they can open the balls to check.",
            "Students love this game.",
          ],
        },
      ],
    },
    {
      title: "Adults & Teens (Listening / Reading / Classroom Routines)",
      description: "Low-prep games to focus students and build interaction.",
      icon: Headphones,
      games: [
        {
          id: "listening-bingo",
          title: "Listening Bingo (all levels)",
          audience: "Adults & teens",
          icon: Headphones,
          shortDescription: "Students cross off words as they hear them in an audio.",
          illustrationEmoji: "🎧",
          illustrationLabel: "Listening bingo",
          steps: [
            "Look at the audio script and create bingo cards with words (high frequency words or target vocabulary are the best to choose) from the audio. (12 by twelve is usually enough for higher levels you can use more) https://bingobaker.com/",
            "Handout bingo cards one per student.",
            "Elicit and explain instructions for student using ICQs to check understanding.",
            "Explain its not like usual bingo and explain the students will listen to an audio when they hear their words they can cross them out.",
            "Explain/Elicit the winner is the first person to shout bingo.",
            "Once you have found a winner continue to play the audio to allow the other students to find their words and shout bingo.",
          ],
        },
        {
          id: "listening-focus",
          title: "Listening Focus (all levels)",
          audience: "Adults & teens",
          icon: Headphones,
          shortDescription: "Students stand up when they hear their assigned words.",
          illustrationEmoji: "🧠",
          illustrationLabel: "Focus + listening",
          steps: [
            "Make cards for each student choose 3 or 4 high frequency words from the audio script.",
            "Handout the cards.",
            "Explain that the students have to stand up when they hear their words in the audio.",
            "Practice by saying the words yourself to check understanding and allowing the students to stand up when they hear their words.",
            "Play the audio and watch as chaos ensues my students love this game and its great for focusing students for listening.",
          ],
        },
        {
          id: "keyhole-reading",
          title: "Keyhole Reading (pre-intermediate+)",
          audience: "Adults & teens",
          icon: BookOpen,
          shortDescription: "Students predict a text from a tiny visible “keyhole”.",
          illustrationEmoji: "🔎",
          illustrationLabel: "Keyhole view",
          steps: [
            "Check the reading you are going to give students in class and make pieces of paper the correct size to cover them.",
            "Cut holes in the paper make 2 separate sets of holes (one hole in each piece of paper) if you have even numbers.",
            "If students have books don’t allow them to open them.",
            "Explain the students are going to try to guess what they are going to be reading about from what they can see.",
            "Ask students to close their eyes.",
            "Open books or give handouts with the reading covered.",
            "Ask students to open their eyes.",
            "Explain and demonstrate the students can’t take the paper off the book or handout but they can rotate it.",
            "Put students in pairs and let them read and guess for 1 to 2 minutes.",
            "Elicit some ideas from the students.",
            "Allow them to uncover the reading and see if their ideas were right.",
          ],
        },
        {
          id: "board-race-vocab",
          title: "Board Race Vocabulary (all levels)",
          audience: "Adults & teens",
          icon: Trophy,
          shortDescription: "Teams race to write category words—one word per turn.",
          illustrationEmoji: "🧑‍🏫",
          illustrationLabel: "Board race",
          steps: [
            "Choose a category you are going to teach about and the students know about for example countries or colours.",
            "Split the students into two teams and draw a line down the middle of the board.",
            "Put the students in two lines and explain that for each turn that a student can only write one word use ICQ’s to check understanding.",
            "Give students a time limit up to 3 minutes.",
            "Once the time is up ask students to sit down.",
            "Count the words with students spelling isn’t important at this stage. The winner is the team with the most words.",
          ],
        },
        {
          id: "stickman-description",
          title: "Stickman Description (all levels) – New class",
          audience: "Adults & teens",
          icon: ClipboardList,
          shortDescription: "A fun “get to know you” guessing game using a stickman profile.",
          illustrationEmoji: "🧍",
          illustrationLabel: "Stickman profile",
          steps: [
            "This is good for new students and classes.",
            "Draw a stickman on the board.",
            "Put some facts about yourself around the stickman.",
            "Explain students must guess your facts (make them more complicated for higher levels eg shoe size and easier for lower levels eg favourite colours).",
            "Once students have guessed your facts handout a piece of paper and allow students to draw themselves.",
            "Once students have drawn themselves use ICQ’s to check understanding and split them into pairs (allow students three guesses per fact don’t just tell each other if they don’t get it first try).",
          ],
        },
        {
          id: "two-truths-one-lie",
          title: "2 Truths 1 Lie (all levels) – New class",
          audience: "Adults & teens",
          icon: Shuffle,
          shortDescription: "Students ask questions to uncover the lie—great for speaking.",
          illustrationEmoji: "🕵️",
          illustrationLabel: "Detective",
          steps: [
            "Tell students 3 facts about you.",
            "Explain 1 isn’t true and the students need to guess by asking questions they cannot just say until they guess.",
            "Once they have worked out your lie split them into pairs.",
            "Allow students to play for 5 minutes and then elicit the facts about their partners from them.",
          ],
        },
        {
          id: "m-and-ms-facts",
          title: "M and Ms Facts (all levels) – New class",
          audience: "Adults & teens",
          icon: Trophy,
          shortDescription: "A sweet icebreaker—one sweet equals one fact to share.",
          illustrationEmoji: "🍫",
          illustrationLabel: "M&Ms facts",
          steps: [
            "Bring a bag of M and M’s or similar to class.",
            "Tell students the M and Ms are for them.",
            "First demonstrate by taking 2 M and Ms and telling students 2 facts about you. Eg I speak French I like bananas.",
            "Then tell students that they can take as many M and Ms as they like but they must tell the whole class a fact for each M and Ms use ICQ’s to check understanding (students come to the front of the class one by one and take some M and M’s maximum 5 and tell their facts before they can eat them).",
          ],
        },
      ],
    },
    {
      title: "Teens & Adults (Longer Games / Coolers)",
      description: "Structured activities for reading, speaking, and teamwork.",
      icon: ClipboardList,
      games: [
        {
          id: "coffee-pot",
          title: "Coffee Pot (intermediate+)",
          audience: "Teens & adults",
          icon: Shuffle,
          shortDescription: "Guess the mystery verb—every use becomes “coffeepot”.",
          illustrationEmoji: "☕",
          illustrationLabel: "Coffee pot",
          steps: [
            "Stand in the middle of the classroom.",
            "Choose a verb and explain that you can’t say the word and that it will be replaced by coffeepot.",
            "ICQ’s.",
            "Students must ask you questions remembering that coffeepot is a verb.",
            "If a student guesses correctly then it is their turn to think.",
            "Abstract verbs are hardest to guess for higher levels explain this.",
          ],
        },
        {
          id: "running-dictation",
          title: "Running Dictation (pre-intermediate+)",
          audience: "Teens & adults",
          icon: Timer,
          shortDescription: "Runner reads, writer writes—accuracy wins.",
          illustrationEmoji: "🏃",
          illustrationLabel: "Running dictation",
          steps: [
            "Put a level appropriate text on the wall somewhere in school (be safe). If this isn’t possible use the board remember you need one text per group.",
            "Explain students will work in pairs and that they need to choose a runner and a writer.",
            "The runner needs to find the text and read it and remember as much as possible.",
            "Once they remember run back to their partner and tell them what they remember and their partner must write down what they are told.",
            "The team that finishes first can then read the text and check how close they are to the original text.",
            "The closest team to the original are the winners not the fastest team.",
          ],
        },
        {
          id: "translated-text",
          title: "Translated Text (intermediate+)",
          audience: "Teens & adults",
          icon: FileText,
          shortDescription: "Spot errors from translation back-and-forth—great for noticing language.",
          illustrationEmoji: "🌍",
          illustrationLabel: "Translation challenge",
          steps: [
            "Take the text you are reading in class and translate it into the students language and then translate it back into English. (If the text is too long or your students aren’t strong enough choose a paragraph).",
            "Give one copy of the translated text to a pair of students.",
            "Explain that they need to find differences and mistakes in the translated text.",
            "The team to find all mistakes and differences are the winners.",
            "Make sure you have found all of the mistakes and differences yourself.",
          ],
        },
        {
          id: "never-have-i-ever",
          title: "Never Have I Ever (present perfect practice)",
          audience: "Teens & adults",
          icon: Users,
          shortDescription: "Present perfect speaking practice with fingers down.",
          illustrationEmoji: "✋",
          illustrationLabel: "Fingers game",
          steps: [
            "Everyone holds up 5 fingers (or 3 for shorter rounds).",
            "One student says a sentence starting with “Never have I ever…”.",
            "If you HAVE done the action, you put one finger down.",
            "If you HAVE NOT done it, keep your finger up.",
            "The next student takes a turn.",
            "The game continues until one person has no fingers left — that person is out.",
          ],
        },
      ],
    },
  ];

  const [selectedGame, setSelectedGame] = useState<TeachingGame | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const pdfAreaRef = useRef<HTMLDivElement | null>(null);

  const allGamesCount = useMemo(
    () => gamesByCategory.reduce((sum, cat) => sum + cat.games.length, 0),
    [gamesByCategory]
  );

  const downloadSelectedGameAsPDF = async () => {
    if (!selectedGame) return;
    const node = pdfAreaRef.current;
    if (!node) return;

    // Turn the printable card into an image, then open a print dialog (Save as PDF).
    const canvas = await html2canvas(node, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    });
    const dataUrl = canvas.toDataURL("image/png");

    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return;

    w.document.open();
    w.document.write(`
      <html>
        <head>
          <title>${selectedGame.title} - Teaching Aid</title>
          <meta charset="utf-8" />
          <style>
            body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; }
            .page { padding: 24px; }
            img { width: 100%; height: auto; display: block; }
            @media print {
              .page { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <img src="${dataUrl}" alt="Printable" />
          </div>
          <script>
            window.onload = () => {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    w.document.close();
  };
  const resourceCategories: Array<{
    title: string;
    icon: any;
    description: string;
    resources: Array<{
      name: string;
      type: string;
      url: string;
      description?: string;
      icon?: any;
    }>;
  }> = [
    {
      title: "Worksheets & Lesson Materials",
      icon: FileText,
      description: "Ready-made lessons, worksheets, and classroom activities",
      resources: [
        {
          name: "LinguaHouse",
          type: "Lessons",
          url: "https://www.linguahouse.com/en-GB",
          description: "High-quality ESL lesson plans, worksheets, and topic-based materials.",
          icon: BookOpen,
        },
        {
          name: "One Stop English",
          type: "Lessons",
          url: "https://www.onestopenglish.com/",
          description: "Lesson plans and activities for all ages (paid; limited free resources).",
          icon: BookOpen,
        },
        {
          name: "Games4ESL",
          type: "Activities",
          url: "https://games4esl.com/",
          description: "Printable worksheets and classroom games for ESL learners.",
          icon: BookOpen,
        },
        {
          name: "ESL Brains",
          type: "Lessons",
          url: "https://eslbrains.com/",
          description: "Modern ESL lesson plans and worksheets (great for teens/adults).",
          icon: FileText,
        },
        {
          name: "ISL Collective",
          type: "Worksheets",
          url: "https://en.islcollective.com/",
          description: "Huge library of teacher-made worksheets and printable activities.",
          icon: FileText,
        },
        {
          name: "Teach-This",
          type: "Worksheets",
          url: "https://www.teach-this.com/",
          description: "Topic-based materials and classroom activities (paid; some free tips).",
          icon: FileText,
        },
        {
          name: "TEFL Lemon",
          type: "Resources",
          url: "https://www.tefllemon.com/",
          description: "Printable resources for teens/adults (pre-intermediate+), plus some kids flashcard games.",
          icon: FileText,
        },
        {
          name: "Ellii",
          type: "Lessons",
          url: "https://ellii.com/",
          description: "Teacher resource library with worksheets and lesson plans (paid).",
          icon: BookOpen,
        },
        {
          name: "Tim’s Free Lesson Plans",
          type: "Lessons",
          url: "https://freeenglishlessonplans.com/",
          description: "Free lesson plans (mostly teens and adults).",
          icon: BookOpen,
        },
        {
          name: "Fluentize",
          type: "Worksheets",
          url: "https://app.fluentize.com/",
          description: "Free worksheets for teens and adults.",
          icon: FileText,
        },
        {
          name: "Debatable English",
          type: "Speaking",
          url: "https://debatableenglish.wordpress.com/",
          description: "Free speaking-focused worksheets (mostly teens and adults).",
          icon: MessageCircle,
        },
      ],
    },
    {
      title: "Interactive Games & Classroom Tools",
      icon: Gamepad2,
      description: "Engaging game-based tools for live lessons and practice",
      resources: [
        {
          name: "Wordwall",
          type: "Games",
          url: "https://wordwall.net/",
          description: "Create and play interactive classroom activities (free and paid).",
          icon: Gamepad2,
        },
        {
          name: "Kahoot!",
          type: "Quizzes",
          url: "https://kahoot.com/",
          description: "Live quizzes for whole-class engagement (great for review).",
          icon: Gamepad2,
        },
        {
          name: "Blooket",
          type: "Games",
          url: "https://www.blooket.com/",
          description: "Game modes powered by question sets—fun and fast to run.",
          icon: Gamepad2,
        },
        {
          name: "Baamboozle",
          type: "Games",
          url: "https://www.baamboozle.com/",
          description: "Simple classroom games—perfect for warmers and revision.",
          icon: Gamepad2,
        },
        {
          name: "Games to Learn English",
          type: "Practice",
          url: "https://www.gamestolearnenglish.com/",
          description: "Interactive online games for vocabulary and grammar practice.",
          icon: Gamepad2,
        },
        {
          name: "Quizlet",
          type: "Flashcards",
          url: "https://quizlet.com/",
          description: "Flashcards and study games for all ages (free; some content paid).",
          icon: Gamepad2,
        },
        {
          name: "Wayground",
          type: "Classroom Tools",
          url: "https://wayground.com/?lng=en",
          description: "Classroom tracker and interactive games for all ages.",
          icon: Users,
        },
      ],
    },
    {
      title: "Reference & Teacher Support",
      icon: LibraryBig,
      description: "Reference tools and quick support for lessons",
      resources: [
        {
          name: "Oxford Learner’s Dictionaries",
          type: "Dictionary",
          url: "https://www.oxfordlearnersdictionaries.com/",
          description: "Learner-friendly definitions, pronunciation, and examples.",
          icon: LibraryBig,
        },
        {
          name: "Collins Learner’s Dictionary",
          type: "Dictionary",
          url: "https://www.collinsdictionary.com/",
          description: "Free online dictionary and learner-friendly definitions.",
          icon: LibraryBig,
        },
        {
          name: "English Current",
          type: "Articles",
          url: "https://www.englishcurrent.com/",
          description: "Grammar explanations, worksheets, and lesson support content.",
          icon: Globe,
        },
        {
          name: "BBC Learning English (Teachers)",
          type: "Videos & Lessons",
          url: "https://www.bbc.co.uk/learningenglish/english/teachers",
          description: "Skill-focused teaching resources with lots of videos.",
          icon: Video,
        },
        {
          name: "Voice of America (Learning English)",
          type: "Videos",
          url: "https://learningenglish.voanews.com/",
          description: "Free video lessons and topic explanations for different levels.",
          icon: Video,
        },
      ],
    },
    {
      title: "IELTS, SAT & Exam Prep",
      icon: GraduationCap,
      description: "Exam-focused lessons and practice materials",
      resources: [
        {
          name: "British Council – Teach IELTS",
          type: "IELTS",
          url: "https://takeielts.britishcouncil.org/teach-ielts/teaching-resources",
          description: "Free IELTS teaching resources and lesson plans.",
          icon: GraduationCap,
        },
        {
          name: "Off2Class",
          type: "IELTS & SAT",
          url: "https://www.off2class.com/",
          description: "Online lessons and materials (paid + some free), usable in class.",
          icon: GraduationCap,
        },
        {
          name: "Khan Academy",
          type: "SAT",
          url: "https://www.khanacademy.org/",
          description: "Free SAT lessons and practice materials.",
          icon: GraduationCap,
        },
      ],
    },
    {
      title: "British Council (Adults / Teens / Kids)",
      icon: Globe,
      description: "Free worksheets, lesson plans, and seminars by age group",
      resources: [
        {
          name: "LearnEnglish (Adults)",
          type: "Adults",
          url: "https://learnenglish.britishcouncil.org/",
          description: "Free materials and support for adult learners.",
          icon: Globe,
        },
        {
          name: "LearnEnglish Teens",
          type: "Teens",
          url: "https://learnenglishteens.britishcouncil.org/",
          description: "Free worksheets and lesson plans for teens.",
          icon: Globe,
        },
        {
          name: "LearnEnglish Kids",
          type: "Kids",
          url: "https://learnenglishkids.britishcouncil.org/",
          description: "Free worksheets and lesson plans for kids.",
          icon: Globe,
        },
      ],
    },
    {
      title: "Kids & Phonics",
      icon: BookOpen,
      description: "Young learner lesson plans, phonics practice, and early literacy",
      resources: [
        {
          name: "ESL KidStuff",
          type: "Kids Lessons",
          url: "https://eslkidstuff.com/",
          description: "Free lesson plans for kids (up to around age 10).",
          icon: BookOpen,
        },
        {
          name: "Education.com",
          type: "Kids Activities",
          url: "https://www.education.com/",
          description: "Interactive games and resources for kids (limited free).",
          icon: Gamepad2,
        },
        {
          name: "Twinkl",
          type: "Kids Resources",
          url: "https://www.twinkl.com/",
          description: "Kids lesson resources and games (free + paid).",
          icon: FileText,
        },
        {
          name: "Starfall",
          type: "Phonics",
          url: "https://www.starfall.com/",
          description: "Phonics and early reading practice for young learners.",
          icon: BookOpen,
        },
        {
          name: "PhonicsPlay",
          type: "Phonics",
          url: "https://phonicsplaycomics.co.uk/",
          description: "Phonics games and reading practice for young learners.",
          icon: BookOpen,
        },
        {
          name: "Phonics Bloom",
          type: "Phonics",
          url: "https://www.phonicsbloom.com/",
          description: "Phonics games for ages ~4–7.",
          icon: BookOpen,
        },
      ],
    },
    {
      title: "Listening & Pronunciation",
      icon: Headphones,
      description: "Listening practice and pronunciation tools",
      resources: [
        {
          name: "LyricsTraining (LingoClip)",
          type: "Listening",
          url: "https://lingoclip.com/",
          description: "Song-based listening practice (great for teens/adults).",
          icon: Music,
        },
        {
          name: "YouGlish",
          type: "Pronunciation",
          url: "https://youglish.com/",
          description: "Pronunciation practice across accents using real video clips.",
          icon: Mic,
        },
      ],
    },
    {
      title: "Teacher Marketplaces & Communities",
      icon: ShoppingCart,
      description: "Paid/curated resources and community-shared materials",
      resources: [
        {
          name: "Teachers Pay Teachers",
          type: "Marketplace",
          url: "https://www.teacherspayteachers.com/",
          description: "Paid resources for all levels and subjects.",
          icon: ShoppingCart,
        },
        {
          name: "Share My Lesson",
          type: "Community",
          url: "https://sharemylesson.com/",
          description: "Teaching ideas and resources (some free, some paid).",
          icon: Users,
        },
        {
          name: "ESL Pals",
          type: "Lessons",
          url: "https://eslpals.com/",
          description: "Lessons and worksheets for online/offline teaching (free + paid).",
          icon: FileText,
        },
        {
          name: "EnglishHubPro",
          type: "Lessons",
          url: "https://enghub.pro/",
          description: "Lesson plans with lots of free materials (free + paid).",
          icon: FileText,
        },
        {
          name: "The English Flows",
          type: "Lessons",
          url: "https://theenglishflows.com/",
          description: "Teen/adult lesson plans (mostly paid, some free).",
          icon: FileText,
        },
        {
          name: "The Economist Educational Foundation",
          type: "Discussion Lessons",
          url: "https://talk.economistfoundation.org/",
          description: "Free lessons for older teens/adults (upper-intermediate+).",
          icon: MessageCircle,
        },
      ],
    },
    {
      title: "AI & Lesson Planning Helpers",
      icon: Sparkles,
      description: "Tools to speed up planning and generate activities",
      resources: [
        {
          name: "MagicSchool AI",
          type: "AI Planning",
          url: "https://www.magicschool.ai/",
          description: "AI lesson plan generator (free + paid).",
          icon: Sparkles,
        },
        {
          name: "Twee",
          type: "AI Lessons",
          url: "https://app.twee.com/",
          description: "Paid lesson generator for all ages (includes some IELTS materials).",
          icon: Sparkles,
        },
      ],
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Volume2 className="w-4 h-4" />;
      case 'zip': return <Download className="w-4 h-4" />;
      default: return <ExternalLink className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <PageTemplate 
        title="Teaching Resources" 
        subtitle="Comprehensive resources to enhance your teaching journey"
      />
      
      <div className="container-custom max-w-7xl mx-auto px-4 py-12">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 text-center shadow-sm">
            <BookOpen className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">50+</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Lesson Plans</div>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 text-center shadow-sm">
            <Video className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">25+</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Video Tutorials</div>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 text-center shadow-sm">
            <Download className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">100+</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Downloadable Resources</div>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 text-center shadow-sm">
            <Users className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">1000+</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Teachers Helped</div>
          </div>
        </motion.div>

        {/* Resource Categories */}
        <div className="grid lg:grid-cols-2 gap-8">
          {resourceCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      {category.title}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {category.resources.map((resource, resourceIndex) => (
                    <a
                      key={resourceIndex}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {resource.icon ? (
                          <div className="w-9 h-9 rounded-lg bg-white/80 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center">
                            {React.createElement(resource.icon, { className: "w-4 h-4 text-primary-600 dark:text-primary-400" })}
                          </div>
                        ) : (
                          getTypeIcon(resource.type)
                        )}
                        <div>
                          <div className="font-medium text-sm text-neutral-900 dark:text-white">
                            {resource.name}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {resource.type}
                          </div>
                          {resource.description && (
                            <div className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                              {resource.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-neutral-400" />
                    </a>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Teaching Aid Games */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Teaching Aid Games
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Click a game to view rules, instructions, and download as a PDF. ({allGamesCount} games)
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-neutral-500">
              <ClipboardList className="w-4 h-4" />
              Ready-to-run activities
            </div>
          </div>

          <div className="space-y-8">
            {gamesByCategory.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <div key={cat.title}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      <CatIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        {cat.title}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cat.games.map((g) => {
                      const Icon = g.icon;
                      return (
                        <button
                          key={g.id}
                          onClick={() => {
                            setSelectedGame(g);
                            setShowGameModal(true);
                          }}
                          className="text-left bg-white dark:bg-neutral-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-neutral-200 dark:border-neutral-700"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center border border-primary-100 dark:border-primary-800/40">
                                <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-neutral-900 dark:text-white truncate">
                                  {g.title}
                                </div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                  {g.audience}
                                </div>
                              </div>
                            </div>
                            <div className="text-2xl leading-none">{g.illustrationEmoji}</div>
                          </div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-300 mt-3">
                            {g.shortDescription}
                          </div>
                          <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-primary-600 dark:text-primary-400">
                            <ExternalLink className="w-3.5 h-3.5" />
                            View rules
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-8 text-center text-white mt-12"
        >
          <h2 className="text-2xl font-bold mb-2">Need More Resources?</h2>
          <p className="text-primary-100 mb-6">
            Join our community to access exclusive content and connect with fellow educators
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
              Join Community
            </button>
            <button className="border border-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Request Resources
            </button>
          </div>
        </motion.div>
      </div>

      {/* Game Modal */}
      {showGameModal && selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowGameModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  {selectedGame.audience}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {selectedGame.title}
                </h3>
              </div>
              <button
                className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                onClick={() => setShowGameModal(false)}
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Fun illustration */}
              <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
                <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 px-6 py-8 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      {selectedGame.illustrationLabel}
                    </div>
                    <div className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">
                      {selectedGame.illustrationEmoji} {selectedGame.title}
                    </div>
                    <div className="text-neutral-600 dark:text-neutral-300 mt-2">
                      {selectedGame.shortDescription}
                    </div>
                  </div>
                  <div className="text-[72px] leading-none select-none">
                    {selectedGame.illustrationEmoji}
                  </div>
                </div>
              </div>

              {/* Rules */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  How to play
                </h4>
                <ol className="list-decimal pl-6 space-y-2 text-neutral-700 dark:text-neutral-200">
                  {selectedGame.steps.map((s, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {s}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Printable area (hidden visually, used for capture) */}
              <div className="sr-only">
                <div ref={pdfAreaRef} className="p-8 bg-white text-black w-[800px]">
                  <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
                    {selectedGame.illustrationEmoji} {selectedGame.title}
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 18 }}>
                    Audience: {selectedGame.audience}
                  </div>
                  <div style={{ fontSize: 16, marginBottom: 14 }}>
                    {selectedGame.shortDescription}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
                    How to play
                  </div>
                  <ol style={{ fontSize: 14, lineHeight: 1.5, paddingLeft: 18 }}>
                    {selectedGame.steps.map((s, idx) => (
                      <li key={idx} style={{ marginBottom: 6 }}>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Download opens a print dialog — choose “Save as PDF”.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowGameModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={downloadSelectedGameAsPDF}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white font-medium hover:shadow-lg transition-shadow inline-flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}; 