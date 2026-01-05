import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Sparkles,
  GraduationCap,
  Building2,
  Users,
  Brain,
  FileText,
  Phone,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Settings,
  CreditCard,
  Shield,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    label: "For Teachers",
    icon: <GraduationCap className="w-4 h-4" />,
    children: [
      { label: "Browse Jobs", href: "/jobs" },
      { label: "Create Profile", href: "/signup?type=teacher" },
              { label: "Resources", href: "/resources" },
      { label: "Career Guidance", href: "/resources/career-guidance" },
    ],
  },
  {
    label: "For Schools",
    icon: <Building2 className="w-4 h-4" />,
    children: [
      { label: "Post a Job", href: "/schools/post-job" },
      { label: "Browse Teachers", href: "/schools/browse-teachers" },
      { label: "Premium Listings", href: "/schools/premium" },
      {
        label: "AI Matching",
        href: "/schools/ai-matching",
        icon: <Sparkles className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "AI Services",
    href: "/ai-services",
    icon: <Brain className="w-4 h-4" />,
  },
  {
    label: "About",
    icon: <Users className="w-4 h-4" />,
    children: [
      { label: "About NTCA", href: "/about" },
      { label: "Success Stories", href: "/success-stories" },
      { label: "Blog", href: "/blog" },
      { label: "Brand Guidelines", href: "/branding" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const navDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Get display name: school name for schools, first name for teachers
  const getDisplayName = () => {
    if (user?.userType === "SCHOOL" && user?.school?.name) {
      return user.school.name;
    }
    if (user?.userType === "TEACHER" && user?.teacher?.firstName) {
      return user.teacher.firstName;
    }
    // Fallback to email if name not available
    return user?.email || "Account";
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setUserDropdownOpen(false);
  }, [location]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside navigation dropdown area
      const isOutsideNav = navDropdownRef.current && !navDropdownRef.current.contains(target);
      
      // Check if click is outside user dropdown area
      const isOutsideUser = userDropdownRef.current && !userDropdownRef.current.contains(target);
      
      // If click is outside both, close all dropdowns
      if (isOutsideNav && isOutsideUser) {
        setActiveDropdown(null);
        setUserDropdownOpen(false);
      } else if (isOutsideNav && activeDropdown !== null) {
        // Click is outside nav but might be in user dropdown - only close nav
        setActiveDropdown(null);
      } else if (isOutsideUser && userDropdownOpen) {
        // Click is outside user but might be in nav dropdown - only close user
        setUserDropdownOpen(false);
      }
    };

    // Only add listener if any dropdown is open
    if (activeDropdown !== null || userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [activeDropdown, userDropdownOpen]);

  const handleDropdownToggle = (label: string) => {
    // Close user dropdown when opening nav dropdown
    if (activeDropdown !== label) {
      setUserDropdownOpen(false);
    }
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const handleUserDropdownToggle = () => {
    // Close nav dropdowns when opening user dropdown
    setActiveDropdown(null);
    setUserDropdownOpen(!userDropdownOpen);
  };

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-sm",
          isScrolled ? "glass shadow-lg" : "bg-white/80 dark:bg-neutral-900/80",
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container-custom">
          <nav className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center z-10">
              <Logo className="h-10" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <ul className="flex items-center gap-1" ref={navDropdownRef}>
                {navigation.map((item) => (
                  <li key={item.label} className="relative">
                    {item.children ? (
                      <div className="relative">
                        <button
                          onClick={() => handleDropdownToggle(item.label)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
                            "hover:bg-white/10 hover:backdrop-blur-sm",
                            activeDropdown === item.label &&
                              "bg-white/10 backdrop-blur-sm",
                          )}
                        >
                          {item.icon}
                          {item.label}
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform duration-200",
                              activeDropdown === item.label && "rotate-180",
                            )}
                          />
                        </button>

                        <AnimatePresence>
                          {activeDropdown === item.label && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-full left-0 mt-2 w-64 glass rounded-xl shadow-xl overflow-hidden z-50"
                            >
                              <ul className="py-2">
                                {item.children.map((child) => (
                                  <li key={child.label}>
                                    <Link
                                      to={child.href!}
                                      onClick={() => setActiveDropdown(null)}
                                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors duration-200"
                                    >
                                      {child.icon}
                                      <span className="font-medium">
                                        {child.label}
                                      </span>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={item.href!}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-white/10 hover:backdrop-blur-sm"
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>

              {/* Authentication Section */}
              <div className="flex items-center gap-3 ml-8">
                {isAuthenticated ? (
                  <div className="relative" ref={userDropdownRef}>
                    <button
                      onClick={handleUserDropdownToggle}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-white/10 hover:backdrop-blur-sm"
                    >
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center overflow-hidden">
                        {user?.userType === "SCHOOL" && user?.school?.logoUrl ? (
                          <img 
                            src={user.school.logoUrl} 
                            alt="School logo"
                            className="w-full h-full object-cover"
                          />
                        ) : user?.userType === "TEACHER" && user?.teacher?.photoUrl ? (
                          <img 
                            src={user.teacher.photoUrl} 
                            alt={`${user.teacher.firstName} ${user.teacher.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        )}
                      </div>
                      <span className="hidden sm:inline">{getDisplayName()}</span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          userDropdownOpen && "rotate-180",
                        )}
                      />
                    </button>

                    <AnimatePresence>
                      {userDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full right-0 mt-2 w-64 glass rounded-xl shadow-xl overflow-hidden z-50"
                        >
                          <div className="p-4 border-b border-white/10">
                            <p className="font-medium text-sm">{getDisplayName()}</p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 capitalize">
                              {user?.userType.toLowerCase()} Account
                            </p>
                          </div>
                          <ul className="py-2">
                            <li>
                              <Link
                                to={
                                  user?.userType === "SCHOOL"
                                    ? "/schools/dashboard"
                                    : "/teachers/dashboard"
                                }
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors duration-200"
                              >
                                <Settings className="w-4 h-4" />
                                <span className="font-medium">Dashboard</span>
                              </Link>
                            </li>
                            <li>
                              <Link
                                to={
                                  user?.userType === "SCHOOL"
                                    ? "/schools/profile"
                                    : "/teachers/profile"
                                }
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors duration-200"
                              >
                                <User className="w-4 h-4" />
                                <span className="font-medium">Profile & Settings</span>
                              </Link>
                            </li>
                            {user?.userType === "TEACHER" && (
                              <li>
                                <Link
                                  to="/teachers/privacy"
                                  onClick={() => setUserDropdownOpen(false)}
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors duration-200"
                                >
                                  <Shield className="w-4 h-4" />
                                  <span className="font-medium">Privacy & Control</span>
                                </Link>
                              </li>
                            )}
                            {user?.userType === "SCHOOL" && (
                              <li>
                                <Link
                                  to="/schools/subscription"
                                  onClick={() => setUserDropdownOpen(false)}
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors duration-200"
                                >
                                  <CreditCard className="w-4 h-4" />
                                  <span className="font-medium">Subscription</span>
                                </Link>
                              </li>
                            )}
                            <li>
                              <button
                                onClick={() => {
                                  setUserDropdownOpen(false);
                                  logout();
                                }}
                                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/10 transition-colors duration-200 text-red-600 dark:text-red-400"
                              >
                                <LogOut className="w-4 h-4" />
                                <span className="font-medium">Logout</span>
                              </button>
                            </li>
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    <Link to="/login">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<LogIn className="w-4 h-4" />}
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button
                        variant="gradient"
                        size="sm"
                        leftIcon={<UserPlus className="w-4 h-4" />}
                        glow
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-neutral-900 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                  <Logo className="h-8" />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    aria-label="Close mobile menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Menu Items */}
                <div className="flex-1 overflow-y-auto py-6">
                  <ul className="space-y-1 px-4">
                    {navigation.map((item) => (
                      <li key={item.label}>
                        {item.children ? (
                          <div>
                            <button
                              onClick={() => handleDropdownToggle(item.label)}
                              className="flex items-center justify-between w-full px-4 py-3 rounded-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            >
                              <span className="flex items-center gap-3">
                                {item.icon}
                                {item.label}
                              </span>
                              <ChevronDown
                                className={cn(
                                  "w-4 h-4 transition-transform duration-200",
                                  activeDropdown === item.label && "rotate-180",
                                )}
                              />
                            </button>
                            <AnimatePresence>
                              {activeDropdown === item.label && (
                                <motion.ul
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  {item.children.map((child) => (
                                    <li key={child.label}>
                                      <Link
                                        to={child.href!}
                                        className="flex items-center gap-3 pl-11 pr-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                      >
                                        {child.icon}
                                        {child.label}
                                      </Link>
                                    </li>
                                  ))}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <Link
                            to={item.href!}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            {item.icon}
                            {item.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mobile Menu Footer */}
                <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
                  {isAuthenticated ? (
                    <>
                      <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                        <p className="font-medium text-sm">{getDisplayName()}</p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 capitalize">
                          {user?.userType.toLowerCase()} Account
                        </p>
                      </div>
                      <Link
                        to={
                          user?.userType === "SCHOOL"
                            ? "/schools/dashboard"
                            : "/teachers/dashboard"
                        }
                        className="w-full px-4 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      >
                        <Button
                          variant="secondary"
                          fullWidth
                          leftIcon={<Settings className="w-4 h-4" />}
                        >
                          Dashboard
                        </Button>
                      </Link>
                      <Link
                        to={
                          user?.userType === "SCHOOL"
                            ? "/schools/profile"
                            : "/teachers/profile"
                        }
                        className="w-full px-4 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      >
                        <Button
                          variant="secondary"
                          fullWidth
                          leftIcon={<User className="w-4 h-4" />}
                        >
                          Profile & Settings
                        </Button>
                      </Link>
                      <Button
                        onClick={logout}
                        variant="secondary"
                        fullWidth
                        leftIcon={<LogOut className="w-4 h-4" />}
                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login">
                        <Button
                          variant="secondary"
                          fullWidth
                          leftIcon={<LogIn className="w-4 h-4" />}
                        >
                          Login
                        </Button>
                      </Link>
                      <Link to="/signup">
                        <Button
                          variant="gradient"
                          fullWidth
                          leftIcon={<UserPlus className="w-4 h-4" />}
                          glow
                        >
                          Sign Up
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
