import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, subDays } from 'date-fns';
import { Download } from 'lucide-react';

const AttendanceReport = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchAttendance();
  }, [dateRange]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/attendance/today', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (!status) {
      return <span className="px-3 py-1 text-xs rounded-full font-medium bg-gray-100 text-gray-800">Not Marked</span>;
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

  const handleExport = () => {
    const csvData = attendance.map(row => ({
      'Employee Name': row.full_name,
      'Employee ID': row.employee_id,
      'Department': row.department,
      'Scheduled Time': row.work_start_time,
      'Check In': row.check_in_time ? format(new Date(row.check_in_time), 'HH:mm:ss') : 'N/A',
      'Status': row.status || 'N/A',
      'Minutes Late': row.minutes_late || 0
    }));

    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(csvData[0]).join(",") + "\n" +
      csvData.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Report</h1>
          <p className="mt-2 text-gray-600">
            {format(new Date(), 'MMMM d, yyyy')}
          </p>
        </div>
        
        <button
          onClick={handleExport}
          className="btn-secondary flex items-center space-x-2"
        >
          <Download className="h-5 w-5" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendance.map((record, index) => (
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
                        ? <span className="text-green-600">-</span>
                        : <span className="text-gray-400">-</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-6">
        <div className="card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Present</h4>
          <p className="text-2xl font-bold text-green-600">
            {attendance.filter(a => a.check_in_time).length}
          </p>
        </div>
        <div className="card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Late</h4>
          <p className="text-2xl font-bold text-yellow-600">
            {attendance.filter(a => a.status === 'late').length}
          </p>
        </div>
        <div className="card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Absent</h4>
          <p className="text-2xl font-bold text-red-600">
            {attendance.filter(a => !a.check_in_time).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;