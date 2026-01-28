import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Gamepad2, Download, Video, Users, Award, Globe, FileText, ExternalLink, Volume2, LibraryBig } from 'lucide-react';
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
      ],
    },
    {
      title: "Interactive Games & Classroom Tools",
      icon: Gamepad2,
      description: "Engaging game-based tools for live lessons and practice",
      resources: [
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
          name: "English Current",
          type: "Articles",
          url: "https://www.englishcurrent.com/",
          description: "Grammar explanations, worksheets, and lesson support content.",
          icon: Globe,
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