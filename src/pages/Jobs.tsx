import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  Clock,
  Building,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { format } from "date-fns";

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
  location: string;
  salary: string;
  type: string;
  status: string;
  deadline: string;
  createdAt: string;
  school: School;
  _count: {
    applications: number;
  };
}

export default function Jobs() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [filters, setFilters] = useState({
    location: searchParams.get("location") || "",
    type: searchParams.get("type") || "",
    sort: searchParams.get("sort") || "latest",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [searchParams]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filters.location) params.append("location", filters.location);
      if (filters.type) params.append("type", filters.type);
      if (filters.sort) params.append("sort", filters.sort);

      const response = await fetch(`/api/jobs/public?${params}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      // Show mock data for demo
      setJobs([
        {
          id: "1",
          title: "Senior English Teacher - CELTA Required",
          description: "We are seeking an experienced English teacher...",
          location: "Almaty, Kazakhstan",
          salary: "$2,800 - $3,500/month",
          type: "FULL_TIME",
          status: "ACTIVE",
          deadline: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          createdAt: new Date().toISOString(),
          school: {
            id: "1",
            name: "International School of Almaty",
            city: "Almaty",
            country: "Kazakhstan",
            verified: true,
          },
          _count: { applications: 12 },
        },
        {
          id: "2",
          title: "Primary ESL Teacher",
          description: "Join our dynamic team of educators...",
          location: "Astana, Kazakhstan",
          salary: "$2,200 - $2,800/month",
          type: "FULL_TIME",
          status: "ACTIVE",
          deadline: new Date(
            Date.now() + 45 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          school: {
            id: "2",
            name: "Astana International School",
            city: "Astana",
            country: "Kazakhstan",
            verified: true,
          },
          _count: { applications: 8 },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (filters.location) params.append("location", filters.location);
    if (filters.type) params.append("type", filters.type);
    if (filters.sort) params.append("sort", filters.sort);
    setSearchParams(params);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-neutral-50 dark:bg-neutral-900">
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
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-8">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by job title, school, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <ChevronDown
                  className={`w-4 h-4 ml-2 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </Button>
              <Button type="submit" variant="gradient">
                Search
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid md:grid-cols-3 gap-4 mt-4 p-4 bg-white dark:bg-neutral-800 rounded-lg"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City or country"
                    value={filters.location}
                    onChange={(e) =>
                      setFilters({ ...filters, location: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Job Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters({ ...filters, type: e.target.value })
                    }
                    className="input"
                  >
                    <option value="">All Types</option>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sort}
                    onChange={(e) =>
                      setFilters({ ...filters, sort: e.target.value })
                    }
                    className="input"
                  >
                    <option value="latest">Latest</option>
                    <option value="deadline">Deadline</option>
                    <option value="salary_high">Salary (High to Low)</option>
                    <option value="salary_low">Salary (Low to High)</option>
                  </select>
                </div>
              </motion.div>
            )}
          </form>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-neutral-600 dark:text-neutral-400">
              Found <span className="font-semibold">{jobs.length}</span>{" "}
              teaching positions
            </p>
          </div>

          {/* Job Listings */}
          <div className="grid gap-6 max-w-4xl mx-auto">
            {jobs.map((job) => {
              const daysLeft = getDaysUntilDeadline(job.deadline);
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
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 mb-3">
                          <Building className="w-4 h-4" />
                          <span>{job.school.name}</span>
                          {job.school.verified && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
                          {job.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salary}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.type.replace("_", " ")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Posted {format(new Date(job.createdAt), "MMM d")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                          </span>
                        </div>
                      </div>
                      <div className="text-center ml-4">
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                          {job._count.applications}
                        </div>
                        <div className="text-xs text-neutral-500">
                          applicants
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
              <Button onClick={() => window.location.reload()}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
