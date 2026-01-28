import React from 'react';
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
} from 'lucide-react';
import { PageTemplate } from '@/components/PageTemplate';

export const ResourcesPage: React.FC = () => {
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
    </div>
  );
}; 