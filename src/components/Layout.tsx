import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, Bell, User as UserIcon, Check, Info } from 'lucide-react';
import api from '../api/axios';
import type { AppNotification } from '../types';
import logo from '../assets/em.png';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // Notification State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState<{title: string, type: 'success' | 'error'} | null>(null);
  const [processingNotifications, setProcessingNotifications] = useState<Set<string>>(new Set());
  const pageLabel = useMemo(() => {
    if (location.pathname.startsWith('/books/')) return 'Book Workspace';
    if (location.pathname === '/dashboard' || location.pathname === '/') return 'Dashboard';
    if (location.pathname === '/profile') return 'Profile';
    if (location.pathname === '/invitations') return 'Invitations';
    return 'Expense Management';
  }, [location.pathname]);
  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(new Date()),
    []
  );

  const showToast = (title: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({title, type});
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  useEffect(() => {
    const handleRefresh = () => fetchNotifications();
    window.addEventListener('refreshNotifications', handleRefresh);
    
    let interval: ReturnType<typeof setInterval>;
    if (user) {
      interval = setInterval(() => {
        fetchNotifications();
      }, 5000);
    }

    return () => {
      window.removeEventListener('refreshNotifications', handleRefresh);
      if (interval) clearInterval(interval);
    };
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      
      // Correct state handling based on res.data.data structure
      if (response.data && response.data.data) {
        const notificationsData = response.data.data.notifications || [];
        const count = response.data.data.unread_count || 0;
        
        setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
        setUnreadCount(count);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(notif => notif.id === id ? { ...notif, is_read: true } : notif)
      );
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleInvitationAction = async (notificationId: string, invitationId: number, action: 'accept' | 'reject', e: React.MouseEvent) => {
    e.stopPropagation(); // prevent navigation
    if (processingNotifications.has(notificationId)) return;

    setProcessingNotifications(prev => new Set(prev).add(notificationId));

    try {
      await api.post(`/invitations/${invitationId}/${action}`);
      showToast(action === 'accept' ? 'Invitation accepted! Redirecting to dashboard...' : 'Invitation rejected.', action === 'accept' ? 'success' : 'error');
      
      // Remove notification from list
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update Count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Refresh to ensure sync with backend
      fetchNotifications();
      
      if (action === 'accept') {
        if (location.pathname === '/dashboard') {
          setTimeout(() => window.location.reload(), 1500); 
        } else {
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || `Failed to ${action} invitation.`, 'error');
    } finally {
      setProcessingNotifications(prev => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen text-slate-900 flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-sky-300/15 blur-3xl" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 shadow-sm backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Left side: Logo and Desktop Nav */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center cursor-pointer gap-2" onClick={() => navigate('/dashboard')}>
                <img 
                  src={logo} 
                  alt="Expense Management" 
                  className="h-10 w-auto cursor-pointer"
                />
                <span className="text-xl font-extrabold text-slate-900 tracking-tight text-nowrap">Expense Management</span>
              </div>
            </div>

            <div className="hidden md:flex items-center">
              <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span className="font-semibold">{pageLabel}</span>
                <span className="text-slate-300">|</span>
                <span className="font-medium">{todayLabel}</span>
              </div>
            </div>

            {/* Right side: Notifications, Profile */}
            <div className="flex items-center">
              {/* Notification Dropdown Container */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setProfileOpen(false);
                  }}
                  className={`relative hidden rounded-full p-2 transition-colors sm:block ${
                    notificationsOpen ? 'bg-teal-100 text-teal-700' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full border-2 border-white bg-rose-500 text-[8px] font-bold text-white flex items-center justify-center translate-x-1 -translate-y-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel */}
                {notificationsOpen && (
                  <div className="origin-top-right absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl z-20 flex flex-col overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto w-full">
                      {(!Array.isArray(notifications) || notifications.length === 0) ? (
                        <div className="px-4 py-8 text-center flex flex-col items-center">
                          <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                            <Bell className="h-5 w-5 text-slate-400" />
                          </div>
                          <p className="text-sm font-medium text-slate-600">No notifications</p>
                          <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-slate-100">
                          {Array.isArray(notifications) && notifications.map((notification) => {
                            const isUnread = !notification.is_read;
                            const isInvitation = notification.type?.toLowerCase().includes('invitation') || notification.title?.toLowerCase().includes('invite');
                            const invitationId = notification.data?.invitation_id;
                            
                            return (
                              <li 
                                key={notification.id} 
                                onClick={() => {
                                  if (isUnread) handleMarkAsRead(notification.id);
                                  if (notification.data?.action_url) {
                                    navigate(notification.data.action_url);
                                  } else if (isInvitation) {
                                    navigate('/invitations');
                                  }
                                  setNotificationsOpen(false);
                                }}
                                className={`p-4 hover:bg-slate-50 transition-colors relative cursor-pointer group flex gap-3 flex-col sm:flex-row ${isUnread ? 'bg-teal-50/60' : 'bg-white'}`}
                              >
                                <div className="flex gap-3 w-full">
                                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-0.5 ${isUnread ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-400'}`}>
                                    <Info className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm tracking-tight ${isUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                                      {notification.title || 'Notification'}
                                    </p>
                                    <p className={`text-xs mt-0.5 ${isUnread ? 'text-slate-600 font-medium' : 'text-slate-500'}`} style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                      {notification.message || ''}
                                    </p>
                                    
                                    {isInvitation && invitationId && (
                                      <div className="mt-3 flex gap-2">
                                        <button 
                                          onClick={(e) => handleInvitationAction(notification.id, invitationId, 'accept', e)}
                                          disabled={processingNotifications.has(notification.id)}
                                          className="flex-1 text-xs flex items-center justify-center font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed py-1.5 px-2 rounded-md shadow-sm transition-colors"
                                        >
                                          {processingNotifications.has(notification.id) ? '...' : 'Accept ✅'}
                                        </button>
                                        <button 
                                          onClick={(e) => handleInvitationAction(notification.id, invitationId, 'reject', e)}
                                          disabled={processingNotifications.has(notification.id)}
                                          className="flex-1 text-xs flex items-center justify-center font-bold text-slate-700 bg-white hover:bg-rose-50 hover:text-rose-700 border border-slate-200 hover:border-rose-200 disabled:opacity-50 disabled:cursor-not-allowed py-1.5 px-2 rounded-md shadow-sm transition-colors"
                                        >
                                          {processingNotifications.has(notification.id) ? '...' : 'Reject ❌'}
                                        </button>
                                      </div>
                                    )}

                                    <p className="text-[10px] text-slate-400 mt-1.5 uppercase tracking-wider font-semibold">
                                      {new Date(notification.created_at).toLocaleString()}
                                    </p>
                                  </div>
                                  {isUnread && !isInvitation && (
                                    <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                      <button 
                                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                                        className="p-1 rounded-full text-teal-600 hover:bg-teal-100 transition-colors"
                                        title="Mark as read"
                                      >
                                        <Check className="h-4 w-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="h-6 w-px bg-slate-200 mx-3 hidden sm:block"></div>
              
              {/* Profile dropdown */}
              <div className="relative ml-2 sm:ml-0" ref={profileDropdownRef}>
                <button 
                  onClick={() => {
                    setProfileOpen(!profileOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 hover:bg-teal-200 transition-colors border border-teal-200">
                    <span className="font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || <UserIcon className="h-4 w-4" />}
                    </span>
                  </div>
                </button>
                
                {profileOpen && (
                  <>
                    <div className="origin-top-right absolute right-0 mt-3 w-56 rounded-xl shadow-lg py-1 bg-white z-20 border border-slate-200">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-xs font-medium text-slate-500 truncate">{user?.email || ''}</p>
                      </div>
                      <Link 
                        to="/profile" 
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                      >
                        <UserIcon className="mr-3 h-4 w-4 text-slate-400" />
                        View Profile
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-semibold transition-colors border-t border-slate-100"
                      >
                        <LogOut className="mr-3 h-4 w-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center sm:hidden ml-4">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-white shadow-lg absolute w-full z-40">
            <div className="pt-2 pb-3 space-y-1">
              {/* Logo handles dashboard navigation */}
            </div>
            <div className="pt-4 pb-4 border-t border-slate-100 bg-slate-50">
              <div className="flex items-center px-4 mb-3">
                <div className="flex-shrink-0 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 border border-teal-200">
                    <span className="font-semibold text-lg">
                      {user?.name?.charAt(0).toUpperCase() || <UserIcon className="h-5 w-5" />}
                    </span>
                  </div>
                  <div>
                    <div className="text-base font-semibold text-slate-900">{user?.name}</div>
                    <div className="text-sm font-medium text-slate-500">{user?.email}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <button 
                  onClick={() => {
                    setNotificationsOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  <Bell className="h-5 w-5 mr-3 text-slate-400" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <Link 
                  to="/profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  <UserIcon className="h-5 w-5 mr-3 text-slate-400" />
                  View Profile
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-3 text-base font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  <LogOut className="h-5 w-5 mr-3 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div key={location.pathname} className="animate-fade-in-up">
          {children}
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-slate-600">
            Copyright {new Date().getFullYear()} - All rights reserved.
          </p>
          <p className="text-sm font-semibold text-slate-700">
            Powered by <span className="text-teal-700">Ketan Chavda</span>
          </p>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
          <div className={`rounded-xl px-4 py-3 shadow-lg border text-sm font-bold flex items-center ${
            toastMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {toastMessage.type === 'success' ? <Check className="h-4 w-4 mr-2" /> : <Info className="h-4 w-4 mr-2" />}
            {toastMessage.title}
          </div>
        </div>
      )}
    </div>
  );
};
