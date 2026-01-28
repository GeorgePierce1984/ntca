import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Shuffle,
  Target,
  Timer,
  Gamepad2,
  Headphones,
  BookOpen,
  ClipboardList,
  FileText,
  Users,
  X,
  FileDown,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { PageTemplate } from "@/components/PageTemplate";

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

export const ResourcesGamesPage: React.FC = () => {
  const navigate = useNavigate();
  const pdfAreaRef = useRef<HTMLDivElement | null>(null);

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
          title: "Stickman Description (all levels)",
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
          title: "2 Truths 1 Lie (all levels)",
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
          title: "M and Ms Facts (all levels)",
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
          title: "Never Have I Ever",
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

  const totalGames = useMemo(
    () => gamesByCategory.reduce((sum, c) => sum + (c.games?.length || 0), 0),
    [gamesByCategory]
  );

  const [selectedGame, setSelectedGame] = useState<TeachingGame | null>(null);

  const downloadSelectedGameAsPDF = async () => {
    if (!selectedGame) return;
    const node = pdfAreaRef.current;
    if (!node) return;

    const canvas = await html2canvas(node, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    });
    const dataUrl = canvas.toDataURL("image/png");

    const safeTitle = `${selectedGame.title} - Teaching Aid`;
    const printableHtml = `
      <html>
        <head>
          <title>${safeTitle}</title>
          <meta charset="utf-8" />
          <style>
            body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; }
            .page { padding: 24px; }
            img { width: 100%; height: auto; display: block; }
            @media print { .page { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="page">
            <img src="${dataUrl}" alt="Printable" />
          </div>
        </body>
      </html>
    `;

    // Avoid popups: print via hidden iframe.
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    iframe.srcdoc = printableHtml;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch {
            // ignore
          }
        }, 1500);
      }
    };
  };

  return (
    <PageTemplate
      title="Teaching Aid Games"
      subtitle={`${totalGames} classroom games (download as PDF)`}
      showComingSoon={false}
      topPaddingClassName="pt-[55px]"
      headerSectionClassName="pt-10 pb-6 md:pt-12 md:pb-8 bg-gradient-to-br from-primary-50 to-white dark:from-neutral-900 dark:to-neutral-950"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <button
          onClick={() => navigate("/resources")}
          className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Resources Hub
        </button>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {gamesByCategory.map((category) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.title}
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
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

                <div className="grid grid-cols-1 gap-3">
                  {category.games.map((game) => {
                    const GameIcon = game.icon;
                    return (
                      <button
                        key={game.id}
                        onClick={() => setSelectedGame(game)}
                        className="text-left rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/40 dark:hover:bg-primary-900/10 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                            <GameIcon className="w-4 h-4 text-neutral-700 dark:text-neutral-200" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-neutral-900 dark:text-white">
                              {game.title}
                            </div>
                            <div className="text-xs text-neutral-500 mt-0.5">
                              {game.audience}
                            </div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                              {game.shortDescription}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Modal */}
        {selectedGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden">
              <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {selectedGame.title}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {selectedGame.audience}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGame(null)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <X className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-auto">
                <div
                  ref={pdfAreaRef}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-2xl">
                      {selectedGame.illustrationEmoji}
                    </div>
                    <div>
                      <div className="text-base font-semibold text-neutral-900 dark:text-white">
                        {selectedGame.title}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {selectedGame.illustrationLabel}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedGame.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                          {idx + 1}
                        </div>
                        <div className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed">
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedGame(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={downloadSelectedGameAsPDF}
                  className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
};


