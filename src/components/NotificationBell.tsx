import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, CheckCheck, Trophy, BookOpen, Zap, Sparkles, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const iconMap: Record<string, React.ReactNode> = {
  'achievement': <Trophy className="h-4 w-4 text-yellow-500" />,
  'test': <BookOpen className="h-4 w-4 text-blue-500" />,
  'daily': <Zap className="h-4 w-4 text-orange-500" />,
  'ai': <Sparkles className="h-4 w-4 text-purple-500" />,
  'info': <Bell className="h-4 w-4 text-muted-foreground" />,
};

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const handleClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
        <div className="flex items-center justify-between p-2 border-b">
          <span className="font-semibold">Уведомления</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7">
              <CheckCheck className="h-3 w-3 mr-1" />
              Прочитать все
            </Button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Нет уведомлений</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <DropdownMenuItem 
              key={notification.id}
              onClick={() => handleClick(notification)}
              className={cn(
                "flex items-start gap-3 p-3 cursor-pointer",
                !notification.is_read && "bg-primary/5"
              )}
            >
              <div className="mt-0.5">
                {iconMap[notification.type] || iconMap['info']}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm truncate",
                  !notification.is_read && "font-semibold"
                )}>
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {formatDistanceToNow(new Date(notification.created_at), { 
                    addSuffix: true, 
                    locale: ru 
                  })}
                </p>
              </div>
              {!notification.is_read && (
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
              )}
            </DropdownMenuItem>
          ))
        )}
        
        {/* Quick Actions */}
        <DropdownMenuSeparator />
        <div className="p-2 space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start gap-2 border-purple-500/30 hover:bg-purple-500/10"
            onClick={() => navigate('/my-results')}
          >
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm">AI-помощник по ошибкам</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start gap-2 border-primary/30 hover:bg-primary/10"
            onClick={() => navigate('/install')}
          >
            <Download className="h-4 w-4 text-primary" />
            <span className="text-sm">Установить приложение</span>
          </Button>
        </div>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => navigate('/achievements')}
              className="justify-center text-primary"
            >
              Все достижения
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
