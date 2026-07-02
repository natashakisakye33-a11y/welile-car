import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '@/config';
import { fetchWithTimeout } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { formatUGX } from '@/lib/format';
import { carsData } from '@/data/cars';
import { PageLoader } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';

interface DashboardData {
  health: {
    riskLevel: string;
    creditScore: number;
    qualificationStatus: string;
  };
  savings: {
    totalSaved: number;
    targetAmount: number;
    interestEarned: number;
    monthlyContribution: number;
    progressPercent: number;
    nextMilestone: {
      amountNeeded: number;
      message: string;
    };
  };
  journey: {
    currentStep: string;
    completedSteps: string[];
  };
}

const DashboardPage = () => {
  const { user, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setError(null);
        const res = await fetchWithTimeout(`${API_URL}/dashboard/summary`);
        if (res.ok) {
          const json = await res.json();
          setData({
            ...json,
            health: json.health || {
              riskLevel: 'Low',
              creditScore: 85,
              qualificationStatus: 'Building Deposit'
            },
            savings: {
              ...json.savings,
              monthlyContribution: 500000,
              nextMilestone: json.savings?.nextMilestone || {
                amountNeeded: 6600000,
                message: "Keep saving!"
              }
            }
          });
        } else {
          setError("Failed to fetch dashboard data. Please try again later.");
        }
      } catch (e) {
        console.error(e);
        setError("An unexpected network error occurred. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, session, authLoading, navigate]);

  if (loading || authLoading) {
    return <PageLoader message="Loading Dashboard..." />;
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorState title="Error Loading Dashboard" message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const progressPercent = Math.min(data?.savings?.progressPercent || 15, 100);
  const balance = data?.savings?.totalSaved || 0;
  const interest = data?.savings?.interestEarned || 0;
  
  // Get top 3 popular cars
  const featuredCars = carsData.slice(0, 3);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="mb-gutter">
        <div className="relative overflow-hidden bg-primary rounded-xl p-6 md:p-10 flex flex-col md:flex-row justify-between items-center text-on-primary shadow-lg gap-8">
          {/* Decorative element */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-secondary rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-secondary-container rounded-full opacity-10 blur-3xl"></div>
          
          <div className="relative z-10 w-full md:max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full mb-4">
              <span className="w-2 h-2 rounded-full bg-tertiary-fixed shadow-[0_0_8px_#58feb8]"></span>
              <span className="text-label-caps font-label-caps uppercase text-[10px]">Active Account</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'Joshua'}!
            </h2>
            <p className="text-secondary-fixed opacity-90 text-body-lg">
              Your vehicle ownership journey is looking great. You're currently on the <strong>{data?.journey?.currentStep || 'Saving'}</strong> phase.
            </p>
          </div>
          
          <div className="relative z-10 glass-card p-6 md:p-8 rounded-xl w-full md:w-80 shadow-xl border border-white/20 shrink-0">
            <p className="text-label-caps font-label-caps uppercase text-white/70 mb-1 text-center">Total Savings Balance</p>
            <h3 className="font-headline-lg text-headline-lg text-center mb-4">{formatUGX(balance)}</h3>
            <div className="flex justify-center">
              <span className="px-4 py-1 bg-tertiary-container text-tertiary-fixed rounded-full text-xs font-bold">
                +{formatUGX(interest)} Earned
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Company Headquarters & Journey */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-gutter">
        {/* HQ Card */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-card-padding shadow-sm border border-outline-variant/30 flex flex-col hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary-container">location_on</span>
              </div>
              <div>
                <h4 className="font-headline-md text-headline-md">Company Headquarters</h4>
                <p className="text-body-sm text-outline">Visit our main office for formal inquiries, document drops, or a cup of coffee.</p>
              </div>
            </div>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg font-bold text-primary hover:bg-surface-container transition-colors shrink-0">
              Open in Maps
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          </div>
          
          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative h-64 md:h-full rounded-xl overflow-hidden bg-surface-dim">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuChdO92akqhlCVDlu9XjYeoq0iB0_VoaCzLA9i0z2mrYST_7-1XHW0trGQio9MCVsEQsVwBHuHu4tHAZu-wPjJCNUgUMWoPxLlD2KJJeVBFdV7_NhGQvvJX5iyOmZaSkY6U5wVEBjtoHEcBPwr6ctvxgeD4SflFNkAwOBIjqkgNmI3T0h76z40s5W7x5upHg-gduCAHnvww7GnIb7hXJsLheHblukHO5MuuhSq2LyLbK6_33zguQFOwNorvz24CLLV_rHaujsvR6MDs"
                alt="Welile Car HQ Map" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm font-bold text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-primary">map</span>
                  Map View
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-6 p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-fixed rounded-lg text-primary shrink-0">
                  <span className="material-symbols-outlined">apartment</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface">Welile Technologies</p>
                  <p className="text-body-sm text-on-surface-variant">Plot 12, Palm Lane, Kabasite</p>
                  <p className="text-body-sm text-on-surface-variant">Entebbe, Uganda</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-fixed rounded-lg text-primary shrink-0">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface">Opening Hours</p>
                  <p className="text-body-sm text-on-surface-variant">Mon - Fri: 9:00 AM - 5:00 PM</p>
                  <p className="text-body-sm text-on-surface-variant">Sat: 10:00 AM - 2:00 PM</p>
                </div>
              </div>
              <div className="mt-4">
                <a 
                  href="https://wa.me/256750511507" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-sm">chat</span>
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Ownership Journey Sidebar Card */}
        <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-sm border border-outline-variant/30 overflow-hidden relative hover:shadow-md transition-shadow">
          <h4 className="font-headline-md text-headline-md mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_graph</span>
            Ownership Journey
          </h4>
          <div className="space-y-0 relative">
            {/* Vertical Line */}
            <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-outline-variant"></div>
            
            {/* Step 1: Registered */}
            <div className="flex gap-6 relative pb-10">
              <div className="z-10 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center ring-4 ring-primary/20 shrink-0">
                <span className="material-symbols-outlined text-sm">check</span>
              </div>
              <div>
                <p className="font-bold text-primary">Registered</p>
                <p className="text-body-sm text-on-surface-variant">Account verified on {(new Date(user?.createdAt || Date.now())).toLocaleDateString()}</p>
              </div>
            </div>
            
            {/* Step 2: Saving (Active) */}
            <div className="flex gap-6 relative pb-10">
              <div className="z-10 w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center ring-4 ring-secondary/20 shrink-0">
                <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>savings</span>
              </div>
              <div className="w-full pr-4">
                <p className="font-bold text-secondary">Saving</p>
                <p className="text-body-sm text-on-surface-variant">Current Phase: Building deposit balance</p>
                <div className="mt-3 w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
            </div>
            
            {/* Step 3: Qualified */}
            <div className="flex gap-6 relative pb-10">
              <div className="z-10 w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center shrink-0">
                <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
              </div>
              <div>
                <p className="font-bold text-outline">Qualified</p>
                <p className="text-body-sm text-outline italic">Requires {formatUGX(data?.savings?.nextMilestone?.amountNeeded || 5400000)}</p>
              </div>
            </div>
            
            {/* Step 4: Financing Approved */}
            <div className="flex gap-6 relative pb-10 opacity-50">
              <div className="z-10 w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center shrink-0"></div>
              <div>
                <p className="font-bold text-outline">Financing Approved</p>
              </div>
            </div>
            
            {/* Step 5: Vehicle Released */}
            <div className="flex gap-6 relative opacity-50">
              <div className="z-10 w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center shrink-0"></div>
              <div>
                <p className="font-bold text-outline">Vehicle Released</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Vehicles Section */}
      <section className="mb-gutter">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-headline-lg text-headline-lg">Featured Vehicles</h2>
            <p className="text-body-lg text-on-surface-variant hidden md:block">Available inventory matched to your profile</p>
          </div>
          <Link to="/vehicles" className="flex items-center gap-2 text-primary font-bold hover:underline shrink-0">
            View All
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {featuredCars.map((car, index) => (
            <div key={car.id} className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden group hover:shadow-md transition-shadow">
              <div className="h-56 bg-surface-container-low flex items-center justify-center p-8 relative overflow-hidden">
                <img 
                  src={car.image} 
                  alt={car.name} 
                  className="h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                />
                {index === 0 && <div className="absolute top-4 right-4 px-2 py-1 bg-white/90 rounded text-xs font-bold shadow-sm text-on-surface">Popular</div>}
                {index === 2 && <div className="absolute top-4 right-4 px-2 py-1 bg-tertiary-fixed/20 text-on-tertiary-fixed-variant rounded text-xs font-bold shadow-sm">Limited</div>}
              </div>
              <div className="p-card-padding">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-headline-md text-headline-md">{car.name}</h3>
                    <p className="font-price-lg text-price-lg text-primary">{formatUGX(car.priceUgx)}</p>
                  </div>
                  {index !== 2 && <span className="px-2 py-1 bg-tertiary-fixed/20 text-on-tertiary-fixed-variant rounded text-[10px] font-bold uppercase">In Stock</span>}
                </div>
                <div className="space-y-2 mb-6 text-body-sm">
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span className="text-on-surface-variant">Required Deposit (30%)</span>
                    <span className="font-bold text-on-surface">{formatUGX(car.priceUgx * 0.3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Est. Monthly (36m)</span>
                    <span className="font-bold text-on-surface">{formatUGX((car.priceUgx * 0.8) / 36)}</span>
                  </div>
                </div>
                <Link to={`/vehicles/${car.id}`} className="w-full py-3 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Horizontal Stepper */}
      <section className="bg-surface-container-lowest rounded-xl p-card-padding shadow-sm border border-outline-variant/30 mb-margin-desktop">
        <h4 className="font-headline-md text-headline-md mb-10 text-center">Your Road to Ownership</h4>
        <div className="relative max-w-5xl mx-auto px-4 md:px-10 hidden md:block">
          {/* Progress Line Background */}
          <div className="absolute left-10 right-10 top-5 h-1 bg-surface-container-high rounded-full"></div>
          {/* Progress Line Active */}
          <div className="absolute left-10 top-5 h-1 bg-primary rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
          
          <div className="relative flex justify-between">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="z-10 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-lg">verified</span>
              </div>
              <div>
                <p className="font-label-caps text-label-caps uppercase text-primary">Registered</p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="z-10 w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-lg ring-4 ring-white">
                <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>savings</span>
              </div>
              <div>
                <p className="font-label-caps text-label-caps uppercase text-secondary">Saving</p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center gap-3 text-center opacity-70">
              <div className="z-10 w-10 h-10 rounded-full bg-surface-container-lowest border-2 border-outline-variant flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-outline-variant"></span>
              </div>
              <div>
                <p className="font-label-caps text-label-caps uppercase text-outline">Qualified</p>
              </div>
            </div>
            {/* Step 4 */}
            <div className="flex flex-col items-center gap-3 text-center opacity-70">
              <div className="z-10 w-10 h-10 rounded-full bg-surface-container-lowest border-2 border-outline-variant flex items-center justify-center"></div>
              <div>
                <p className="font-label-caps text-label-caps uppercase text-outline">Financing</p>
              </div>
            </div>
            {/* Step 5 */}
            <div className="flex flex-col items-center gap-3 text-center opacity-70">
              <div className="z-10 w-10 h-10 rounded-full bg-surface-container-lowest border-2 border-outline-variant flex items-center justify-center"></div>
              <div>
                <p className="font-label-caps text-label-caps uppercase text-outline">Released</p>
              </div>
            </div>
            {/* Step 6 */}
            <div className="flex flex-col items-center gap-3 text-center opacity-70">
              <div className="z-10 w-10 h-10 rounded-full bg-surface-container-lowest border-2 border-outline-variant flex items-center justify-center"></div>
              <div>
                <p className="font-label-caps text-label-caps uppercase text-outline">Repayment</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
