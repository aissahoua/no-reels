// content.js - حظر المحتوى القصير في المنصات

class ContentBlocker {
  constructor() {
    this.settings = {
      facebook: true,
      instagram: true,
      youtube: true,
      tiktok: true,
      // Advanced settings
      facebookStories: true,
      facebookWatch: true,
      facebookSuggestions: true,
      instagramStories: true,
      instagramSuggestions: true,
      // YouTube advanced settings
      youtubeComments: true,
      youtubeSuggestions: true,
      youtubeNotifications: true
    };
    this.currentPlatform = this.detectPlatform();
    this.observer = null;
    this.init();
  }

  // تحديد المنصة الحالية
  detectPlatform() {
    const hostname = window.location.hostname.toLowerCase();

    if (hostname.includes('facebook.com')) return 'facebook';
    if (hostname.includes('instagram.com')) return 'instagram';
    if (hostname.includes('youtube.com')) return 'youtube';
    if (hostname.includes('tiktok.com')) return 'tiktok';

    return null;
  }

  // تهيئة الحظر
  async init() {
    try {
      // تحميل الإعدادات من التخزين
      await this.loadSettings();

      // تطبيق الحظر الأولي
      this.applyBlocking();

      // إعداد مراقبة التغييرات في DOM
      this.setupObserver();

      // الاستماع للرسائل من popup و background
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'updateSettings') {
          this.settings = message.settings;
          this.applyBlocking();
          sendResponse({ success: true });
        } else if (message.action === 'reactivateBlocking') {
          // إعادة تفعيل الحظر عند انتهاء المؤقت
          this.applyBlocking();
          sendResponse({ success: true });
        }
      });

      console.log('Short Content Blocker initialized for', this.currentPlatform);
    } catch (error) {
      console.error('خطأ في تهيئة Content Blocker:', error);
    }
  }

  // تحميل الإعدادات
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get({
        facebook: true,
        instagram: true,
        youtube: true,
        tiktok: true,
        // Advanced settings
        facebookStories: true,
        facebookWatch: true,
        facebookSuggestions: true,
        instagramStories: true,
        instagramSuggestions: true,
        // YouTube advanced settings
        youtubeComments: true,
        youtubeSuggestions: true,
        youtubeNotifications: true
      });
      this.settings = result;
    } catch (error) {
      console.error('خطأ في تحميل الإعدادات:', error);
    }
  }

  // تطبيق الحظر
  applyBlocking() {
    if (!this.currentPlatform || !this.settings[this.currentPlatform]) {
      return;
    }

    try {
      const selectors = this.getSelectorsForPlatform();
      this.hideElements(selectors);
    } catch (error) {
      console.error('خطأ في تطبيق الحظر:', error);
    }
  }

  // الحصول على المحددات لكل منصة
  getSelectorsForPlatform() {
    const selectors = {
      facebook: [
        // Reels في الصفحة الرئيسية
        '[aria-label*="reels" i]',
        '[aria-label*="reel" i]',
        '[href*="/reel/"]',
        '[href*="/reels/"]',
        '[data-pagelet*="Reels"]',
        '[data-pagelet*="reel"]',
        '.reel',
        '[role="article"][data-pagelet*="Reel"]',
        
        // محددات إضافية لـ Facebook Reels
        'div[data-pagelet*="FeedUnit_0"]',
        'div[aria-label*="Reels"]',
        'div[role="article"] a[href*="/reel/"]',
        'div[role="article"] a[href*="/reels/"]',
        '[data-testid*="reel"]',
        'div[data-testid*="story-reel"]',
        
        // قائمة Reels الجانبية
        'div[data-pagelet*="RightRail"] a[href*="/reel/"]',
        'div[data-pagelet*="watch"] a[href*="/reel/"]'
      ],
      instagram: [
        // Reels في Instagram
        '[href*="/reels/"]',
        '[href*="/reel/"]',
        '[aria-label*="reels" i]',
        '[aria-label*="reel" i]',
        '[data-testid*="reel"]',
        'article[role="presentation"] a[href*="/reel/"]',
        'div[data-testid="reel-preview"]',
        'div[role="button"][aria-label*="Reel"]',
        
        // محددات إضافية
        'div[data-testid*="clips"]',
        'article a[href*="/reel/"]',
        'div[role="button"] a[href*="/reel/"]',
        'section a[href*="/reel/"]',
        
        // Reels في الصفحة الرئيسية
        'main section article a[href*="/reel/"]',
        'div[role="tabpanel"] article a[href*="/reel/"]'
      ],
      youtube: [
        // YouTube Shorts
        '[href*="/shorts/"]',
        'ytd-reel-shelf-renderer',
        'ytd-rich-shelf-renderer[is-shorts]',
        '#shorts-container',
        'ytd-video-renderer[href*="/shorts/"]',
        'ytd-grid-video-renderer[href*="/shorts/"]',
        'ytd-compact-video-renderer[href*="/shorts/"]',
        
        // محددات إضافية للـ Shorts
        'ytd-reel-video-renderer',
        'ytd-shorts-shelf-renderer',
        'ytd-reel-player-overlay-renderer',
        '[aria-label*="shorts" i]',
        '[title*="shorts" i]',
        'a[href*="/shorts/"]',
        
        // Shorts في الشريط الجانبي
        '#secondary a[href*="/shorts/"]',
        'ytd-compact-video-renderer a[href*="/shorts/"]',
        
        // قسم Shorts المخصص
        'div[data-target-id*="shorts"]',
        'ytd-rich-section-renderer[data-content-type="shorts"]'
      ],
      tiktok: [
        'body', // حظر كامل لتيك توك
        '*'
      ]
    };

    // Add advanced selectors based on settings
    if (this.currentPlatform === 'facebook') {
      // Facebook Stories
      if (this.settings.facebookStories) {
        selectors.facebook.push(
          '[data-pagelet="Stories"]',
          '[aria-label*="story" i]',
          '[aria-label*="قصة" i]',
          'div[data-pagelet*="Stories"]',
          'div[aria-label*="Stories"]',
          'div[aria-label*="قصص" i]',
          'div[data-testid*="story"]'
        );
      }
      
      // Facebook Watch Videos
      if (this.settings.facebookWatch) {
        selectors.facebook.push(
          '[href*="/watch/"]',
          '[data-pagelet*="Watch"]',
          '[aria-label*="Watch" i]',
          '[aria-label*="مشاهدة" i]',
          'div[data-pagelet*="Video"]',
          'div[aria-label*="Video" i]',
          'div[aria-label*="فيديو" i]'
        );
      }
      
      // Facebook "People You May Know"
      if (this.settings.facebookSuggestions) {
        selectors.facebook.push(
          '[aria-label*="People You May Know" i]',
          '[aria-label*="أصدقاء قد تعرفهم" i]',
          'div[data-pagelet*="PeopleYouMayKnow"]',
          '[data-testid*="friend_suggestions"]',
          'div[aria-label*="Friend Requests" i]',
          'div[aria-label*="طلبات الصداقة" i]'
        );
      }
    }
    
    if (this.currentPlatform === 'instagram') {
      // Instagram Stories
      if (this.settings.instagramStories) {
        selectors.instagram.push(
          '[aria-label*="story" i]',
          '[aria-label*="قصة" i]',
          'div[data-testid*="stories"]',
          'div[role="menuitem"] a[href*="/stories/"]',
          'div[aria-label*="Stories" i]',
          'div[aria-label*="قصص" i]'
        );
      }
      
      // Instagram "Suggested for You"
      if (this.settings.instagramSuggestions) {
        selectors.instagram.push(
          '[aria-label*="Suggested for You" i]',
          '[aria-label*="مقترحة لك" i]',
          'div[data-testid*="suggested"]',
          'div[aria-label*="Suggestions" i]',
          'div[aria-label*="المقترحات" i]',
          'div[data-testid*="user-suggestion"]'
        );
      }
    }
    
    // Add YouTube advanced selectors based on settings
    if (this.currentPlatform === 'youtube') {
      // YouTube Comments
      if (this.settings.youtubeComments) {
        selectors.youtube.push(
          '#comments',
          '#comment-section',
          'ytd-comments',
          '#comments-container',
          '[aria-label*="Comments" i]',
          '[aria-label*="التعليقات" i]'
        );
      }
      
      // YouTube Suggestions
      if (this.settings.youtubeSuggestions) {
        selectors.youtube.push(
          '#related',
          '#related-container',
          'ytd-watch-next-secondary-results-renderer',
          '#items.ytd-watch-next-secondary-results-renderer',
          '[aria-label*="Suggestions" i]',
          '[aria-label*="المقترحات" i]'
        );
      }
      
      // YouTube Notifications
      if (this.settings.youtubeNotifications) {
        selectors.youtube.push(
          'ytd-notification-topbar-button-renderer',
          '#notification-count',
          '[aria-label*="Notifications" i]',
          '[aria-label*="الإشعارات" i]'
        );
      }
    }

    return selectors[this.currentPlatform] || [];
  }

  // إخفاء العناصر
  hideElements(selectors) {
    let blockedCount = 0;
    
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element && !element.hasAttribute('data-blocked')) {
            // للتيك توك - حظر كامل
            if (this.currentPlatform === 'tiktok' && selector === 'body') {
              element.innerHTML = `
                <div style="
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100vw;
                  height: 100vh;
                  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  z-index: 999999;
                ">
                  <h1 style="font-size: 2rem; margin-bottom: 1rem;">🚫 تيك توك محظور</h1>
                  <p style="font-size: 1.2rem; text-align: center; max-width: 600px;">
                    هذا الموقع محظور لحماية وقتك من المحتوى القصير المضر.
                  </p>
                </div>
              `;
              element.setAttribute('data-blocked', 'true');
              blockedCount++;
              return;
            }
            
            // للمنصات الأخرى - حظر انتقائي
            if (element.style.display !== 'none') {
              element.style.setProperty('display', 'none', 'important');
              element.style.setProperty('visibility', 'hidden', 'important');
              element.style.setProperty('opacity', '0', 'important');
              element.style.setProperty('height', '0', 'important');
              element.style.setProperty('width', '0', 'important');
              element.style.setProperty('overflow', 'hidden', 'important');
              element.setAttribute('data-blocked', 'true');
              element.setAttribute('data-blocked-time', Date.now().toString());
              blockedCount++;
            }
          }
        });
      } catch (error) {
        console.error('خطأ في إخفاء العناصر للمحدد:', selector, error);
      }
    });
    
    if (blockedCount > 0) {
      console.log(`تم حظر ${blockedCount} عنصر في ${this.currentPlatform}`);
    }
  }

  // إعداد مراقب DOM
  setupObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      let shouldCheck = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldCheck = true;
        }
      });

      if (shouldCheck) {
        // انتظار قليل للتأكد من تحميل العناصر
        setTimeout(() => {
          this.applyBlocking();
        }, 50);
      }
    });

    // بدء المراقبة
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // إزالة الحظر (للاختبار أو التعطيل المؤقت)
  removeBlocking() {
    try {
      const blockedElements = document.querySelectorAll('[data-blocked="true"]');
      blockedElements.forEach(element => {
        // استعادة الأنماط الأصلية
        element.style.removeProperty('display');
        element.style.removeProperty('visibility');
        element.style.removeProperty('opacity');
        element.style.removeProperty('height');
        element.style.removeProperty('width');
        element.style.removeProperty('overflow');
        element.removeAttribute('data-blocked');
        element.removeAttribute('data-blocked-time');
      });
      
      // إعادة تحميل الصفحة للتيك توك في حالة الإلغاء
      if (this.currentPlatform === 'tiktok') {
        location.reload();
      }
    } catch (error) {
      console.error('خطأ في إزالة الحظر:', error);
    }
  }

  // تنظيف عند إغلاق الصفحة
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.removeBlocking();
  }
}

// إنشاء مثيل وحيد
let blockerInstance = null;

// تهيئة عند تحميل الصفحة
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    blockerInstance = new ContentBlocker();
  });
} else {
  blockerInstance = new ContentBlocker();
}

// تهيئة عند تحميل الصفحة بالكامل (للصفحات الديناميكية)
window.addEventListener('load', () => {
  if (!blockerInstance) {
    blockerInstance = new ContentBlocker();
  }
});

// تنظيف عند إغلاق الصفحة
window.addEventListener('beforeunload', () => {
  if (blockerInstance) {
    blockerInstance.cleanup();
  }
});

// تصدير للاختبار
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentBlocker;
}