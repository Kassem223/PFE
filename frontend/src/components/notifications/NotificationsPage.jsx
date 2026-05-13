import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationsPage = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [processingNotif, setProcessingNotif] = useState(null);
  const [notifStatus, setNotifStatus] = useState(null);

  useEffect(() => {
    const loadUserData = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchNotifications(parsedUser.id);
      }
    };

    loadUserData();
    window.addEventListener('userUpdated', loadUserData);
    return () => {
      window.removeEventListener('userUpdated', loadUserData);
    };
  }, []);

  const fetchNotifications = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/users/${userId}/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleInvitationResponse = async (invitationId, response, notificationId = null) => {
    if (processingNotif) return;
    setProcessingNotif(notificationId || invitationId);
    setNotifStatus(null);

    try {
      if (invitationId && invitationId !== 'undefined') {
        try {
          await axios.put(`http://localhost:3000/api/invitations/${invitationId}/respond`, { response });
        } catch (invitErr) {
          console.error('Error updating invitation status:', invitErr);
        }
      }

      if (notificationId) {
        try {
          await axios.put(`http://localhost:3000/api/notifications/${notificationId}/read`);
        } catch (readErr) {
          console.error('Error marking notification as read:', readErr);
        }
      }

      setNotifications((prev) =>
        prev.filter((n) => String(n.id_notification || n.id) !== String(notificationId))
      );

      setNotifStatus({
        message: response === 'accepted' ? 'Invitation acceptée !' : 'Invitation refusée',
        type: 'success',
      });

      setTimeout(() => setNotifStatus(null), 3000);

      if (user) {
        setTimeout(() => fetchNotifications(user.id), 1000);
      }
    } catch (error) {
      console.error('Error in handleInvitationResponse:', error);
      setNotifStatus({ message: 'Erreur lors de la réponse', type: 'error' });
      setTimeout(() => setNotifStatus(null), 3000);
    } finally {
      setProcessingNotif(null);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reservation_invitation':
        return '📅';
      case 'reservation_accepted':
        return '✅';
      case 'reservation_refused':
        return '❌';
      case 'reservation_reminder':
        return '⏰';
      default:
        return '📬';
    }
  };

  const parseNotificationData = (notification) => {
    if (notification.data) {
      try {
        return typeof notification.data === 'string' ? JSON.parse(notification.data) : notification.data;
      } catch (e) {
        return {};
      }
    }
    return {};
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {notifStatus && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2 duration-300 ${
              notifStatus.type === 'success'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            }`}
          >
            {notifStatus.type === 'success' ? '✅' : '❌'} {notifStatus.message}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Aucune notification pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const data = parseNotificationData(notification);
              const isInvitation = notification.type === 'reservation_invitation';
              return (
                <div
                  key={notification.id_notification}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 transition-all duration-200 hover:shadow-lg ${
                    !notification.is_read ? 'ring-2 ring-blue-500/30 dark:ring-blue-400/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 transition-all duration-200 ${
                        !notification.is_read ? 'bg-blue-500 shadow-lg' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{notification.title}</h3>
                        {!notification.is_read && (
                          <span className="ml-auto px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full font-medium">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-3 text-base">{notification.message}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
                        {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>

                      {isInvitation && (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            disabled={processingNotif === notification.id_notification}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInvitationResponse(data.invitation_id, 'accepted', notification.id_notification);
                            }}
                            className={`flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                              processingNotif === notification.id_notification ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                          >
                            {processingNotif === notification.id_notification ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              '✅ Accepter'
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={processingNotif === notification.id_notification}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInvitationResponse(data.invitation_id, 'refused', notification.id_notification);
                            }}
                            className={`flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                              processingNotif === notification.id_notification ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                          >
                            {processingNotif === notification.id_notification ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              '❌ Refuser'
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
