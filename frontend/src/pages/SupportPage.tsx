import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, PhoneCall, Mail, MessageCircle, ChevronDown, ChevronUp, ExternalLink, Send, Loader2, MapPin } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";

const SupportPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    
    setIsSubmittingTicket(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmittingTicket(false);
      setIsTicketDialogOpen(false);
      setTicketSubject('');
      setTicketMessage('');
      alert('Support Ticket successfully submitted! Our team will get back to you shortly.');
    }, 1500);
  };

  const faqs = [
    {
      question: "How do I make a vehicle repayment?",
      answer: "You can make a repayment directly from your Wallet by ensuring you have enough funds, or through the Repayments tab using Mobile Money (MTN/Airtel) or an authorized bank transfer. Repayments are deducted automatically based on your selected frequency if auto-pay is enabled."
    },
    {
      question: "What happens if my vehicle breaks down?",
      answer: "If your vehicle breaks down, immediately go to the 'My Vehicle' tab and click on 'Schedule Service' to notify our partner garages. If it's an emergency, please use the 24/7 hotline listed on this page. All major servicing must be done at our certified partner garages."
    },
    {
      question: "Can I change my repayment plan?",
      answer: "Yes, you can request to switch between daily, weekly, or monthly repayment plans. Please contact our support team directly to restructure your payment schedule. Note that changes are subject to review."
    },
    {
      question: "When do I get the original logbook?",
      answer: "Welile Car holds the original logbook to secure the financing. The logbook will be officially transferred into your name and handed over to you the moment 100% of your financing plan is successfully cleared."
    },
    {
      question: "How does the savings target work?",
      answer: "To unlock financing, you must save at least 30% of the vehicle's total price. You can save at your own pace through your Wallet. Once the 30% threshold is reached, the financing application will automatically unlock."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
          <LifeBuoy size={40} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">How can we help you?</h1>
        <p className="text-slate-500 font-medium max-w-lg">
          Need assistance with your vehicle, financing, or wallet? Our dedicated support team is available 24/7.
        </p>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <a href="tel:+256800123456" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center hover:border-primary hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <PhoneCall size={24} />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Call Us</h3>
          <p className="text-xs text-slate-500 font-medium mb-3">Available 24/7 for emergencies</p>
          <span className="text-blue-600 font-black mt-auto">+256 800 123 456</span>
        </a>

        <a href="https://wa.me/256772000111" target="_blank" rel="noreferrer" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center hover:border-emerald-500 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageCircle size={24} />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">WhatsApp</h3>
          <p className="text-xs text-slate-500 font-medium mb-3">Fastest for general inquiries</p>
          <span className="text-emerald-600 font-black mt-auto flex items-center gap-1">Chat Now <ExternalLink size={14} /></span>
        </a>

        <a href="mailto:support@welilecar.com" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center hover:border-primary hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Mail size={24} />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Email</h3>
          <p className="text-xs text-slate-500 font-medium mb-3">For documents & formal requests</p>
          <span className="text-primary font-black mt-auto">support@welilecar.com</span>
        </a>
      </div>
      {/* FAQs */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
          <MessageCircle size={20} className="text-primary" />
          {" "}Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index} 
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white hover:border-slate-200'}`}
              >
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left flex items-center justify-between focus:outline-none"
                >
                  <span className={`font-bold pr-4 ${isOpen ? 'text-primary' : 'text-slate-700'}`}>{faq.question}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="p-5 pt-0 text-slate-600 text-sm leading-relaxed border-t border-primary/10 mt-2">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Report an Issue */}
      <div className="bg-slate-900 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Can&apos;t find what you&apos;re looking for?</h2>
          <p className="text-slate-400 text-sm max-w-md">Our technical team is ready to resolve any bugs, app issues, or complex disputes immediately.</p>
        </div>
        <button 
          onClick={() => setIsTicketDialogOpen(true)}
          className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors shrink-0 shadow-lg shadow-black/20 whitespace-nowrap"
        >
          Open a Support Ticket
        </button>
      </div>

      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-3xl border-0 shadow-2xl">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">Submit a Ticket</h2>
              <p className="text-slate-500 text-sm">Please describe your issue in detail and our technical team will assist you.</p>
            </div>
            
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                <input 
                  type="text" 
                  required
                  placeholder="E.g. App is crashing on login"
                  className="w-full h-12 bg-slate-50 rounded-xl px-4 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                <textarea 
                  required
                  placeholder="Please provide as much detail as possible..."
                  className="w-full h-32 bg-slate-50 rounded-xl p-4 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmittingTicket || !ticketSubject || !ticketMessage}
                className="w-full h-14 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isSubmittingTicket ? (
                  <><Loader2 className="animate-spin" size={20} /> Submitting...</>
                ) : (
                  <><Send size={20} /> Submit Ticket</>
                )}
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default SupportPage;
