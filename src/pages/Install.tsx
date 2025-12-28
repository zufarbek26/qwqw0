import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Download, 
  Share, 
  Plus, 
  Chrome, 
  Apple,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      <Helmet>
        <title>Установить приложение — TestLix</title>
        <meta name="description" content="Установите TestLix на своё устройство для быстрого доступа и работы офлайн" />
      </Helmet>
      <Layout>
        <div className="container py-12 px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
              <Smartphone className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Установите <span className="gradient-text">TestLix</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Установите приложение на своё устройство для быстрого доступа, 
              работы офлайн и уведомлений о новых тестах
            </p>
          </div>

          {isInstalled ? (
            <Card className="glass-card max-w-md mx-auto">
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Приложение установлено!</h2>
                <p className="text-muted-foreground">
                  TestLix уже установлен на вашем устройстве
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
              {/* Direct Install (Chrome/Edge) */}
              {deferredPrompt && (
                <Card className="glass-card border-primary/50 col-span-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-primary" />
                      Быстрая установка
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Ваш браузер поддерживает прямую установку
                    </p>
                    <Button className="btn-primary w-full" onClick={handleInstall}>
                      <Download className="h-4 w-4 mr-2" />
                      Установить сейчас
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* iOS Instructions */}
              <Card className={`glass-card ${isIOS ? 'border-primary/50' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Apple className="h-5 w-5" />
                    iPhone / iPad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Откройте в Safari</p>
                      <p className="text-sm text-muted-foreground">Используйте браузер Safari</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-1">
                        Нажмите <Share className="h-4 w-4" />
                      </p>
                      <p className="text-sm text-muted-foreground">Кнопка "Поделиться" внизу</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-1">
                        Выберите <Plus className="h-4 w-4" /> На экран "Домой"
                      </p>
                      <p className="text-sm text-muted-foreground">Прокрутите вниз в меню</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Android Instructions */}
              <Card className={`glass-card ${isAndroid ? 'border-primary/50' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Android
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Откройте в Chrome</p>
                      <p className="text-sm text-muted-foreground">Используйте браузер Chrome</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-1">
                        Нажмите <MoreVertical className="h-4 w-4" />
                      </p>
                      <p className="text-sm text-muted-foreground">Меню в правом верхнем углу</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Установить приложение</p>
                      <p className="text-sm text-muted-foreground">Или "Добавить на главный экран"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Desktop Instructions */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Chrome className="h-5 w-5" />
                    Компьютер
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Откройте в Chrome/Edge</p>
                      <p className="text-sm text-muted-foreground">Современный браузер</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-1">
                        Нажмите <Download className="h-4 w-4" /> в адресной строке
                      </p>
                      <p className="text-sm text-muted-foreground">Иконка справа</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Подтвердите установку</p>
                      <p className="text-sm text-muted-foreground">Нажмите "Установить"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Features */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-8">Преимущества приложения</h2>
            <div className="grid gap-6 md:grid-cols-3 max-w-3xl mx-auto">
              <div className="p-6 rounded-xl bg-muted/30">
                <Download className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Работает офлайн</h3>
                <p className="text-sm text-muted-foreground">Доступ к тестам без интернета</p>
              </div>
              <div className="p-6 rounded-xl bg-muted/30">
                <Smartphone className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Быстрый запуск</h3>
                <p className="text-sm text-muted-foreground">Иконка на главном экране</p>
              </div>
              <div className="p-6 rounded-xl bg-muted/30">
                <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Уведомления</h3>
                <p className="text-sm text-muted-foreground">О новых тестах и заданиях</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Install;
