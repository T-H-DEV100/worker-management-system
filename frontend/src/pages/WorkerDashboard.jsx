import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  LogIn, 
  LogOut, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Timer
} from 'lucide-react';
import { format } from 'date-fns';

const WorkerDashboard = ({ user }) => {
  const [attendance, setAttendance] = useState([]);
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalDays: 0,
    onTime: 0,
    late: 0,
    absent: 0
  });

  useEffect(() => {
    fetchAttendanceHistory();
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/attendance/history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const todayRecord = response.data.find(record => {
        const recordDate = new Date(record.check_in_time).toDateString();
        return recordDate === new Date().toDateString();
      });
      
      setTodayStatus(todayRecord || null);
    } catch (error) {
      console.error('Error fetching today status:', error);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/attendance/history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setAttendance(response.data);
      
      // Calculate stats
      const total = response.data.length;
      const onTime = response.data.filter(a => a.status === 'on_time').length;
      const late = response.data.filter(a => a.status === 'late').length;
      const absent = response.data.filter(a => a.status === 'absent').length;
      
      setStats({
        totalDays: total,
        onTime: onTime,
        late: late,
        absent: absent
      });
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/attendance/check-in', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      toast.success(response.data.message);
      await fetchTodayStatus();
      await fetchAttendanceHistory();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/attendance/check-out', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      toast.success(response.data.message);
      await fetchTodayStatus();
      await fetchAttendanceHistory();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'on_time': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'on_time': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'late': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user.full_name}
        </h1>
        <p className="mt-2 text-gray-600">
          {user.position} • {user.department || 'General'} Department
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Days</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalDays}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On Time</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.onTime}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Late</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.late}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Timer className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled Time</p>
              <p className="text-2xl font-semibold text-gray-900">{user.work_start_time?.slice(0, 5)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Check In/Out Section */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
            <p className="text-sm text-gray-600 mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          
          {todayStatus ? (
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${getStatusColor(todayStatus.status)}`}>
                {getStatusIcon(todayStatus.status)}
                <span className="font-medium capitalize">{todayStatus.status.replace('_', ' ')}</span>
              </div>
              
              {todayStatus.check_in_time && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Check-in:</span>{' '}
                  {format(new Date(todayStatus.check_in_time), 'HH:mm:ss')}
                </div>
              )}
              
              {todayStatus.check_out_time && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Check-out:</span>{' '}
                  {format(new Date(todayStatus.check_out_time), 'HH:mm:ss')}
                </div>
              )}
              
              {!todayStatus.check_out_time && (
                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="btn-danger flex items-center space-x-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Check Out</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              <LogIn className="h-5 w-5" />
              <span>Check In</span>
            </button>
          )}
        </div>
      </div>

      {/* Attendance History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Attendance History</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendance.map((record, index) => {
                const checkIn = new Date(record.check_in_time);
                const checkOut = record.check_out_time ? new Date(record.check_out_time) : null;
                const duration = checkOut ? Math.round((checkOut - checkIn) / 3600000 * 10) / 10 : null;

                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(checkIn, 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(checkIn, 'HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {checkOut ? format(checkOut, 'HH:mm:ss') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium capitalize ${getStatusColor(record.status)}`}>
                        {record.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {duration ? `${duration}h` : '-'}
                    </td>
                  </tr>
                );
              })}
              
              {attendance.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;