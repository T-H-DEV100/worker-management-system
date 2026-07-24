import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, 
  
  AlertTriangle, 
  CheckCircle,
  TrendingUp,

} from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [lateReports, setLateReports] = useState([]);
  const [stats, setStats] = useState({
    totalWorkers: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [workersRes, attendanceRes, lateRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/workers', { headers }),
        axios.get('http://localhost:5000/api/admin/attendance/today', { headers }),
        axios.get('http://localhost:5000/api/admin/late-reports', { headers })
      ]);

      const workers = workersRes.data;
      const attendance = attendanceRes.data;
      const lateReports = lateRes.data;

      setTodayAttendance(attendance);
      setLateReports(lateReports.slice(0, 5)); // Show latest 5

      setStats({
        totalWorkers: workers.length,
        presentToday: attendance.filter(a => a.check_in_time).length,
        lateToday: attendance.filter(a => a.status === 'late').length,
        absentToday: attendance.filter(a => !a.check_in_time).length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (!status) {
      return <span className="px-3 py-1 text-xs rounded-full font-medium bg-red-100 text-red-800">Absent</span>;
    }
    
    switch(status) {
      case 'on_time':
        return <span className="px-3 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">On Time</span>;
      case 'late':
        return <span className="px-3 py-1 text-xs rounded-full font-medium bg-yellow-100 text-yellow-800">Late</span>;
      case 'early':
        return <span className="px-3 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800">Early</span>;
      default:
        return <span className="px-3 py-1 text-xs rounded-full font-medium bg-gray-100 text-gray-800">{status}</span>;
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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of worker management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Link to="/admin/workers" className="card hover:shadow-xl transition cursor-pointer">
          <div className="flex items-center">
            <Users className="h-10 w-10 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Workers</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalWorkers}</p>
            </div>
          </div>
        </Link>

        <div className="card">
          <div className="flex items-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present Today</p>
              <p className="text-3xl font-bold text-gray-900">{stats.presentToday}</p>
            </div>
          </div>
        </div>

        <Link to="/admin/late-reports" className="card hover:shadow-xl transition cursor-pointer">
          <div className="flex items-center">
            <AlertTriangle className="h-10 w-10 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Late Today</p>
              <p className="text-3xl font-bold text-gray-900">{stats.lateToday}</p>
            </div>
          </div>
        </Link>

        <div className="card">
          <div className="flex items-center">
            <TrendingUp className="h-10 w-10 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent Today</p>
              <p className="text-3xl font-bold text-gray-900">{stats.absentToday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Attendance */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Today's Attendance - {format(new Date(), 'MMMM d, yyyy')}
          </h3>
          <Link to="/admin/attendance" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All →
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {todayAttendance.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{record.full_name}</p>
                      <p className="text-xs text-gray-500">{record.employee_id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.work_start_time?.slice(0, 5)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.check_in_time 
                      ? format(new Date(record.check_in_time), 'HH:mm:ss')
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {record.minutes_late 
                      ? <span className="text-red-600 font-medium">{record.minutes_late} min</span>
                      : record.check_in_time
                        ? <span className="text-green-600">On Time</span>
                        : '-'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Late Reports */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Late Reports</h3>
          <Link to="/admin/late-reports" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All →
          </Link>
        </div>
        
        <div className="space-y-4">
          {lateReports.map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{report.full_name}</p>
                <p className="text-sm text-gray-600">
                  {report.department} • {report.employee_id}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Scheduled: {report.scheduled_time?.slice(0, 5)} | 
                  Arrived: {report.actual_time?.slice(0, 5)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">{report.minutes_late} min late</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(report.report_date), 'MMM dd, yyyy')}
                </p>
                {!report.is_reviewed && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Unreviewed
                  </span>
                )}
              </div>
            </div>
          ))}
          
          {lateReports.length === 0 && (
            <p className="text-center text-gray-500 py-4">No late reports found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;