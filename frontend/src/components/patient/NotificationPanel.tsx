// HealthSure — Notification Panel & Popover Component (Fully Localized)
// frontend/src/components/patient/NotificationPanel.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCircle2,
  Calendar,
  FileText,
  Activity,
  Pill,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PatientNotification } from '../../types/patient';
import { patientService } from '../../services/patientService';
import { useTranslation } from '../../lib/i18n/useTranslation';

export const NotificationPanel: React.FC = () => {
  const t = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<PatientNotification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    patientService.getNotifications().then(setNotifications);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    await patientService.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleItemClick = async (notif: PatientNotification) => {
    if (!notif.read) {
      await patientService.markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }
    setIsOpen(false);
  };

  const getCategoryIcon = (cat: PatientNotification['category']) => {
    switch (cat) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'referral':
        return <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'outreach':
        return <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case 'diagnostic':
        return <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'medicine':
        return <Pill className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#087F6D]" />;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-[#64748B] hover:text-[#087F6D] dark:text-[#7B9EA8] dark:hover:text-[#4FD1C5] hover:bg-[#F5F9F7] dark:hover:bg-[#0F2929] transition-all focus-visible:outline-2 focus-visible:outline-[#087F6D] cursor-pointer"
        aria-label={`${t.notifications} (${unreadCount})`}
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#087F6D] text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="p-3.5 border-b border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#073B3A]/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4] uppercase tracking-wider">
                {t.notifications}
              </h4>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#087F6D] text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-[#087F6D] dark:text-[#4FD1C5] hover:underline focus-visible:outline-2 focus-visible:outline-[#087F6D]"
              >
                {t.markAllAsRead}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#DDE8E4]/60 dark:divide-[#1A3A3A]">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#64748B] dark:text-[#7B9EA8]">
                {t.noNotifications}
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 hover:bg-[#F5F9F7] dark:hover:bg-[#0F2929] transition-colors ${
                    !notif.read ? 'bg-[#EAF7F2]/40 dark:bg-[#073B3A]/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] shrink-0 mt-0.5">
                      {getCategoryIcon(notif.category)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs ${
                            !notif.read
                              ? 'font-bold text-[#17324D] dark:text-[#E2EEF4]'
                              : 'font-semibold text-[#17324D] dark:text-[#D1E8E2]'
                          }`}
                        >
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-[#64748B] dark:text-[#7B9EA8] shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-[#64748B] dark:text-[#7B9EA8] leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.actionRoute && (
                        <div className="pt-1">
                          <Link
                            to={notif.actionRoute}
                            onClick={() => handleItemClick(notif)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#087F6D] dark:text-[#4FD1C5] hover:underline"
                          >
                            <span>{t.tabUpcoming}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
