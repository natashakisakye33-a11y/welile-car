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
import { useUser, useClerk } from '@clerk/clerk-react';
import { useProfile, useUpdateProfile, CARS } from '@/hooks/useProfile';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { isAdmin, isCfo } = useAuth();
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const { data: profile } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', residence: '' });
  
  const [cameraMode, setCameraMode] = useState<'options' | 'webcam' | 'preview'>('options');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dynamic customer details populated from hooks, falling back to mock defaults
  const customer = {
    name: profile?.name || clerkUser?.fullName || clerkUser?.firstName || "N/A",
    email: clerkUser?.primaryEmailAddress?.emailAddress || "N/A",
    phone: profile?.phone || clerkUser?.primaryPhoneNumber?.phoneNumber || "N/A",
    residence: profile?.residence || "N/A",
    kycStatus: "Verified",
    joinDate: clerkUser?.createdAt 
      ? new Date(clerkUser.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
      : "May 15, 2026",
    activeLoan: profile?.selected_car_id 
      ? (CARS.find(c => c.id === profile.selected_car_id)?.name || "Toyota Vitz (UBM 492X)") 
      : "Toyota Vitz (UBM 492X)"
  };

  const currentAvatarUrl = profile?.avatar_url || clerkUser?.imageUrl;

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
            { avatar_url: compressed },
            {
              onSuccess: () => {
                toast.success("Profile picture updated successfully!");
                setIsModalOpen(false);
                setIsLoading(false);
              },
              onError: () => {
                toast.error("Failed to save profile picture.");
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
          { avatar_url: compressed },
          {
            onSuccess: () => {
              toast.success("Profile picture updated successfully!");
              setIsModalOpen(false);
              setIsLoading(false);
              setCameraMode('options');
            },
            onError: () => {
              toast.error("Failed to save profile picture.");
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
      { avatar_url: '' },
      {
        onSuccess: () => {
          toast.success("Profile picture removed.");
          setIsModalOpen(false);
          setIsLoading(false);
        },
        onError: () => {
          toast.error("Failed to remove profile picture.");
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
      residence: customer.residence
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    updateProfileMutation.mutate(
      { name: editForm.name, phone: editForm.phone, residence: editForm.residence },
      {
        onSuccess: () => {
          toast.success("Profile details updated successfully!");
          setIsEditModalOpen(false);
          setIsLoading(false);
        },
        onError: () => {
          toast.error("Failed to update profile details.");
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

  const handleSwitchRole = async (role: 'ADMIN' | 'CFO') => {
    setIsLoading(true);
    try {
      const { fetchWithTimeout } = await import('@/lib/api');
      const { API_URL } = await import('@/config');
      const res = await fetchWithTimeout(`${API_URL}/users/me/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        toast.success(`Role changed to ${role}. Refreshing...`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error('Failed to change role');
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setIsLoading(false);
    }
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
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Member Since</p>
                  <p className="font-bold text-slate-800">{customer.joinDate}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              {isAdmin && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="w-full sm:w-auto bg-[#4C158D]/10 hover:bg-[#4C158D]/20 text-[#4C158D] font-bold py-3.5 px-8 rounded-xl transition-colors flex items-center justify-center sm:justify-start gap-2"
                >
                  <ShieldCheck size={18} />
                  Admin Dashboard
                </button>
              )}
              
              {isCfo && (
                <button 
                  onClick={() => navigate('/cfo')}
                  className="w-full sm:w-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold py-3.5 px-8 rounded-xl transition-colors flex items-center justify-center sm:justify-start gap-2"
                >
                  <ShieldCheck size={18} />
                  CFO Portal
                </button>
              )}

              {!isAdmin && (
                <button 
                  onClick={() => handleSwitchRole('ADMIN')}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-8 rounded-xl transition-colors flex items-center justify-center sm:justify-start gap-2"
                >
                  <ShieldCheck size={18} />
                  Switch to Admin Role
                </button>
              )}

              {!isCfo && (
                <button 
                  onClick={() => handleSwitchRole('CFO')}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-8 rounded-xl transition-colors flex items-center justify-center sm:justify-start gap-2"
                >
                  <ShieldCheck size={18} />
                  Switch to CFO Role
                </button>
              )}

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

      {/* Profile Photo Upload and Camera Capture Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) handleCloseModal(); }}>
        <DialogContent className="sm:max-w-md rounded-[28px] overflow-hidden border border-slate-100 p-6 bg-white shadow-2xl">
          <DialogHeader className="pb-4 border-b border-slate-100 text-center sm:text-left">
            <DialogTitle className="text-xl font-extrabold text-slate-800">Update Profile Picture</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm mt-1">
              Select a photo from your device or use your webcam to capture a live snapshot.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 flex flex-col items-center justify-center">
            
            {cameraMode === 'options' && (
              <div className="w-full space-y-6">
                {/* Current Photo Preview inside Modal */}
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full border-4 border-[#4C158D]/10 p-1 bg-white shadow-lg shadow-slate-100">
                    <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center overflow-hidden">
                      {currentAvatarUrl ? (
                        <img src={currentAvatarUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="text-slate-300 w-14 h-14" />
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

                  {currentAvatarUrl && (
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
                    {/* Square cropped mirrored webcam feed */}
                    <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-full overflow-hidden bg-slate-900 border-4 border-slate-100 shadow-xl flex items-center justify-center">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                      {/* Guides to capture a nice centered selfie */}
                      <div className="absolute inset-6 rounded-full border-2 border-white/20 border-dashed pointer-events-none"></div>
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
                {/* Square preview of captured photo */}
                <div className="w-full aspect-square max-w-[280px] mx-auto rounded-full overflow-hidden bg-slate-100 border-4 border-slate-100 shadow-xl relative">
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

