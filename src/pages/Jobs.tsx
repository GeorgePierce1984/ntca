import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search,
  Filter,
  DollarSign,
  Briefcase,
  Calendar,
  Hourglass,
  Building,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  X,
  MapPin,
  Award,
  GraduationCap,
  Monitor,
  Globe,
  School,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { countries, CENTRAL_ASIA_COUNTRIES } from "@/data/countries";

// Filter to only Central Asian countries
const centralAsiaCountries = countries.filter(c => 
  CENTRAL_ASIA_COUNTRIES.includes(c.name)
);

interface School {
  id: string;
  name: string;
  city: string;
  country: string;
  logoUrl?: string;
  verified: boolean;
}

interface Job {
  id: string;
  title: string;
  description: string;
  city: string;
  country: string;
  salary: string;
  type: string;
  status: string;
  deadline: string;
  createdAt: string;
  contractLength?: string | null;
  studentAgeGroupMin?: number | null;
  studentAgeGroupMax?: number | null;
  requirements?: string;
  school: School;
  _count: {
    applications: number;
  };
}

interface FilterState {
  // Core Primary Filters
  countries: string[];
  city: string;
  jobTypes: string[];
  onlineExperience: boolean;
  salaryMin: number | "";
  salaryMax: number | "";
  showUndisclosedSalaries: boolean;
  contractLengths: string[];
  
  // Qualification & Experience (Expandable)
  experienceMin: number;
  qualifications: string[];
  teachingContext: string[];
  
  // Eligibility & Visa
  visaRequirement: string;
  
  // School & Role Characteristics
  schoolTypes: string[];
  studentAgeGroups: string[];
  
  // Time & Urgency
  startDate: string;
  deadlineFilter: string;
  
  // Sort
  sort: string;
}

export default function Jobs() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  
  // Parse filters from URL (applied filters)
  const parseFiltersFromURL = (): FilterState => {
    return {
      countries: searchParams.getAll("country") || [],
      city: searchParams.get("city") || "",
      jobTypes: searchParams.getAll("job_type") || [],
      onlineExperience: searchParams.get("online_experience") === "true",
      salaryMin: searchParams.get("salary_min") ? parseInt(searchParams.get("salary_min")!) : 0,
      salaryMax: searchParams.get("salary_max") ? parseInt(searchParams.get("salary_max")!) : 10000,
      contractLengths: searchParams.getAll("contract_length") || [],
      experienceMin: searchParams.get("experience_min") ? parseInt(searchParams.get("experience_min")!) : 0,
      qualifications: searchParams.getAll("qualification") || [],
      teachingContext: searchParams.getAll("teaching_context") || [],
      visaRequirement: searchParams.get("visa_requirement") || "",
      schoolTypes: searchParams.getAll("school_type") || [],
      studentAgeGroups: searchParams.getAll("student_age") || [],
      startDate: searchParams.get("start_date") || "",
      deadlineFilter: searchParams.get("deadline") || "",
      sort: searchParams.get("sort") || "latest",
    };
  };

  // Applied filters (from URL) - these trigger API calls
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(parseFiltersFromURL);
  // Staged filters (local state) - these don't trigger API calls until applied
  const [stagedFilters, setStagedFilters] = useState<FilterState>(parseFiltersFromURL);
  const [stagedSearchTerm, setStagedSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  
  // State for collapsible filter sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    location: false,
    jobType: false,
    salary: false,
    contractLength: false,
    experienceLevel: false,
    qualifications: false,
    teachingContext: false,
    visaRequirement: false,
    schoolType: false,
    studentAgeGroup: false,
    startDate: false,
    deadline: false,
  });
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Refs for scrolling
  const scrollableContentRef = useRef<HTMLDivElement>(null);
  const expandableFiltersRef = useRef<HTMLDivElement>(null);
  const moreFiltersButtonRef = useRef<HTMLDivElement>(null);

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(stagedSearchTerm, 500);
  
  // Auto-scroll when "Show More Filters" is opened
  useEffect(() => {
    if (showMoreFilters && expandableFiltersRef.current && scrollableContentRef.current && moreFiltersButtonRef.current) {
      // Wait for animation to start, then scroll
      setTimeout(() => {
        const buttonBottom = (moreFiltersButtonRef.current?.offsetTop || 0) + (moreFiltersButtonRef.current?.offsetHeight || 0);
        const expandableTop = expandableFiltersRef.current?.offsetTop || 0;
        const scrollContainer = scrollableContentRef.current;
        if (scrollContainer) {
          // Scroll just enough to show the first filter while keeping the button visible
          // Calculate scroll position to keep button visible (button should be near top of viewport)
          const scrollPosition = Math.max(0, buttonBottom - 100); // Keep button ~100px from top
          scrollContainer.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [showMoreFilters]);

  // Update applied filters when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const urlFilters = parseFiltersFromURL();
    setAppliedFilters(urlFilters);
    setStagedFilters(urlFilters);
    setStagedSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);


  // Check if any filters are active
  const hasActiveFilters = useCallback((filterState: FilterState, search: string = "") => {
    return (
      filterState.countries.length > 0 ||
      filterState.city !== "" ||
      filterState.jobTypes.length > 0 ||
      filterState.onlineExperience ||
      filterState.salaryMin !== 0 ||
      filterState.salaryMax !== 10000 ||
      filterState.contractLengths.length > 0 ||
      filterState.experienceMin > 0 ||
      filterState.qualifications.length > 0 ||
      filterState.teachingContext.length > 0 ||
      filterState.visaRequirement !== "" ||
      filterState.schoolTypes.length > 0 ||
      filterState.studentAgeGroups.length > 0 ||
      filterState.startDate !== "" ||
      filterState.deadlineFilter !== "" ||
      search !== ""
    );
  }, []);

  // Build URL params from filters
  const buildURLParams = useCallback((filterState: FilterState, search: string = "") => {
    const params = new URLSearchParams();
    
    // Only add params if filters are active (for SEO-friendly URLs)
    if (!hasActiveFilters(filterState, search)) {
      return params; // Empty params = show all
    }
    
    if (search) params.append("search", search);
    
    // Core filters
    filterState.countries.forEach(c => params.append("country", c));
    if (filterState.city) params.append("city", filterState.city);
    filterState.jobTypes.forEach(t => params.append("job_type", t));
    if (filterState.onlineExperience) params.append("online_experience", "true");
    // Only add salary filters if they're not at default values
    if (filterState.salaryMin > 0) params.append("salary_min", filterState.salaryMin.toString());
    if (filterState.salaryMax < 10000) params.append("salary_max", filterState.salaryMax.toString());
    filterState.contractLengths.forEach(c => params.append("contract_length", c));
    
    // Expandable filters
    if (filterState.experienceMin > 0) params.append("experience_min", filterState.experienceMin.toString());
    filterState.qualifications.forEach(q => params.append("qualification", q));
    filterState.teachingContext.forEach(t => params.append("teaching_context", t));
    
    // Eligibility
    if (filterState.visaRequirement) params.append("visa_requirement", filterState.visaRequirement);
    
    // School & Role
    filterState.schoolTypes.forEach(s => params.append("school_type", s));
    filterState.studentAgeGroups.forEach(a => params.append("student_age", a));
    
    // Time filters
    if (filterState.startDate) params.append("start_date", filterState.startDate);
    if (filterState.deadlineFilter) params.append("deadline", filterState.deadlineFilter);
    
    // Sort
    if (filterState.sort && filterState.sort !== "latest") params.append("sort", filterState.sort);
    
    return params;
  }, [hasActiveFilters]);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = buildURLParams(appliedFilters, searchTerm);
      const queryString = params.toString();
      
      // Always call the API, even with empty params (to get all jobs)
      const url = `/api/jobs/public${queryString ? `?${queryString}` : ''}`;
      console.log('Fetching jobs from:', url);
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('Jobs fetched:', data.jobs?.length || 0, 'jobs');
        setJobs(data.jobs || []);
        setTotalJobs(data.pagination?.totalJobs || data.jobs?.length || 0);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch jobs:", response.status, response.statusText, errorText);
        setJobs([]);
        setTotalJobs(0);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, searchTerm, buildURLParams]);

  // Fetch jobs when applied filters or search term changes
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Apply staged filters and search term
    setAppliedFilters(stagedFilters);
    setSearchTerm(stagedSearchTerm);
    const params = buildURLParams(stagedFilters, stagedSearchTerm);
    setSearchParams(params, { replace: true });
    setShowFilters(false); // Close filters when search is submitted
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    // Only update staged filters (local state) - don't trigger API call
    const newFilters = { ...stagedFilters, [key]: value };
    setStagedFilters(newFilters);
  };

  const handleMultiSelect = (key: keyof FilterState, value: string) => {
    // Only update staged filters (local state) - don't trigger API call
    const newFilters = {
      ...stagedFilters,
      [key]: (() => {
        const current = stagedFilters[key] as string[];
        return current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value];
      })(),
    };
    setStagedFilters(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      countries: [],
      city: "",
      jobTypes: [],
      onlineExperience: false,
      salaryMin: 0,
      salaryMax: 10000,
      showUndisclosedSalaries: false,
      contractLengths: [],
      experienceMin: 0,
      qualifications: [],
      teachingContext: [],
      visaRequirement: "",
      schoolTypes: [],
      studentAgeGroups: [],
      startDate: "",
      deadlineFilter: "",
      sort: "latest",
    };
    setStagedFilters(emptyFilters);
    setStagedSearchTerm("");
    setAppliedFilters(emptyFilters);
    setSearchTerm("");
    setSearchParams({}, { replace: true });
    setShowFilters(false); // Close filters when filters are cleared
  };

  const handleJobClick = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return days;
  };

  const activeFilterCount = 
    appliedFilters.countries.length +
    (appliedFilters.city ? 1 : 0) +
    appliedFilters.jobTypes.length +
    (appliedFilters.onlineExperience ? 1 : 0) +
    (appliedFilters.salaryMin !== 0 ? 1 : 0) +
    (appliedFilters.salaryMax !== 10000 ? 1 : 0) +
    appliedFilters.contractLengths.length +
    (appliedFilters.experienceMin > 0 ? 1 : 0) +
    appliedFilters.qualifications.length +
    appliedFilters.teachingContext.length +
    (appliedFilters.visaEligible !== "" ? 1 : 0) +
    appliedFilters.schoolTypes.length +
    appliedFilters.studentAgeGroups.length +
    (appliedFilters.startDate ? 1 : 0) +
    (appliedFilters.deadlineFilter ? 1 : 0);

  return (
    <div className="min-h-screen pt-20 bg-neutral-50 dark:bg-neutral-900 relative">
      <div className="section">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="heading-1 mb-4">Find Your Dream Teaching Job</h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Discover opportunities at top schools across Central Asia and
              beyond
            </p>
          </motion.div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-6xl mx-auto mb-8">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by job title, school, or keyword..."
                  value={stagedSearchTerm}
                  onChange={(e) => setStagedSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<Filter className="w-4 h-4" />}
              >
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown
                  className={`w-4 h-4 ml-2 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </Button>

              {/* Filters Dropdown Panel - Centered on page */}
              <AnimatePresence>
                {showFilters && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowFilters(false)}
                      className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
                    />
                    {/* Filters Panel - Centered on screen */}
                    <div
                      style={{
                        position: 'fixed',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 50,
                        width: '800px',
                        maxWidth: '95vw',
                        maxHeight: '85vh',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                      className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          overflow: 'hidden'
                        }}
                        className="w-full"
                      >
                        {/* Header with Close Button */}
                        <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex items-center justify-between rounded-t-lg flex-shrink-0">
                          <h3 className="text-lg font-semibold">Filters</h3>
                          <button
                            onClick={() => setShowFilters(false)}
                            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                            aria-label="Close filters"
                          >
                            <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                          </button>
                        </div>

                        {/* Scrollable Content */}
                        <div 
                          ref={scrollableContentRef}
                          className="overflow-y-auto px-6 py-4 space-y-6" 
                          style={{ 
                            flex: '1 1 0%',
                            minHeight: 0,
                            overflowY: 'auto'
                          }}
                        >
                {/* Location */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection('location')}
                    className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary-600" />
                      Location
                    </div>
                    {expandedSections.location ? (
                      <ChevronUp className="w-4 h-4 text-neutral-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-500" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedSections.location && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                              Country (multi-select)
                            </label>
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-neutral-200 dark:border-neutral-700 rounded">
                              {centralAsiaCountries.map((country) => (
                                <label
                                  key={country.code}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-700 rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600"
                                >
                                  <input
                                    type="checkbox"
                                    checked={stagedFilters.countries.includes(country.name)}
                                    onChange={() => handleMultiSelect("countries", country.name)}
                                    className="rounded"
                                  />
                                  <span className="text-base">{country.flag}</span>
                                  <span className="text-sm">{country.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                              City (optional)
                            </label>
                            <input
                              type="text"
                              placeholder="Enter city name"
                              value={stagedFilters.city}
                              onChange={(e) => handleFilterChange("city", e.target.value)}
                              className="input"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Job Type */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection('jobType')}
                    className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary-600" />
                      Job Type
                    </div>
                    {expandedSections.jobType ? (
                      <ChevronUp className="w-4 h-4 text-neutral-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-500" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedSections.jobType && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-3">
                            {["Full-time", "Part-time", "Contract"].map((type) => {
                              const value = type.toUpperCase().replace("-", "_");
                              return (
                                <label
                                  key={type}
                                  className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-700 rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600"
                                >
                                  <input
                                    type="checkbox"
                                    checked={stagedFilters.jobTypes.includes(value)}
                                    onChange={() => handleMultiSelect("jobTypes", value)}
                                    className="rounded"
                                  />
                                  <span className="text-sm">{type}</span>
                                </label>
                              );
                            })}
                          </div>
                          <div>
                            <label className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-700 rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600">
                              <input
                                type="checkbox"
                                checked={stagedFilters.onlineExperience}
                                onChange={(e) => handleFilterChange("onlineExperience", e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Online Experience</span>
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Salary Range */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection('salary')}
                    className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary-600" />
                      Salary Range (Monthly)
                    </div>
                    {expandedSections.salary ? (
                      <ChevronUp className="w-4 h-4 text-neutral-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-500" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedSections.salary && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4">
                          <div className="px-2">
                            <div className="flex items-center justify-between mb-4">
                              <div className="text-center">
                                <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                  ${stagedFilters.salaryMin.toLocaleString()}
                                </div>
                                <div className="text-xs text-neutral-500">Min</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                  ${stagedFilters.salaryMax === 10000 ? "10,000+" : stagedFilters.salaryMax.toLocaleString()}
                                </div>
                                <div className="text-xs text-neutral-500">Max</div>
                              </div>
                            </div>
                            <div className="relative h-6">
                              {/* Track */}
                              <div className="absolute top-2 left-0 w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                              {/* Active range */}
                              <div
                                className="absolute top-2 h-2 bg-primary-600 rounded-full"
                                style={{
                                  left: `${(stagedFilters.salaryMin / 10000) * 100}%`,
                                  width: `${((stagedFilters.salaryMax - stagedFilters.salaryMin) / 10000) * 100}%`,
                                }}
                              ></div>
                              {/* Min slider */}
                              <input
                                type="range"
                                min="0"
                                max={stagedFilters.salaryMax}
                                step="100"
                                value={stagedFilters.salaryMin}
                                onChange={(e) => {
                                  const newMin = Math.min(parseInt(e.target.value), stagedFilters.salaryMax);
                                  handleFilterChange("salaryMin", newMin);
                                }}
                                className="absolute top-0 left-0 w-full h-6 bg-transparent appearance-none cursor-pointer z-10"
                                style={{
                                  WebkitAppearance: "none",
                                  appearance: "none",
                                }}
                              />
                              {/* Max slider */}
                              <input
                                type="range"
                                min={stagedFilters.salaryMin}
                                max="10000"
                                step="100"
                                value={stagedFilters.salaryMax}
                                onChange={(e) => {
                                  const newMax = Math.max(parseInt(e.target.value), stagedFilters.salaryMin);
                                  handleFilterChange("salaryMax", newMax);
                                }}
                                className="absolute top-0 left-0 w-full h-6 bg-transparent appearance-none cursor-pointer z-10"
                                style={{
                                  WebkitAppearance: "none",
                                  appearance: "none",
                                }}
                              />
                              <style jsx>{`
                                input[type="range"]::-webkit-slider-thumb {
                                  appearance: none;
                                  width: 18px;
                                  height: 18px;
                                  border-radius: 50%;
                                  background: rgb(59, 130, 246);
                                  cursor: pointer;
                                  border: 2px solid white;
                                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                                }
                                input[type="range"]::-moz-range-thumb {
                                  width: 18px;
                                  height: 18px;
                                  border-radius: 50%;
                                  background: rgb(59, 130, 246);
                                  cursor: pointer;
                                  border: 2px solid white;
                                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                                }
                              `}</style>
                            </div>
                            <div className="flex items-center justify-between mt-2 text-xs text-neutral-500">
                              <span>$0</span>
                              <span>$10,000+</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Contract Length */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection('contractLength')}
                    className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary-600" />
                      Contract Length
                    </div>
                    {expandedSections.contractLength ? (
                      <ChevronUp className="w-4 h-4 text-neutral-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-500" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedSections.contractLength && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap gap-3">
                          {["< 6 months", "6–9 months", "9-12 months", "Greater than 12 months"].map((length) => (
                            <label
                              key={length}
                              className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-700 rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600"
                            >
                              <input
                                type="checkbox"
                                checked={stagedFilters.contractLengths.includes(length)}
                                onChange={() => handleMultiSelect("contractLengths", length)}
                                className="rounded"
                              />
                              <span className="text-sm">{length}</span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* More Filters Button */}
                <div ref={moreFiltersButtonRef} className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <button
                    type="button"
                    onClick={() => setShowMoreFilters(!showMoreFilters)}
                    className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    {showMoreFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {showMoreFilters ? "Hide" : "Show"} More Filters
                  </button>
                </div>

                {/* Expandable Filters */}
                <AnimatePresence>
                  {showMoreFilters && (
                    <motion.div
                      ref={expandableFiltersRef}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-6 pt-4 border-t border-neutral-200 dark:border-neutral-700"
                    >
                      {/* Minimum Teaching Experience */}
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleSection('experienceLevel')}
                          className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-primary-600" />
                            Minimum Teaching Experience
                          </div>
                          {expandedSections.experienceLevel ? (
                            <ChevronUp className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedSections.experienceLevel && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-4">
                                <div className="px-2">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="text-center">
                                      <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                        {stagedFilters.experienceMin} {stagedFilters.experienceMin === 1 ? 'year' : 'years'}
                                      </div>
                                      <div className="text-xs text-neutral-500">Minimum</div>
                                    </div>
                                  </div>
                                  <div className="relative h-6">
                                    {/* Track */}
                                    <div className="absolute top-2 left-0 w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                                    {/* Active range */}
                                    <div
                                      className="absolute top-2 h-2 bg-primary-600 rounded-full"
                                      style={{
                                        left: '0%',
                                        width: `${(stagedFilters.experienceMin / 30) * 100}%`,
                                      }}
                                    ></div>
                                    {/* Slider */}
                                    <input
                                      type="range"
                                      min="0"
                                      max="30"
                                      step="1"
                                      value={stagedFilters.experienceMin}
                                      onChange={(e) => handleFilterChange("experienceMin", parseInt(e.target.value))}
                                      className="absolute top-0 left-0 w-full h-6 bg-transparent appearance-none cursor-pointer z-10"
                                      style={{
                                        WebkitAppearance: "none",
                                        appearance: "none",
                                      }}
                                    />
                                    <style jsx>{`
                                      input[type="range"]::-webkit-slider-thumb {
                                        appearance: none;
                                        width: 18px;
                                        height: 18px;
                                        border-radius: 50%;
                                        background: rgb(59, 130, 246);
                                        cursor: pointer;
                                        border: 2px solid white;
                                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                                      }
                                      input[type="range"]::-moz-range-thumb {
                                        width: 18px;
                                        height: 18px;
                                        border-radius: 50%;
                                        background: rgb(59, 130, 246);
                                        cursor: pointer;
                                        border: 2px solid white;
                                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                                      }
                                    `}</style>
                                  </div>
                                  <div className="flex items-center justify-between mt-2 text-xs text-neutral-500">
                                    <span>0 years</span>
                                    <span>30+ years</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Required Qualifications */}
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleSection('qualifications')}
                          className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-primary-600" />
                            Required Qualifications
                          </div>
                          {expandedSections.qualifications ? (
                            <ChevronUp className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedSections.qualifications && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-wrap gap-3">
                                {["Degree required", "TEFL", "TESOL", "CELTA", "DELTA"].map((qual) => (
                            <label
                              key={qual}
                              className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-700 rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600"
                            >
                              <input
                                type="checkbox"
                                checked={stagedFilters.qualifications.includes(qual)}
                                onChange={() => handleMultiSelect("qualifications", qual)}
                                className="rounded"
                              />
                              <span className="text-sm">{qual}</span>
                              </label>
                            ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Teaching Context */}
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleSection('teachingContext')}
                          className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-primary-600" />
                            Teaching Context
                          </div>
                          {expandedSections.teachingContext ? (
                            <ChevronUp className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedSections.teachingContext && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-wrap gap-3">
                          {["Classroom", "Online", "Both"].map((context) => (
                            <label
                              key={context}
                              className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-700 rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600"
                            >
                              <input
                                type="checkbox"
                                checked={stagedFilters.teachingContext.includes(context)}
                                onChange={() => handleMultiSelect("teachingContext", context)}
                                className="rounded"
                              />
                              <span className="text-sm">{context}</span>
                              </label>
                            ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Visa Requirement */}
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleSection('visaRequirement')}
                          className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-primary-600" />
                            Visa Requirement
                          </div>
                          {expandedSections.visaRequirement ? (
                            <ChevronUp className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedSections.visaRequirement && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <select
                                value={stagedFilters.visaRequirement}
                                onChange={(e) => handleFilterChange("visaRequirement", e.target.value)}
                                className="input"
                              >
                                <option value="">All</option>
                                <option value="Visa Sponsored">Visa Sponsored</option>
                                <option value="Visa Assistance">Visa Assistance</option>
                                <option value="No Visa Support">No Visa Support</option>
                                <option value="Must Already Have Right to Work">Must Already Have Right to Work</option>
                              </select>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* School Type */}
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleSection('schoolType')}
                          className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <School className="w-4 h-4 text-primary-600" />
                            School Type
                          </div>
                          {expandedSections.schoolType ? (
                            <ChevronUp className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedSections.schoolType && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-wrap gap-3">
                          {["Language centre", "International school", "Private school", "University", "Public school"].map((type) => (
                            <label
                              key={type}
                              className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-700 rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600"
                            >
                              <input
                                type="checkbox"
                                checked={stagedFilters.schoolTypes.includes(type)}
                                onChange={() => handleMultiSelect("schoolTypes", type)}
                                className="rounded"
                              />
                              <span className="text-sm">{type}</span>
                              </label>
                            ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Student Age Group */}
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleSection('studentAgeGroup')}
                          className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary-600" />
                            Student Age Group
                          </div>
                          {expandedSections.studentAgeGroup ? (
                            <ChevronUp className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedSections.studentAgeGroup && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-wrap gap-3">
                                {["0-5", "6-11", "12-14", "15-18", "19-30", "30+"].map((age) => (
                                  <label
                                    key={age}
                                    className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-700 rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={stagedFilters.studentAgeGroups.includes(age)}
                                      onChange={() => handleMultiSelect("studentAgeGroups", age)}
                                      className="rounded"
                                    />
                                    <span className="text-sm">{age} {age === "30+" ? "years" : "years"}</span>
                                  </label>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Start Date */}
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleSection('startDate')}
                          className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary-600" />
                            Start Date
                          </div>
                          {expandedSections.startDate ? (
                            <ChevronUp className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedSections.startDate && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <select
                                value={stagedFilters.startDate}
                                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                                className="input"
                              >
                                <option value="">All</option>
                                <option value="immediate">Immediate</option>
                                <option value="1-3_months">Next 1–3 months</option>
                                <option value="greater_than_3_months">> 3 Months</option>
                              </select>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Application Deadline */}
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleSection('deadline')}
                          className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary-600" />
                            Application Deadline
                          </div>
                          {expandedSections.deadline ? (
                            <ChevronUp className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedSections.deadline && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <select
                                value={stagedFilters.deadlineFilter}
                                onChange={(e) => handleFilterChange("deadlineFilter", e.target.value)}
                                className="input"
                              >
                                <option value="">All</option>
                                <option value="closing_soon">Closing soon (≤7 days)</option>
                                <option value="8-30_days">8–30 days</option>
                                <option value="rolling">&gt; 30 days</option>
                              </select>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                        </div>

                        {/* Sticky Footer with Action Buttons */}
                        <div className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 px-6 py-4 flex items-center justify-between rounded-b-lg flex-shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={clearFilters}
                            className="text-sm"
                          >
                            Clear All Filters
                          </Button>
                          <Button
                            type="button"
                            variant="gradient"
                            onClick={handleSearch}
                          >
                            Apply Filters
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                    </>
                  )}
                </AnimatePresence>
              <Button type="submit" variant="gradient">
                Search
              </Button>
            </div>
          </form>

          {/* Results Count */}
          <div className="mb-6 flex items-center gap-3">
            <p className="text-neutral-600 dark:text-neutral-400">
              Found <span className="font-semibold">{totalJobs}</span>{" "}
              teaching positions
            </p>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span>Updating...</span>
              </div>
            )}
          </div>

          {/* Job Listings */}
          <div className="grid gap-6 max-w-4xl mx-auto">
            {jobs.map((job) => {
              const daysLeft = getDaysUntilDeadline(job.deadline);
              // Get country flag
              const countryData = countries.find(
                (c) => c.name.toLowerCase() === job.country.toLowerCase()
              );
              const countryFlag = countryData?.flag || null;
              
              return (
                <motion.div
                  key={job.id}
                  whileHover={{ y: -4 }}
                  onClick={() => handleJobClick(job.id)}
                  className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-xl font-semibold">{job.title}</h2>
                          {job.status === "ACTIVE" && daysLeft <= 7 && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium">
                              Closing Soon
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 mb-2">
                          <Building className="w-4 h-4" />
                          <span>{job.school.name}</span>
                          {job.school.verified && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-2">
                          <span className="flex items-center gap-1">
                            {countryFlag && <span className="text-base">{countryFlag}</span>}
                            {job.city}, {job.country}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salary}
                          </span>
                          {(job.type || job.contractLength) && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {(() => {
                                const employmentType = job.type
                                  .split("_")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1).toLowerCase()
                                  )
                                  .join(" ");
                                
                                if (job.contractLength) {
                                  const contractMatch = job.contractLength.match(/(\d+)\s*(year|years|month|months)/i);
                                  if (contractMatch) {
                                    const number = contractMatch[1];
                                    const unit = contractMatch[2].toLowerCase();
                                    const singularUnit = unit === 'years' ? 'year' : unit === 'months' ? 'month' : unit;
                                    return `${number}-${singularUnit.charAt(0).toUpperCase() + singularUnit.slice(1)} ${employmentType}`;
                                  }
                                  return `${job.contractLength} ${employmentType}`;
                                }
                                return employmentType;
                              })()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-center ml-4">
                        <div className="flex items-center gap-1 text-sm text-neutral-500">
                          <Hourglass className="w-4 h-4" />
                          <span className="font-medium">
                            {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {jobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-4">
                No jobs found matching your criteria
              </p>
              <Button onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
