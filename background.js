// background.js - إدارة الخلفية للإضافة

class BackgroundManager {
  constructor() {
    this.timers = {
      facebook: null,
      instagram: null,
      youtube: null,
      tiktok: null
    };
    this.disabledUntil = {
      facebook: null,
      instagram: null,
      youtube: null,
      tiktok: null
    };
    this.init();
  }

  async init() {
    try {
      // تحميل الحالة المحفوظة
      await this.loadState();

      // إعداد المستمع للرسائل
      this.setupMessageListener();

      // التحقق من المؤقت الحالي
      this.checkTimer();

      // تحديث الأيقونة الأولية
      this.updateIcon();

      console.log('Background Manager initialized');
    } catch (error) {
      console.error('خطأ في تهيئة Background Manager:', error);
    }
  }

  // تحميل الحالة من التخزين
  async loadState() {
    try {
      const result = await chrome.storage.sync.get({
        disabledUntil: {
          facebook: null,
          instagram: null,
          youtube: null,
          tiktok: null
        }
      });

      this.disabledUntil = result.disabledUntil;
    } catch (error) {
      console.error('خطأ في تحميل الحالة:', error);
    }
  }

  // حفظ الحالة في التخزين
  async saveState() {
    try {
      await chrome.storage.sync.set({
        disabledUntil: this.disabledUntil
      });
    } catch (error) {
      console.error('خطأ في حفظ الحالة:', error);
    }
  }

  // إعداد مستمع الرسائل
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // للردود غير المتزامنة
    });
  }

  // معالجة الرسائل
  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'setTimer':
          await this.setTimer(message.platform, message.disabledUntil);
          sendResponse({ success: true });
          break;

        case 'clearTimer':
          await this.clearTimer(message.platform);
          sendResponse({ success: true });
          break;

        case 'getStatus':
          sendResponse({
            disabledUntil: this.disabledUntil,
            timeRemaining: this.getTimeRemaining()
          });
          break;

        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('خطأ في معالجة الرسالة:', error);
      sendResponse({ error: error.message });
    }
  }

  // تعيين مؤقت لمنصة محددة
  async setTimer(platform, disabledUntil) {
    try {
      this.disabledUntil[platform] = disabledUntil;
      await this.saveState();
      this.updateIcon();

      // إلغاء المؤقت السابق للمنصة
      if (this.timers[platform]) {
        clearTimeout(this.timers[platform]);
      }

      // حساب الوقت المتبقي
      const timeRemaining = disabledUntil - Date.now();

      if (timeRemaining > 0) {
        this.timers[platform] = setTimeout(() => {
          this.onTimerEnd(platform);
        }, timeRemaining);

        console.log(`Timer set for ${platform}:`, Math.ceil(timeRemaining / 1000), 'seconds');
      } else {
        // المؤقت انتهى بالفعل
        this.onTimerEnd(platform);
      }
    } catch (error) {
      console.error('خطأ في تعيين المؤقت:', error);
    }
  }

  // إلغاء مؤقت منصة محددة
  async clearTimer(platform) {
    try {
      if (this.timers[platform]) {
        clearTimeout(this.timers[platform]);
        this.timers[platform] = null;
      }

      this.disabledUntil[platform] = null;
      await this.saveState();
      this.updateIcon();

      console.log(`Timer cleared for ${platform}`);
    } catch (error) {
      console.error('خطأ في إلغاء المؤقت:', error);
    }
  }

  // عند انتهاء مؤقت منصة محددة
  async onTimerEnd(platform) {
    try {
      console.log(`Timer ended for ${platform}`);

      this.disabledUntil[platform] = null;
      this.timers[platform] = null;

      await this.saveState();
      this.updateIcon();

      // إرسال إشعار
      await this.showNotification(platform);

      // إعادة تفعيل الحظر في جميع التبويبات
      await this.reactivateBlocking();
    } catch (error) {
      console.error('خطأ عند انتهاء المؤقت:', error);
    }
  }

  // إعادة تفعيل الحظر
  async reactivateBlocking() {
    try {
      const tabs = await chrome.tabs.query({
        url: ['*://*.facebook.com/*', '*://*.instagram.com/*', '*://*.youtube.com/*', '*://*.tiktok.com/*']
      });

      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'reactivateBlocking'
        }).catch(() => {
          // تجاهل الأخطاء للتبويبات التي لا تحتوي على content script
        });
      });
    } catch (error) {
      console.error('خطأ في إعادة تفعيل الحظر:', error);
    }
  }

  // عرض إشعار
  async showNotification(platform) {
    try {
      const platformNames = {
        facebook: 'فيسبوك',
        instagram: 'إنستغرام',
        youtube: 'يوتيوب',
        tiktok: 'تيك توك'
      };
      
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-128.png',
        title: 'انتهى وقت الراحة',
        message: `تم إعادة تفعيل حظر المحتوى القصير في ${platformNames[platform] || platform}`
      });
    } catch (error) {
      console.error('خطأ في عرض الإشعار:', error);
    }
  }

  // تحديث الأيقونة
  updateIcon() {
    try {
      const hasDisabled = Object.values(this.disabledUntil).some(time => time && time > Date.now());
      const iconPath = hasDisabled ? 'icons/icon-disabled-128.png' : 'icons/icon-128.png';

      chrome.action.setIcon({
        path: {
          16: iconPath.replace('128', '16'),
          48: iconPath.replace('128', '48'),
          128: iconPath
        }
      });

      // تحديث النص التوضيحي
      const title = hasDisabled ?
        'الحظر معطل مؤقتاً - انقر للتحقق' :
        'حظر المحتوى القصير مفعل';

      chrome.action.setTitle({ title });
    } catch (error) {
      console.error('خطأ في تحديث الأيقونة:', error);
    }
  }

  // حساب الوقت المتبقي
  getTimeRemaining() {
    const times = {};
    Object.keys(this.disabledUntil).forEach(platform => {
      if (this.disabledUntil[platform]) {
        times[platform] = Math.max(0, this.disabledUntil[platform] - Date.now());
      }
    });
    return times;
  }

  // التحقق من المؤقتات عند البدء
  checkTimer() {
    Object.keys(this.disabledUntil).forEach(platform => {
      if (this.disabledUntil[platform]) {
        if (this.disabledUntil[platform] > Date.now()) {
          this.setTimer(platform, this.disabledUntil[platform]);
        } else {
          // المؤقت انتهى أثناء عدم تشغيل الإضافة
          this.onTimerEnd(platform);
        }
      }
    });
  }

  // تنظيف عند إغلاق الإضافة
  cleanup() {
    Object.values(this.timers).forEach(timer => {
      if (timer) {
        clearTimeout(timer);
      }
    });
  }
}

// إنشاء مثيل وحيد
const backgroundManager = new BackgroundManager();

// تنظيف عند إغلاق الإضافة
chrome.runtime.onSuspend.addListener(() => {
  backgroundManager.cleanup();
});