import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  LogOut, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  Car,
  Camera,
  Upload,
  Trash2,
  RotateCcw,
  Loader2,
  Monitor,
  Lock,
  Globe,
  AlertCircle,
  Bell,
  CreditCard,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { API_URL } from '@/config';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { carsData } from '@/data/cars';

export default function ProfilePage() {
  const { isAdmin, isCfo, signOut, user: customUser, session } = useAuth();
  const { data: profile } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const navigate = useNavigate();

  const [photoType, setPhotoType] = useState<'avatar' | 'passport'>('avatar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', residence: '', nationalId: '', employmentStatus: '' });
  
  const [cameraMode, setCameraMode] = useState<'options' | 'webcam' | 'preview'>('options');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dynamic customer details populated from hooks, falling back to mock defaults
  const customer = {
    name: profile?.name || customUser?.name || "N/A",
    email: customUser?.email || "N/A",
    phone: profile?.phone || (customUser as any)?.phone || "N/A",
    residence: profile?.residence || "N/A",
    nationalId: profile?.national_id || "Not Provided",
    employmentStatus: profile?.employment_status || "Not Provided",
    kycStatus: profile?.kycStatus || "PENDING",
    joinDate: customUser?.createdAt 
      ? new Date(customUser.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
      : "May 15, 2026",
    activeLoan: profile?.selectedVehicleId 
      ? (() => {
          const matchedCar = carsData.find(c => c.id.toString() === profile.selectedVehicleId?.toString());
          return {
            id: profile.selectedVehicleId,
            name: matchedCar?.name || "Selected Vehicle",
            image: matchedCar?.images?.[0] || matchedCar?.image || null,
            price: profile.selectedVehiclePrice ? `UGX ${profile.selectedVehiclePrice.toLocaleString()}` : (matchedCar ? `UGX ${matchedCar.priceUgx.toLocaleString()}` : "N/A"),
            condition: profile.selectedVehicleCondition || 'used'
          };
        })()
      : null
  };

  const currentAvatarUrl = profile?.avatar_url || undefined;
  const currentPassportUrl = profile?.passport_url || undefined;

  // Compress/resize image helper to fit in localStorage limits
  const compressImage = (base64Str: string, maxWidth = 256, maxHeight = 256): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = (err) => reject(err);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const compressed = await compressImage(base64);
          updateProfileMutation.mutate(
            photoType === 'avatar'
              ? { avatar_url: compressed }
              : { passport_url: compressed },
            {
              onSuccess: () => {
                toast.success(`${photoType === 'avatar' ? 'Profile picture' : 'Passport photo'} updated successfully!`);
                setIsModalOpen(false);
                setIsLoading(false);
              },
              onError: (err: any) => {
                toast.error(err.message || `Failed to save ${photoType === 'avatar' ? 'profile picture' : 'passport photo'}.`);
                setIsLoading(false);
              }
            }
          );
        } catch (err) {
          console.error(err);
          toast.error("Failed to compress and upload image.");
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    setCapturedPhoto(null);
    setCameraMode('webcam');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 400, height: 400, facingMode: 'user' } 
      });
      setStream(mediaStream);
      
      // Delay slightly to ensure video element is rendered and bound
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(e => console.error("Error playing video:", e));
        }
      }, 100);
    } catch (err) {
      console.error(err);
      setCameraError('Could not access camera. Please check browser permissions.');
      setCameraMode('options');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takeSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const size = Math.min(video.videoWidth, video.videoHeight || 400);
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Center crop the video feed
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedPhoto(dataUrl);
        setCameraMode('preview');
        stopCamera();
      }
    }
  };

  const saveSnapshot = async () => {
    if (capturedPhoto) {
      setIsLoading(true);
      try {
        const compressed = await compressImage(capturedPhoto);
        updateProfileMutation.mutate(
          photoType === 'avatar'
            ? { avatar_url: compressed }
            : { passport_url: compressed },
          {
            onSuccess: () => {
              toast.success(`${photoType === 'avatar' ? 'Profile picture' : 'Passport photo'} updated successfully!`);
              setIsModalOpen(false);
              setIsLoading(false);
              setCameraMode('options');
            },
            onError: (err: any) => {
              toast.error(err.message || `Failed to save ${photoType === 'avatar' ? 'profile picture' : 'passport photo'}.`);
              setIsLoading(false);
            }
          }
        );
      } catch (err) {
        console.error(err);
        toast.error("Error processing captured image.");
        setIsLoading(false);
      }
    }
  };

  const removePhoto = () => {
    setIsLoading(true);
    updateProfileMutation.mutate(
      photoType === 'avatar'
        ? { avatar_url: '' }
        : { passport_url: '' },
      {
        onSuccess: () => {
          toast.success(`${photoType === 'avatar' ? 'Profile picture' : 'Passport photo'} removed.`);
          setIsModalOpen(false);
          setIsLoading(false);
        },
        onError: (err: any) => {
          toast.error(err.message || `Failed to remove ${photoType === 'avatar' ? 'profile picture' : 'passport photo'}.`);
          setIsLoading(false);
        }
      }
    );
  };

  const handleCloseModal = () => {
    stopCamera();
    setIsModalOpen(false);
    setCameraMode('options');
    setCapturedPhoto(null);
  };

  const openEditModal = () => {
    setEditForm({
      name: customer.name,
      phone: customer.phone,
      residence: customer.residence,
      nationalId: customer.nationalId === 'Not Provided' ? '' : customer.nationalId,
      employmentStatus: customer.employmentStatus === 'Not Provided' ? '' : customer.employmentStatus
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    updateProfileMutation.mutate(
      { 
        name: editForm.name, 
        phone: editForm.phone, 
        residence: editForm.residence,
        national_id: editForm.nationalId,
        employment_status: editForm.employmentStatus
      },
      {
        onSuccess: () => {
          toast.success("Profile details updated successfully!");
          setIsEditModalOpen(false);
          setIsLoading(false);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to update profile details.");
          setIsLoading(false);
        }
      }
    );
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#4C158D]/20 flex flex-col pb-24">

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full flex-grow">
        
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">My Profile</h1>
          <p className="text-slate-500 font-medium mt-2">Manage your personal details and account settings.</p>
        </div>

        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          
          {/* Header section with Avatar */}
          <div className="bg-[#4C158D] p-8 sm:p-12 relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <div 
              onClick={() => setIsModalOpen(true)}
              className="relative group cursor-pointer"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden relative border-4 border-white/20 hover:border-white transition-all">
                {currentAvatarUrl ? (
                  <img 
                    src={currentAvatarUrl} 
                    alt={customer.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl sm:text-5xl font-black text-[#4C158D]">
                    {customer.name.charAt(0)}
                  </span>
                )}
                
                {/* Premium glassmorphic hover overlay */}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 select-none">
                  <Camera size={22} className="animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Edit Photo</span>
                </div>
              </div>
              
              <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1.5 sm:p-2 rounded-full shadow-md border-4 border-[#4C158D] group-hover:scale-105 transition-transform">
                <ShieldCheck size={20} />
              </div>
            </div>

            <div className="text-center sm:text-left text-white z-10">
              <h2 className="text-3xl font-black">{customer.name}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 opacity-80">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-sm font-bold uppercase tracking-wider">KYC {customer.kycStatus}</span>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            
            {/* Details Grid */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText size={20} className="text-[#4C158D]" />
                Personal Details
              </h3>
              <button 
                onClick={openEditModal}
                className="text-sm font-bold text-[#4C158D] hover:bg-[#4C158D]/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                Edit Details
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#4C158D] shadow-sm">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <p className="font-bold text-slate-800">{customer.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#4C158D] shadow-sm">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                  <p className="font-bold text-slate-800">{customer.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#4C158D] shadow-sm">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Residence</p>
                  <p className="font-bold text-slate-800">{customer.residence}</p>
                </div>
              </div>


              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#4C158D] shadow-sm">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employment Status</p>
                  <p className="font-bold text-slate-800">{customer.employmentStatus}</p>
                </div>
              </div>

            </div>

            {/* Split Grid for Passport and Purchasing Item */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              
              

              {/* Item am purchasing */}
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Car size={20} className="text-[#4C158D]" />
                    Item I'm Purchasing
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mb-4">
                    Your currently selected vehicle. Keep saving to reach the 30% deposit target to unlock financing.
                  </p>
                </div>
                
                {customer.activeLoan ? (
                  <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                      {customer.activeLoan.image ? (
                        <img 
                          src={customer.activeLoan.image} 
                          alt={customer.activeLoan.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                          <Car size={24} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-extrabold text-slate-800 text-sm leading-snug">{customer.activeLoan.name}</h4>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5 capitalize">{customer.activeLoan.condition} Condition</p>
                      <p className="text-sm font-black text-[#4C158D] mt-1">{customer.activeLoan.price}</p>
                    </div>
                    
                    <button 
                      onClick={() => navigate('/cars')}
                      className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors"
                      title="Change Car"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-100 border-dashed text-center">
                    <AlertCircle size={28} className="text-amber-500 mb-2" />
                    <h4 className="font-bold text-slate-800 text-xs">No Vehicle Selected</h4>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                      Choose your dream car now to start saving and build your repayment plan.
                    </p>
                    <button 
                      onClick={() => navigate('/cars')}
                      className="mt-3 bg-[#4C158D] text-white hover:bg-[#3f2bc2] font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-sm shadow-[#4C158D]/20"
                    >
                      Browse Available Cars
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">




              <button 
                onClick={handleLogout}
                className="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 px-8 rounded-xl transition-colors flex items-center justify-center sm:justify-start gap-2"
              >
                <LogOut size={18} />
                Log Out Securely
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Profile Photo / Passport Photo Upload and Camera Capture Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) handleCloseModal(); }}>
        <DialogContent className="sm:max-w-md rounded-[28px] overflow-hidden border border-slate-100 p-6 bg-white shadow-2xl">
          <DialogHeader className="pb-4 border-b border-slate-100 text-center sm:text-left">
            <DialogTitle className="text-xl font-extrabold text-slate-800">
              Update {photoType === 'avatar' ? 'Profile Picture' : 'Official Passport Photo'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm mt-1">
              Select a photo from your device or use your webcam to capture a live snapshot.
              {photoType === 'passport' && " Please ensure your head is centered inside the guide overlay."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 flex flex-col items-center justify-center">
            
            {cameraMode === 'options' && (
              <div className="w-full space-y-6">
                {/* Current Photo Preview inside Modal */}
                <div className="flex justify-center">
                  <div className={`w-32 h-32 border-4 border-[#4C158D]/10 p-1 bg-white shadow-lg shadow-slate-100 ${photoType === 'passport' ? 'rounded-[24px]' : 'rounded-full'}`}>
                    <div className={`w-full h-full bg-slate-50 flex items-center justify-center overflow-hidden ${photoType === 'passport' ? 'rounded-[18px]' : 'rounded-full'}`}>
                      {photoType === 'avatar' ? (
                        currentAvatarUrl ? (
                          <img src={currentAvatarUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="text-slate-300 w-14 h-14" />
                        )
                      ) : (
                        currentPassportUrl ? (
                          <img 
                            src={currentPassportUrl.startsWith('/') ? `${API_URL}${currentPassportUrl}` : currentPassportUrl} 
                            alt="Passport Preview" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <User className="text-slate-300 w-14 h-14" />
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="w-full h-13 bg-[#4C158D] hover:bg-[#3f2bc2] text-white font-bold rounded-xl transition-all shadow-md shadow-[#4C158D]/25 flex items-center justify-center gap-2.5 text-sm disabled:opacity-50"
                  >
                    <Upload size={18} />
                    Upload Photo from Device
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />

                  <button 
                    onClick={startCamera}
                    disabled={isLoading}
                    className="w-full h-13 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2.5 text-sm disabled:opacity-50"
                  >
                    <Camera size={18} className="text-[#4C158D]" />
                    Take Photo with Camera
                  </button>

                  {((photoType === 'avatar' && currentAvatarUrl) || (photoType === 'passport' && currentPassportUrl)) && (
                    <button 
                      onClick={removePhoto}
                      disabled={isLoading}
                      className="w-full h-13 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2.5 text-sm disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                      Remove Current Photo
                    </button>
                  )}
                </div>
              </div>
            )}

            {cameraMode === 'webcam' && (
              <div className="w-full flex flex-col items-center gap-6">
                {cameraError ? (
                  <div className="text-center p-6 bg-red-50 rounded-2xl text-red-600 border border-red-100 text-sm font-semibold w-full">
                    {cameraError}
                    <button 
                      onClick={startCamera} 
                      className="mt-3 text-xs bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 block mx-auto transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Mirrored webcam feed */}
                    <div className={`relative w-full aspect-square max-w-[280px] mx-auto overflow-hidden bg-slate-900 border-4 border-slate-100 shadow-xl flex items-center justify-center ${photoType === 'passport' ? 'rounded-[24px]' : 'rounded-full'}`}>
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                      
                      {/* Standard passport head outline or generic outline */}
                      {photoType === 'passport' ? (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-75">
                          <svg className="w-full h-full text-white/60" viewBox="0 0 100 100" fill="none">
                            <ellipse cx="50" cy="40" rx="18" ry="24" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                            <path d="M25 85 C25 65, 30 60, 50 60 C70 60, 75 65, 75 85" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                            <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
                            <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
                          </svg>
                        </div>
                      ) : (
                        <div className="absolute inset-6 rounded-full border-2 border-white/20 border-dashed pointer-events-none"></div>
                      )}
                    </div>

                    <div className="flex gap-3 w-full">
                      <button 
                        onClick={() => { stopCamera(); setCameraMode('options'); }}
                        className="flex-1 h-13 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={takeSnapshot}
                        className="flex-1 h-13 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm"
                      >
                        <Camera size={18} />
                        Shutter Button
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {cameraMode === 'preview' && capturedPhoto && (
              <div className="w-full flex flex-col items-center gap-6">
                {/* Preview of captured photo */}
                <div className={`w-full aspect-square max-w-[280px] mx-auto overflow-hidden bg-slate-100 border-4 border-slate-100 shadow-xl relative ${photoType === 'passport' ? 'rounded-[24px]' : 'rounded-full'}`}>
                  <img src={capturedPhoto} alt="Captured preview" className="w-full h-full object-cover" />
                </div>

                <div className="flex gap-3 w-full">
                  <button 
                    onClick={startCamera}
                    disabled={isLoading}
                    className="flex-1 h-13 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    <RotateCcw size={18} />
                    Retake Photo
                  </button>
                  <button 
                    onClick={saveSnapshot}
                    disabled={isLoading}
                    className="flex-1 h-13 bg-[#4C158D] hover:bg-[#3f2bc2] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#4C158D]/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                    Use This Photo
                  </button>
                </div>
              </div>
            )}

          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Details Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[28px] overflow-hidden border border-slate-100 p-6 bg-white shadow-2xl">
          <DialogHeader className="pb-4 border-b border-slate-100 text-center sm:text-left">
            <DialogTitle className="text-xl font-extrabold text-slate-800">Edit Personal Details</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm mt-1">
              Update your contact information and residence.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="py-4 flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Full Name</label>
              <input 
                type="text" 
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4C158D]/30 transition-all"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Phone Number</label>
              <input 
                type="text" 
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4C158D]/30 transition-all"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Residence</label>
              <input 
                type="text" 
                value={editForm.residence}
                onChange={(e) => setEditForm(prev => ({ ...prev, residence: e.target.value }))}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4C158D]/30 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">National ID / Passport No.</label>
              <input 
                type="text" 
                value={editForm.nationalId}
                onChange={(e) => setEditForm(prev => ({ ...prev, nationalId: e.target.value }))}
                placeholder="Enter national ID or passport number"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4C158D]/30 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Employment Status</label>
              <select
                value={editForm.employmentStatus}
                onChange={(e) => setEditForm(prev => ({ ...prev, employmentStatus: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4C158D]/30 transition-all animate-none"
              >
                <option value="">Select Status</option>
                <option value="Employed">Employed</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Student">Student</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            <div className="flex gap-3 mt-4">
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 h-13 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm py-3"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isLoading}
                className="flex-1 h-13 bg-[#4C158D] hover:bg-[#3f2bc2] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#4C158D]/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50 py-3"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                Save Changes
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

