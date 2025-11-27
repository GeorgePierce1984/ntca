import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AutoLogoutModalProps {
  show: boolean;
  onClose: () => void;
}

export const AutoLogoutModal: React.FC<AutoLogoutModalProps> = ({ show, onClose }) => {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Session Timeout
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    You will be logged out automatically
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 mb-3">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Your session has expired due to inactivity</span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  For your security, you'll be redirected to the login page in a few seconds.
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  Dismiss
                </Button>
                <Button
                  onClick={() => window.location.href = '/login'}
                  variant="primary"
                  size="sm"
                  className="flex-1"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 