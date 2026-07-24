import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Trash2, Mail, Phone, MapPin } from 'lucide-react';

const WorkersList = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/workers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWorkers(response.data);
    } catch  {
      toast.error('Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this worker?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/workers/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Worker deleted successfully');
      fetchWorkers();
    } catch  {
      toast.error('Failed to delete worker');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Workers List</h1>
        <p className="mt-2 text-gray-600">Total: {workers.length} workers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workers.map((worker) => (
          <div key={worker.id} className="card hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{worker.full_name}</h3>
                <p className="text-sm text-gray-600">{worker.position}</p>
              </div>
              <button
                onClick={() => handleDelete(worker.id)}
                className="text-gray-400 hover:text-red-600 transition"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {worker.email}
              </div>
              {worker.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {worker.phone}
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {worker.department} Department
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Employee ID:</span>
                <span className="font-medium text-gray-900">{worker.employee_id}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Schedule:</span>
                <span className="font-medium text-gray-900">
                  {worker.work_start_time?.slice(0, 5)} - {worker.work_end_time?.slice(0, 5)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  worker.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {worker.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {workers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No workers found</p>
        </div>
      )}
    </div>
  );
};

export default WorkersList;