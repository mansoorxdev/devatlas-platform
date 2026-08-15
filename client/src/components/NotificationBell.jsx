import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import notificationService from '../services/notificationService';
import { useAuthStore } from '@features/auth/store/useAuthStore.js';
import { APP_PATHS } from '../constants';
import {
  Bell,
  CheckCheck,
  ExternalLink,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  UserPlus,
  Clock,
  Sparkles,
} from 'lucide-react';

export function NotificationBell() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchUnreadCount();

    // Poll unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res.success && res.data) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {}
  };

  const fetchRecentNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationService.getNotifications({ limit: 5 });
      if (res.success && res.data) {
        setNotifications(res.data.items || []);
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      fetchRecentNotifications();
      fetchUnreadCount();
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      } catch (err) {}
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {}
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'article_approved':
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'changes_requested':
        return <AlertCircle size={16} className="text-amber-500" />;
      case 'article_rejected':
      case 'assignment_cancelled':
        return <XCircle size={16} className="text-rose-500" />;
      case 'new_writer_registered':
        return <UserPlus size={16} className="text-blue-500" />;
      default:
        return <FileText size={16} className="text-brand-500" />;
    }
  };

  const viewAllPath =
    user?.role === 'admin' ? APP_PATHS.ADMIN_NOTIFICATIONS : APP_PATHS.WRITER_NOTIFICATIONS;

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 px-1.5 py-0.5 min-w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center leading-none border-2 border-white dark:border-slate-900 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-extrabold">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <CheckCheck size={13} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Body List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400">
                <RefreshCw size={20} className="mx-auto animate-spin mb-2" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No notifications</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">You are all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-start gap-3 relative ${
                    !notif.isRead ? 'bg-brand-500/[0.03] dark:bg-brand-500/[0.05]' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getNotifIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-xs font-bold truncate ${!notif.isRead ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                        {notif.title}
                      </span>
                      <span className="text-[9px] text-slate-400 shrink-0">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Link */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              to={viewAllPath}
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View all notifications</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
