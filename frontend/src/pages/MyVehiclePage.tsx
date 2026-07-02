import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, FileText, Calendar, Wrench, ShieldCheck, Download, CreditCard, ExternalLink, CheckCircle2 } from 'lucide-react';
import { formatUGX } from '@/lib/format';
import { carsData } from '@/data/cars';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageLoader } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { API_URL } from '@/config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MyVehiclePage = () => {
  const { data: profile, isLoading, error } = useProfile();
  const navigate = useNavigate();

  // Dialog states
  const [isLogbookOpen, setIsLogbookOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [isMileageOpen, setIsMileageOpen] = useState(false);
  const [mileageInput, setMileageInput] = useState('65240');

  const [car, setCar] = useState<any>(null);
  const [carLoading, setCarLoading] = useState(false);

  const activeProfile = profile || { selected_car_id: null, has_withdrawn_this_month: false };

  React.useEffect(() => {
    if (activeProfile?.selected_car_id) {
      setCarLoading(true);
      fetch(`${API_URL}/vehicles/${activeProfile.selected_car_id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) setCar(data);
          setCarLoading(false);
        })
        .catch(err => {
          console.error(err);
          setCarLoading(false);
        });
    }
  }, [profile?.selected_car_id]);

  if (isLoading || carLoading) {
    return <PageLoader message="Loading Vehicle Data..." />;
  }

  if (error && !profile) {
    return <ErrorState message="Could not load your vehicle data." />;
  }

  if (!activeProfile.selected_car_id || !car) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px] space-y-5 max-w-md mx-auto">
        <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center shadow-inner border border-slate-100">
          <Car size={36} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">No Vehicle Selected</h2>
          <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
            You haven't selected a vehicle to save towards or finance yet. Go to the marketplace to choose your dream vehicle!
          </p>
        </div>
        <Button onClick={() => navigate('/vehicles')} className="mt-4 px-6 py-5 rounded-2xl font-bold bg-primary hover:bg-purple-800 text-white">
          Go to Vehicle Marketplace
        </Button>
      </div>
    );
  }

  const progressPercent = 35; // Mock progress

  const handleDownload = (documentName: string) => {
    toast.success(`Downloading ${documentName}...`, {
      description: "Your document will be saved to your device shortly."
    });
  };

  const handleScheduleService = () => {
    setIsServiceOpen(false);
    toast.success("Service Scheduled!", {
      description: "We've notified your assigned garage. They will contact you shortly to confirm the time."
    });
  };

  const handleUpdateMileage = () => {
    setIsMileageOpen(false);
    toast.success("Mileage Updated", {
      description: `Your vehicle mileage has been successfully updated to ${Number(mileageInput).toLocaleString()} km.`
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Vehicle</h1>
        <p className="text-slate-500 font-medium">Manage your vehicle financing and documentation.</p>
      </div>

      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm relative">
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 shadow-sm flex items-center gap-1">
            <ShieldCheck size={14} /> Active Financing
          </span>
        </div>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-slate-50 flex items-center justify-center p-8 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent"></div>
            <img src={activeCar.image} alt={activeCar.name} className="max-h-[250px] object-contain drop-shadow-xl relative z-10 mix-blend-multiply" />
          </div>
          <div className="md:w-1/2 p-8 flex flex-col justify-center">
            <p className="text-primary font-black uppercase tracking-wider text-xs mb-1">
              {activeCar.year} • {activeCar.make} • <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[10px] font-black">{activeProfile.selected_car_condition === 'new' ? 'Brand New' : 'Used'}</span>
            </p>
            <h2 className="text-3xl font-black text-slate-900 mb-2">{activeCar.model}</h2>
            <p className="text-slate-500 text-sm font-medium mb-6">License Plate: <span className="text-slate-900 font-bold bg-slate-100 px-2 py-1 rounded">UBN 123A</span></p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Color</p>
                <p className="font-bold text-slate-700">{activeCar.specs.color || 'N/A'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Engine</p>
                <p className="font-bold text-slate-700">{activeCar.specs.engine || 'N/A'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Condition</p>
                <p className="font-bold text-slate-700 capitalize">{activeProfile.selected_car_condition || 'Used'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Target Price</p>
                <p className="font-bold text-slate-700">{formatUGX(activeProfile.selected_car_price || activeCar.priceUgx)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ownership & Financing Tracker */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="bg-primary text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-white/5 rounded-full blur-[40px] pointer-events-none"></div>
          <h3 className="text-lg font-bold mb-6 relative z-10">Ownership Progress</h3>
          
          <div className="flex items-center gap-6 mb-8 relative z-10">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-white/20" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-400" strokeWidth="3" strokeDasharray={`${progressPercent}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">{progressPercent}%</span>
              </div>
            </div>
            
            <div className="space-y-3 w-full">
              <div>
                <p className="text-primary-fixed-dim text-[10px] uppercase font-bold">Total Value</p>
                <p className="font-bold">{formatUGX(activeCar.priceUgx)}</p>
              </div>
              <div className="w-full h-[1px] bg-white/10"></div>
              <div>
                <p className="text-primary-fixed-dim text-[10px] uppercase font-bold">Paid So Far</p>
                <p className="font-bold text-emerald-300">{formatUGX(activeCar.priceUgx * (progressPercent/100))}</p>
              </div>
            </div>
          </div>

          <button onClick={() => navigate('/payment-details')} className="w-full bg-white text-primary hover:bg-slate-50 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 relative z-10">
            <CreditCard size={18} /> Make a Payment
          </button>
        </motion.div>

        {/* Digital Glovebox */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-primary" /> Digital Glovebox
          </h3>
          
          <div className="space-y-3 flex-grow">
            
            {/* Logbook Dialog */}
            <Dialog open={isLogbookOpen} onOpenChange={setIsLogbookOpen}>
              <DialogTrigger asChild>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-primary/30 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-primary shadow-sm"><FileText size={18} /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Vehicle Logbook</p>
                      <p className="text-[10px] font-medium text-amber-600">Held by Welile Car until fully paid</p>
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-slate-400 group-hover:text-primary" />
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Vehicle Logbook Status</DialogTitle>
                  <DialogDescription>
                    Information regarding the legal ownership document of your vehicle.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-slate-50 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-primary">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Logbook is currently held by Welile Car</h4>
                    <p className="text-sm text-slate-500 mt-2">
                      Because you are currently financing this vehicle, the original logbook is securely held by us. 
                      Once you have reached 100% ownership, the logbook will be formally transferred into your name and handed over to you.
                    </p>
                  </div>
                  <div className="w-full bg-white p-3 rounded-lg border border-slate-100 mt-4 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-500">Ownership Progress</span>
                      <span className="text-xs font-bold text-slate-900">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="sm:justify-end">
                  <Button type="button" variant="default" onClick={() => setIsLogbookOpen(false)}>
                    Understood
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Insurance Download Action */}
            <div onClick={() => handleDownload('Comprehensive Insurance')} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-primary/30 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg text-primary shadow-sm"><ShieldCheck size={18} /></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Comprehensive Insurance</p>
                  <p className="text-[10px] font-medium text-emerald-600">Valid until May 2027</p>
                </div>
              </div>
              <Download size={16} className="text-slate-400 group-hover:text-primary" />
            </div>

            {/* Financing Agreement Download Action */}
            <div onClick={() => handleDownload('Financing Agreement')} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-primary/30 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg text-primary shadow-sm"><FileText size={18} /></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Financing Agreement</p>
                  <p className="text-[10px] font-medium text-slate-500">Signed 12 Jun 2026</p>
                </div>
              </div>
              <Download size={16} className="text-slate-400 group-hover:text-primary" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Maintenance & Health */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Wrench size={20} className="text-primary" /> Maintenance & Services
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => setIsServiceOpen(true)}
            className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex flex-col justify-between cursor-pointer hover:border-amber-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg group-hover:bg-amber-200 transition-colors"><Calendar size={20} /></div>
              <button className="text-[10px] font-bold uppercase text-amber-700 bg-amber-200/50 hover:bg-amber-300 px-2 py-1 rounded transition-colors shadow-sm">Upcoming</button>
            </div>
            <div>
              <p className="text-amber-900 font-bold text-sm">Next Oil Change</p>
              <p className="text-amber-700 text-xs font-medium mt-1">Due in 1,200 km or 2 months</p>
            </div>
          </div>

          <Dialog open={isMileageOpen} onOpenChange={setIsMileageOpen}>
            <DialogTrigger asChild>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-white text-slate-500 shadow-sm rounded-lg group-hover:text-primary transition-colors"><Car size={20} /></div>
                  <button className="text-[10px] font-bold uppercase text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded transition-colors shadow-sm opacity-0 group-hover:opacity-100">Update</button>
                </div>
                <div>
                  <p className="text-slate-900 font-bold text-sm">Current Mileage</p>
                  <p className="text-slate-500 text-xs font-medium mt-1">{Number(mileageInput).toLocaleString()} km</p>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Update Vehicle Mileage</DialogTitle>
                <DialogDescription>
                  Keep your mileage up to date to receive accurate maintenance reminders.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="relative mb-4">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">km</span>
                  <input type="number" placeholder="Enter current mileage" value={mileageInput}
                    onChange={e => setMileageInput(e.target.value)}
                    className="w-full h-14 pl-4 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-lg font-black placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
                <p className="text-xs text-slate-500">
                  Last updated: 2 weeks ago
                </p>
              </div>
              <DialogFooter className="flex gap-2 sm:justify-end">
                <Button variant="outline" onClick={() => setIsMileageOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateMileage} disabled={!mileageInput}>Save Mileage</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Schedule Service Dialog */}
          <Dialog open={isServiceOpen} onOpenChange={setIsServiceOpen}>
            <DialogTrigger asChild>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-center items-center text-center cursor-pointer hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Wrench size={20} />
                </div>
                <p className="text-slate-900 font-bold text-sm">Schedule Service</p>
                <p className="text-slate-500 text-[10px] font-medium mt-1">Book at an approved garage</p>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule Vehicle Service</DialogTitle>
                <DialogDescription>
                  Request a maintenance appointment at one of our approved partner garages.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-start gap-4">
                  <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Regular Maintenance</h4>
                    <p className="text-xs text-slate-500 mt-1">Oil change, filter replacement, and multi-point inspection.</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  By clicking confirm, we will notify our nearest partner garage. A service advisor will call you within 2 hours to confirm your preferred date and time.
                </p>
              </div>
              <DialogFooter className="flex gap-2 sm:justify-end">
                <Button variant="outline" onClick={() => setIsServiceOpen(false)}>Cancel</Button>
                <Button onClick={handleScheduleService}>Confirm Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </motion.div>
    </div>
  );
};

export default MyVehiclePage;
