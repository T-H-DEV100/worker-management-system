import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const LateReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/late-reports', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReports(response.data);
    } catch  {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/late-reports/${id}/review`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Report marked as reviewed');
      fetchReports();
    } catch  {
      toast.error('Failed to update report');
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
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-8 w-8 text-yellow-600" />
          <h1 className="text-3xl font-bold text-gray-900">Late Reports</h1>
        </div>
        <p className="mt-2 text-gray-600">Total: {reports.length} late reports</p>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {report.full_name}
                  </h3>
                  <span className="text-sm text-gray-600">
                    {report.employee_id}
                  </span>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {report.department}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Report Date</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(report.report_date), 'MMMM d, yyyy')}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Scheduled Time</p>
                    <p className="font-medium text-gray-900">
                      {report.scheduled_time?.slice(0, 5)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Actual Arrival</p>
                    <p className="font-medium text-gray-900">
                      {report.actual_time?.slice(0, 5)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-4">
                  <div className="flex items-center bg-red-50 px-4 py-2 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-lg font-bold text-red-600">
                      {report.minutes_late} minutes late
                    </span>
                  </div>

                  {!report.is_reviewed ? (
                    <button
                      onClick={() => handleMarkReviewed(report.id)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>Mark as Reviewed</span>
                    </button>
                  ) : (
                    <div className="flex items-center bg-green-50 px-4 py-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-600 font-medium">Reviewed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No late reports found</p>
            <p className="text-gray-400 text-sm">All workers are on time!</p>
          </div>
        )}
      </div>

      {reports.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="card">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Total Reports</h4>
            <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
          </div>
          <div className="card">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Reviewed</h4>
            <p className="text-2xl font-bold text-green-600">
              {reports.filter(r => r.is_reviewed).length}
            </p>
          </div>
          <div className="card">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Unreviewed</h4>
            <p className="text-2xl font-bold text-red-600">
              {reports.filter(r => !r.is_reviewed).length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LateReports;