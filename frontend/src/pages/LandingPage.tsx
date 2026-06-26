import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md overflow-x-hidden selection:bg-primary-fixed selection:text-primary">
      {/* TopAppBar Shell */}
      <header className={`sticky top-0 z-[100] flex justify-between items-center w-full px-margin-mobile md:px-8 h-16 transition-all duration-300 ${scrolled ? 'bg-surface/95 shadow-sm' : 'bg-surface/80 backdrop-blur-md'}`}>
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center w-10 h-10 active:scale-95 duration-100 md:hidden">
            <span className="material-symbols-outlined text-primary">menu</span>
          </button>
          <h1 className="font-chewy text-3xl md:text-4xl text-primary cursor-pointer tracking-wide" onClick={() => navigate('/')}>
            Welile Car
          </h1>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate('/auth')} className="text-on-surface-variant hover:text-primary transition-colors font-label-md">Home</button>
          <button onClick={() => navigate('/auth')} className="text-on-surface-variant hover:text-primary transition-colors font-label-md">Journey</button>
          <button onClick={() => navigate('/auth')} className="text-on-surface-variant hover:text-primary transition-colors font-label-md">Bonuses</button>
        </nav>

        <button onClick={() => navigate('/auth')} className="flex items-center justify-center w-10 h-10 active:scale-95 duration-100 md:hidden">
          <span className="material-symbols-outlined text-primary">account_circle</span>
        </button>
      </header>

      <main className="relative pb-24 md:pb-12 max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row-reverse md:items-center md:gap-12 md:mt-12">
          {/* Hero Image Section */}
          <section className="pt-10 md:pt-0 flex-1 w-full">
            <div className="relative overflow-hidden rounded-2xl h-64 md:h-[500px] mb-4 md:mb-0 shadow-xl group">
              <img 
                alt="Welile Flyer" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src="/FLYER.jpeg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-4 right-4 bg-primary text-on-primary px-4 py-2 rounded-full text-label-sm font-label-sm flex items-center gap-2 shadow-lg">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                Smarter Way to Save
              </div>
            </div>
          </section>

          {/* Text & Journey Section */}
          <div className="flex-1 flex flex-col md:pr-8">
            <section className="pt-8 md:pt-0 flex flex-col gap-6">
              <div className="flex flex-col gap-base">
                <h2 className="text-headline-xl md:text-[48px] font-headline-xl text-on-surface leading-tight">Your Journey <br className="hidden md:block" /> <span className="text-primary">Starts Here.</span></h2>
                <p className="text-body-lg md:text-xl font-body-lg text-primary font-semibold mt-4">
                  Own your dream car with Welile — the smarter way to save!
                </p>
              </div>
            </section>

            {/* Kinetic Journey Track */}
            <section className="relative py-10 md:py-8 mt-4">
              <div className="absolute left-[11px] md:left-[15px] top-8 bottom-8 w-[4px] bg-gradient-to-b from-primary to-outline-variant z-0 opacity-20 rounded-full"></div>
              <div className="flex flex-col gap-10 md:gap-8 relative z-10">
                {/* Process Card */}
                <motion.div 
                  whileHover={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex gap-gutter group cursor-pointer"
                >
                  <div className="flex-none flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary text-on-primary shadow-[0px_4px_12px_rgba(120,0,206,0.3)] mt-2 md:mt-1 transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-[14px] md:text-[18px]">moving</span>
                  </div>
                  <div className="bg-surface-container-lowest rounded-xl md:rounded-2xl p-6 md:p-6 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-outline-variant/30 flex-1 hover:shadow-md transition-shadow">
                    <p className="text-body-md md:text-lg text-on-surface-variant leading-relaxed">
                      Save up to <span className="font-bold text-primary">30%</span> through flexible daily or weekly installments. Once you hit the target, we finance the remaining <span className="font-bold text-on-surface">70%</span>. Drive your dream car today.
                    </p>
                    <div className="mt-6 h-2 md:h-3 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary-container w-[30%] rounded-full relative">
                        <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/20 blur-[2px]"></div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-3">
                      <span className="text-label-sm font-label-sm text-outline">0% Start</span>
                      <span className="text-label-sm md:text-sm font-label-sm text-primary font-bold">30% Milestone</span>
                    </div>
                  </div>
                </motion.div>

                {/* Bonus Card (Special Highlight) */}
                <motion.div 
                  whileHover={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex gap-gutter group cursor-pointer"
                >
                  <div className="flex-none flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-secondary-container text-on-secondary-container shadow-sm mt-2 md:mt-1 transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-[14px] md:text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                  </div>
                  <div className="bg-primary text-on-primary rounded-xl md:rounded-2xl p-6 md:p-6 shadow-[0px_8px_16px_rgba(147,51,234,0.2)] flex-1 relative overflow-hidden group-hover:shadow-[0px_12px_24px_rgba(147,51,234,0.3)] transition-all">
                    {/* Abstract Background Decoration */}
                    <div className="absolute -right-4 -top-4 w-32 h-32 md:w-48 md:h-48 bg-on-primary-container/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] md:text-xs uppercase font-bold tracking-widest px-2 py-1 rounded">Special Offer</span>
                        <span className="text-headline-lg-mobile md:text-2xl font-headline-lg-mobile text-secondary-fixed-dim">5% Bonus</span>
                      </div>
                      <h3 className="text-headline-lg-mobile md:text-2xl font-headline-lg-mobile mb-3">Compounding Installment!</h3>
                      <p className="text-label-md md:text-base font-label-md text-on-primary-container/90 leading-relaxed">
                        Every savings installment you pay compounds by <span className="text-secondary-fixed-dim font-bold text-lg">5%</span> until the 30% target is completed, helping you reach your goal faster.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="mt-8 md:mt-8 pb-12">
              <button 
                onClick={() => navigate('/auth')}
                className="w-full md:w-auto md:px-12 h-14 md:h-16 bg-primary text-on-primary font-bold text-lg md:text-xl rounded-xl md:rounded-2xl shadow-[0px_8px_16px_rgba(147,51,234,0.2)] active:scale-95 hover:scale-[1.02] transition-all duration-200 hover:brightness-110 flex items-center justify-center gap-3 mx-auto md:mx-0"
              >
                Get Started Now
                <span className="material-symbols-outlined md:text-[24px]">arrow_forward</span>
              </button>
              <p className="text-center md:text-left text-label-sm text-outline-variant mt-4 md:pl-2">No hidden fees. Secure savings platform.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
