import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Download, Video, Users, Award, Globe, FileText, ExternalLink, Volume2 } from 'lucide-react';
import { PageTemplate } from '@/components/PageTemplate';

export const ResourcesPage: React.FC = () => {
  const resourceCategories = [
    {
      title: "CELTA & TESOL Resources",
      icon: Award,
      description: "Certification guides and preparation materials",
      resources: [
        { name: "CELTA Preparation Guide", type: "PDF", url: "#" },
        { name: "TESOL Certification Overview", type: "Article", url: "#" },
        { name: "Teaching Practice Tips", type: "Video", url: "#" },
        { name: "Grammar Teaching Techniques", type: "PDF", url: "#" }
      ]
    },
    {
      title: "Lesson Planning",
      icon: BookOpen,
      description: "Templates and guides for effective lesson planning",
      resources: [
        { name: "Lesson Plan Templates", type: "PDF", url: "#" },
        { name: "Activity Ideas Bank", type: "Document", url: "#" },
        { name: "Assessment Rubrics", type: "PDF", url: "#" },
        { name: "Curriculum Mapping Guide", type: "Article", url: "#" }
      ]
    },
    {
      title: "Teaching Materials",
      icon: FileText,
      description: "Ready-to-use materials for your classroom",
      resources: [
        { name: "ESL Worksheets Collection", type: "ZIP", url: "#" },
        { name: "Interactive Games Pack", type: "PDF", url: "#" },
        { name: "Pronunciation Guides", type: "Audio", url: "#" },
        { name: "Grammar Exercises", type: "Document", url: "#" }
      ]
    },
    {
      title: "Professional Development",
      icon: Users,
      description: "Continue growing as an educator",
      resources: [
        { name: "Teaching Conferences 2024", type: "Article", url: "#" },
        { name: "Online Workshops", type: "Link", url: "#" },
        { name: "Peer Observation Forms", type: "PDF", url: "#" },
        { name: "Reflective Teaching Journal", type: "Template", url: "#" }
      ]
    },
    {
      title: "Technology in Teaching",
      icon: Globe,
      description: "Digital tools and online teaching resources",
      resources: [
        { name: "Online Teaching Best Practices", type: "Guide", url: "#" },
        { name: "Educational Apps Review", type: "Article", url: "#" },
        { name: "Virtual Classroom Setup", type: "Video", url: "#" },
        { name: "Digital Assessment Tools", type: "List", url: "#" }
      ]
    },
    {
      title: "Video Tutorials",
      icon: Video,
      description: "Watch and learn from experienced teachers",
      resources: [
        { name: "Classroom Management Tips", type: "Video", url: "#" },
        { name: "Teaching Young Learners", type: "Video", url: "#" },
        { name: "Business English Techniques", type: "Video", url: "#" },
        { name: "IELTS Preparation Methods", type: "Video", url: "#" }
      ]
    }
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
                    <div
                      key={resourceIndex}
                      className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {getTypeIcon(resource.type)}
                        <div>
                          <div className="font-medium text-sm text-neutral-900 dark:text-white">
                            {resource.name}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {resource.type}
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-neutral-400" />
                    </div>
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