import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <section
        className="relative hero min-h-screen"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1740&q=80')",
        }}
      >
        <div className="hero-overlay bg-white/70"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-3xl">
            <h1 className="mb-6 text-5xl font-bold leading-tight">
              Teach • Inspire • Explore Central Asia
            </h1>
            <p className="mb-8 text-lg">
              CELTA-qualified teachers meet pioneering schools across Central
              Asia. Premium visibility, AI-matching, vibrant community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/jobs" className="btn btn-primary btn-wide text-white">
                Find a Job
              </Link>
              <Link
                to="/pricing"
                className="btn btn-outline btn-accent btn-wide"
              >
                Post a Vacancy
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-md">
              <div className="card-body items-center text-center">
                <h2 className="card-title">Premium Exposure</h2>
                <p>
                  Stand out with featured listings to attract the best
                  candidates.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-md">
              <div className="card-body items-center text-center">
                <h2 className="card-title">Verified CELTA Profiles</h2>
                <p>
                  All teachers on TeachMatch KZ hold internationally-recognised
                  CELTA certification.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-md">
              <div className="card-body items-center text-center">
                <h2 className="card-title">AI-Powered Matching</h2>
                <p>
                  Save time and hire faster with intelligent, data-driven
                  recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
