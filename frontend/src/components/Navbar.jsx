import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LogOut, 
  User, 
  Clock, 
  Users, 
  AlertTriangle,
  LayoutDashboard,
  FileText
} from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const isAdmin = user.position === 'Administrator';

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">WorkTrack Pro</span>
            </Link>
            
            {isAdmin && (
              <div className="hidden md:flex ml-10 space-x-4">
                <Link to="/admin" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link to="/admin/workers" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition">
                  <Users className="h-4 w-4 mr-2" />
                  Workers
                </Link>
                <Link to="/admin/attendance" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition">
                  <FileText className="h-4 w-4 mr-2" />
                  Attendance
                </Link>
                <Link to="/admin/late-reports" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Late Reports
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">{user.full_name}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {user.position}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
            
            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAdmin ? (
              <>
                <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-50">Dashboard</Link>
                <Link to="/admin/workers" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-50">Workers</Link>
                <Link to="/admin/attendance" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-50">Attendance</Link>
                <Link to="/admin/late-reports" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-50">Late Reports</Link>
              </>
            ) : (
              <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-50">Dashboard</Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;