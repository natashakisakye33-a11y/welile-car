import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Car, Key, Plus, X, Upload, CheckCircle2 } from 'lucide-react';
import { API_URL } from '@/config';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const DealerDashboard = () => {
  const { session } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('Sedan');
  const [tagline, setTagline] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const fetchVehicles = () => {
    if (!session?.access_token) return;
    
    fetch(`${API_URL}/vehicles`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    })
    .then(res => res.json())
    .then(data => {
      setVehicles(data);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;

    const formData = new FormData();
    formData.append('make', make);
    formData.append('model', model);
    formData.append('year', year);
    formData.append('price', price);
    formData.append('type', type);
    formData.append('tagline', tagline);
    
    files.forEach(file => {
      formData.append('gallery', file);
    });

    const loadingToast = toast.loading('Uploading vehicle...');
    
    try {
      const res = await fetch(`${API_URL}/vehicles`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: formData
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Vehicle added successfully!', { id: loadingToast });
        setShowAddModal(false);
        fetchVehicles();
        // Reset form
        setMake(''); setModel(''); setYear(''); setPrice(''); setFiles([]); setTagline('');
      } else {
        toast.error(data.error || 'Failed to add vehicle', { id: loadingToast });
      }
    } catch (err) {
      toast.error('Network error. Check your connection.', { id: loadingToast });
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Dealer & Inventory Portal</h1>
            <p className="text-slate-500 font-medium">Manage vehicle inventory and track sales.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={20} /> Add New Vehicle
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <Car size={24} className="text-blue-500 mb-4" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Available Inventory</p>
            <p className="text-2xl font-black text-slate-800">{vehicles.length} Vehicles</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <Key size={24} className="text-emerald-500 mb-4" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Vehicles Financed & Delivered</p>
            <p className="text-2xl font-black text-slate-800">0</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold text-sm">
              <tr>
                <th className="p-4 pl-6">Vehicle</th>
                <th className="p-4">Type</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Loading...</td></tr>
              ) : vehicles.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-medium">No vehicles in inventory yet. Click Add New Vehicle!</td></tr>
              ) : vehicles.map((v: any) => (
                <tr key={v.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="p-4 pl-6 flex items-center gap-3">
                    <img src={v.image} alt={v.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100" />
                    <div>
                      <p className="font-bold text-slate-900">{v.name}</p>
                      <p className="text-xs font-medium text-slate-500">{v.year}</p>
                    </div>
                  </td>
                  <td className="p-4 text-slate-700 font-medium">{v.type}</td>
                  <td className="p-4 font-bold text-primary">{v.priceStr}</td>
                  <td className="p-4">
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-bold">Available</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-extrabold text-xl text-slate-900">Add New Vehicle</h3>
              <button onClick={() => setShowAddModal(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddVehicle} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Make (e.g. Toyota)</label>
                  <input required value={make} onChange={e => setMake(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Model (e.g. Vitz)</label>
                  <input required value={model} onChange={e => setModel(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Year</label>
                  <input required type="number" value={year} onChange={e => setYear(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Price (UGX)</label>
                  <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-primary">
                    <option>Sedan</option>
                    <option>Hatchback</option>
                    <option>SUV</option>
                    <option>Minivan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tagline (e.g. Perfect for family)</label>
                  <input required value={tagline} onChange={e => setTagline(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-primary" />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-extrabold text-slate-800 mb-2">Vehicle Photos (Upload from Device/Gallery)</label>
                <div className="border-4 border-dashed border-[#4C158D]/30 rounded-3xl p-10 text-center bg-purple-50/50 hover:bg-purple-50 relative transition-all group cursor-pointer overflow-hidden">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files) {
                        setFiles(Array.from(e.target.files));
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#4C158D]/10 group-hover:scale-110 transition-transform">
                    <Upload size={40} className="text-[#4C158D]" />
                  </div>
                  <h4 className="font-black text-xl text-slate-900 mb-1">Upload from Device Gallery</h4>
                  <p className="font-bold text-[#4C158D]">Tap here to open your photos or camera</p>
                  <p className="flex items-center justify-center text-sm font-semibold text-slate-500 mt-3 bg-white inline-block px-4 py-1.5 rounded-full shadow-sm">
                    {files.length > 0 ? <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> {files.length} photos selected!</span> : '0 photos selected'}
                  </p>
                </div>
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20">
                Save Vehicle
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default DealerDashboard;
