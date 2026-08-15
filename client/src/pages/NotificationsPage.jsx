import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';
import notificationService from '../services/notificationService';
import {
  Bell,
  CheckCheck,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export function NotificationsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentReadFilter = searchParams.get('isRead') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, [currentReadFilter, currentPage]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await notificationService.getNotifications({
        page: currentPage,
        limit: 15,
        isRead: currentReadFilter,
      });
      if (res.success && res.data) {
        setNotifications(res.data.items || []);
        setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      } catch (err) {}
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {}
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'article_approved':
        return <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />;
      case 'changes_requested':
        return <AlertCircle size={18} className="text-amber-500 shrink-0" />;
      case 'article_rejected':
      case 'assignment_cancelled':
        return <XCircle size={18} className="text-rose-500 shrink-0" />;
      case 'new_writer_registered':
        return <UserPlus size={18} className="text-blue-500 shrink-0" />;
      default:
        return <FileText size={18} className="text-brand-500 shrink-0" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Notifications — DevAtlas Platform</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
        <Container className="max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Your Notifications</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Updates regarding article submissions, editorial reviews, and content briefs.
              </p>
            </div>

            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <CheckCheck size={15} />
              <span>Mark all as read</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2.5 shadow-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 mb-6">
            {[
              { id: 'all', label: 'All Notifications' },
              { id: 'false', label: 'Unread Only' },
              { id: 'true', label: 'Read Only' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ isRead: tab.id, page: '1' })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  currentReadFilter === tab.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List */}
          {isLoading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
              <RefreshCw size={24} className="mx-auto text-brand-500 animate-spin mb-3" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
              <Bell size={36} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Notifications</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No notifications match your current filter criteria.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer flex items-start gap-4 ${
                    !notif.isRead ? 'bg-brand-500/[0.03] dark:bg-brand-500/[0.05]' : ''
                  }`}
                >
                  <div className="mt-0.5">{getNotifIcon(notif.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={`text-sm font-bold ${!notif.isRead ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                        {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  {!notif.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0 mt-1.5" title="Unread" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination Footer */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-8">
              <button
                onClick={() => setSearchParams({ isRead: currentReadFilter, page: (currentPage - 1).toString() })}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                Page {currentPage} of {pagination.pages}
              </span>

              <button
                onClick={() => setSearchParams({ isRead: currentReadFilter, page: (currentPage + 1).toString() })}
                disabled={currentPage === pagination.pages}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}

export default NotificationsPage;
