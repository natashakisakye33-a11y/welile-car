import { motion } from 'framer-motion';
import { PlayCircle, ShieldCheck, Zap, MonitorSmartphone, Layers, CheckCircle2, Smartphone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#4C158D]/20">

      {/* Hero Section */}
      <section className="relative pt-32 pb-48 bg-[#4C158D] overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full translate-x-1/3 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#310c87]/20 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-white space-y-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight"
            >
              Brainstorming for <br /> Desired Usability
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              
              className="text-lg md:text-xl text-white/80 max-w-xl font-medium leading-relaxed"
            >
              Our vehicle financing solutions are fresh and simple and will benefit your journey greatly. Learn more about our work!
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              
              className="flex flex-col sm:flex-row items-center gap-6 pt-4"
            >
              <div className="relative w-full sm:w-auto flex-1 max-w-md">
                <input 
                  type="email" 
                  placeholder="info@yourdomain.com"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-full py-4 pl-6 pr-32 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                />
                <button className="absolute right-2 top-2 bottom-2 px-6 bg-white text-[#4C158D] font-bold rounded-full hover:bg-slate-50 transition-colors shadow-lg shadow-white/10">
                  Subscribe
                </button>
              </div>
              <button className="flex items-center gap-3 text-white font-bold hover:text-white/80 transition-colors shrink-0">
                <PlayCircle size={40} className="fill-white/20 stroke-[1.5px]" />
                Watch Video Overview
              </button>
            </motion.div>
          </div>

          {/* Hero Phone Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="flex-1 w-full max-w-md relative mx-auto lg:mx-0"
          >
            <div className="relative mx-auto w-[280px] h-[580px] bg-white rounded-[40px] shadow-2xl shadow-[#310c87]/50 border-[6px] border-slate-900 overflow-hidden flex flex-col">
              {/* Phone Notch */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20">
                <div className="w-32 h-6 bg-slate-900 rounded-b-3xl"></div>
              </div>
              {/* Screen Content */}
              <div className="flex-1 bg-slate-50 relative">
                <div className="h-48 bg-gradient-to-br from-rose-400 to-orange-400 rounded-b-[40px]"></div>
                <div className="absolute top-24 left-6 right-6 bg-white rounded-2xl shadow-xl p-4 text-center">
                  <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto -mt-12 border-4 border-white mb-2 shadow-sm"></div>
                  <h4 className="font-bold text-slate-800">John Doe</h4>
                  <p className="text-xs text-slate-400 mb-4">Harrier Owner</p>
                  <div className="h-2 w-full bg-[#4C158D] rounded-full mb-2"></div>
                  <p className="text-[10px] font-bold text-[#4C158D]">70% Completed</p>
                </div>
                <div className="mt-20 px-6 space-y-3">
                  <div className="h-16 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center px-4 gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100"></div>
                    <div className="space-y-1.5 flex-1">
                      <div className="h-2 w-1/2 bg-slate-200 rounded-full"></div>
                      <div className="h-2 w-3/4 bg-slate-100 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-16 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center px-4 gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100"></div>
                    <div className="space-y-1.5 flex-1">
                      <div className="h-2 w-1/3 bg-slate-200 rounded-full"></div>
                      <div className="h-2 w-2/3 bg-slate-100 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-20 -left-8 md:-left-12 w-20 md:w-24 h-20 md:h-24 bg-rose-500 rounded-2xl -rotate-12 opacity-80 blur-[2px]"
            ></motion.div>
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute bottom-32 -right-4 md:-right-8 w-12 md:w-16 h-12 md:h-16 bg-blue-400 rounded-full opacity-80 blur-[1px]"
            ></motion.div>
          </motion.div>
        </div>

        {/* Bottom Curve SVG */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0]">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[150px]">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C52.16,93.3,103.9,81.3,153.24,67.56,206.55,52.88,260.67,67.8,321.39,56.44Z" fill="#f8fafc"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Why Peoples Love Welile?</h2>
          <p className="text-slate-500 font-medium">
            Following reasons show some copies of adding Welile in your daily life, stress and pleasures. Emulate interaction openly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Layers, title: "Clean Design", desc: "Increase sales by showing true dynamics of your website." },
            { icon: ShieldCheck, title: "Secure Data", desc: "Build your online store securely using Welile Financing." },
            { icon: Zap, title: "Instant Updates", desc: "Realize importance of social proof in customer's purchase decision." }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 text-center group hover:-translate-y-2 transition-all duration-300 border border-slate-100"
            >
              <div className="w-16 h-16 bg-primary/10 text-[#4C158D] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#4C158D] group-hover:text-white transition-colors duration-300 rotate-3 group-hover:rotate-0">
                <feature.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* App Showcase 1 */}
      <section className="py-24 max-w-7xl mx-auto px-6 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Use Your Phone or Device to Manage Everything
            </h2>
            <div className="space-y-6">
              {[
                { icon: Smartphone, title: "Proactively syndicate open-source e-markets." },
                { icon: MonitorSmartphone, title: "Without seamlessly empower interface." },
                { icon: Layers, title: "Completely syndicate cutting-edge interfaces." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-[#4C158D] rounded-xl flex items-center justify-center shrink-0">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-600 mt-2.5">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 relative flex justify-center lg:justify-end min-h-[600px] w-full">
            {/* Phone 1 (Back) */}
            <div className="absolute right-0 lg:right-12 top-20 w-[240px] h-[500px] bg-white rounded-[32px] shadow-2xl shadow-slate-300 border-[6px] border-slate-900 overflow-hidden scale-90 opacity-60">
               <div className="h-full bg-gradient-to-br from-blue-400 to-indigo-600"></div>
            </div>
            {/* Phone 2 (Front) */}
            <div className="absolute right-12 lg:right-32 top-0 w-[260px] h-[540px] bg-white rounded-[36px] shadow-2xl shadow-slate-400/50 border-[6px] border-slate-900 overflow-hidden z-10 flex flex-col">
              <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-20">
                <div className="w-24 h-5 bg-slate-900 rounded-b-2xl"></div>
              </div>
              <div className="flex-1 bg-slate-50 p-4 pt-10 space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex gap-3 items-center">
                    <div className="w-10 h-10 bg-slate-200 rounded-full shrink-0"></div>
                    <div className="space-y-1.5 flex-1">
                      <div className="h-2 w-full bg-slate-200 rounded-full"></div>
                      <div className="h-2 w-2/3 bg-slate-100 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="relative mt-24 pt-32 pb-24 bg-[#4C158D] overflow-hidden">
        {/* Top Curve SVG */}
        <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-[0] rotate-180">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[100px]">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C52.16,93.3,103.9,81.3,153.24,67.56,206.55,52.88,260.67,67.8,321.39,56.44Z" fill="#f8fafc"></path>
          </svg>
        </div>

        {/* Background Decor */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-[#310c87] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-white space-y-6 max-w-2xl text-center md:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
              Start Managing your Apps <br/> Business, more Faster
            </h2>
            <p className="text-white/80 text-lg font-medium max-w-xl mx-auto md:mx-0">
              Objectively deliver professional value with diverse web-readiness. Collaboratively transition wireless metrics without goal-oriented results.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center md:justify-start">
              <button className="flex items-center gap-3 bg-white text-slate-900 px-6 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.82 3.59-.72 1.52.05 2.76.65 3.53 1.77-3.06 1.83-2.58 5.89.37 7.08-.75 1.86-1.58 3.09-2.57 4.04zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                <div className="text-left">
                  <p className="text-[10px] uppercase leading-none text-slate-500 font-semibold mb-0.5">Download on the</p>
                  <p className="text-sm leading-none">App Store</p>
                </div>
              </button>
              <button className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors w-full sm:w-auto justify-center border border-slate-700">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12l-10.183 10.186a1.996 1.996 0 0 1-.609-1.41V3.224c0-.53.21-1.04.609-1.41zM14.776 11.018l2.846-2.847L5.59 1.256a.998.998 0 0 0-.814-.148l10 9.91zM18.89 12.001l-3.087 3.086 2.056 1.196a1.002 1.002 0 0 0 1.032-.001L22.4 14.23c.36-.21.586-.597.586-1.015s-.226-.805-.586-1.015l-3.51-2.045-2.055 1.196 2.055 1.196zM14.776 12.983l-10 9.91c.25.093.53.11.814-.04l12.032-6.915-2.846-2.955z"/></svg>
                <div className="text-left">
                  <p className="text-[10px] uppercase leading-none text-slate-400 font-semibold mb-0.5">Get it on</p>
                  <p className="text-sm leading-none">Google Play</p>
                </div>
              </button>
            </div>
          </div>

          <div className="flex-1 relative w-full h-[300px] md:h-[400px] flex justify-center md:justify-end">
            <div className="w-[200px] h-[420px] bg-white rounded-[32px] border-[5px] border-slate-900 shadow-2xl absolute bottom-0 translate-y-12 rotate-12 overflow-hidden">
               <div className="h-full bg-slate-50 flex flex-col p-4 pt-10">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                   <div className="space-y-2 flex-1">
                     <div className="h-3 w-3/4 bg-slate-200 rounded-full"></div>
                     <div className="h-2 w-1/2 bg-slate-200 rounded-full"></div>
                   </div>
                 </div>
                 <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                   <div className="h-3 w-1/2 bg-slate-100 rounded-full mb-4"></div>
                   <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4">
                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Basic Footer */}
      <footer className="bg-slate-900 py-12 text-center text-slate-400">
        <p className="font-medium text-sm">© 2026 Welile Cars. All rights reserved.</p>
      </footer>
    </div>
  );
}
