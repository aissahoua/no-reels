// popup.js - إدارة واجهة المستخدم للإضافة

class ShortContentBlocker {
  constructor() {
    this.platforms = ['facebook', 'instagram', 'youtube', 'tiktok'];
    // Add advanced settings
    this.advancedSettings = {
      facebook: ['stories', 'watch', 'suggestions'],
      instagram: ['stories', 'suggestions'],
      youtube: ['comments', 'suggestions', 'notifications']
    };
    this.timerInterval = null;
    this.languageManager = window.languageManager;
    this.currentPlatform = null;
    this.restoreOnRestart = true;
    this.pendingAction = null; // لحفظ الإجراء المؤقت
    this.init();
  }

  async init() {
    try {
      // تهيئة مدير اللغات أولاً
      await this.languageManager.init();
      
      // إرسال ping إلى background script للتأكد من التفعيل
      try {
        await chrome.runtime.sendMessage({ action: 'ping' });
        console.log('✅ Background script pinged successfully');
      } catch (error) {
        console.log('⚠️ Background script ping failed:', error);
      }
      
      await this.loadSettings();
      this.bindEvents();
      this.updateUI();
      
      // تنظيف المحاولات القديمة عند بدء التشغيل
      this.cleanupAllOldAttempts();
      
      // تحديث الواجهة بناءً على اللغة
      this.languageManager.updateUI();
    } catch (error) {
      console.error('خطأ في تهيئة الإضافة:', error);
    }
  }

  // تحميل الإعدادات من التخزين
  async loadSettings() {
    try {
      let result;
      
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        result = await chrome.storage.sync.get({
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
          youtubeNotifications: true,
          disabledUntil: {
            facebook: null,
            instagram: null,
            youtube: null,
            tiktok: null
          },
          restoreOnRestart: [],
          temporaryDisableAttempts: {
            facebook: [],
            instagram: [],
            youtube: [],
            tiktok: []
          }
        });
      } else {
        // Fallback to localStorage for testing
        const stored = localStorage.getItem('extension-settings');
        result = stored ? JSON.parse(stored) : {
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
          youtubeNotifications: true,
          disabledUntil: {
            facebook: null,
            instagram: null,
            youtube: null,
            tiktok: null
          },
          restoreOnRestart: [],
          temporaryDisableAttempts: {
            facebook: [],
            instagram: [],
            youtube: [],
            tiktok: []
          }
        };
      }

      this.settings = result;
      console.log('Loaded settings:', this.settings);
      console.log('Restore on restart list:', result.restoreOnRestart);
      console.log('Temporary disable attempts:', result.temporaryDisableAttempts);
      
      // في حالة وجود قائمة إعادة الحظر، اتصل بـ background script
      if (result.restoreOnRestart && result.restoreOnRestart.length > 0) {
        console.log('🔄 Found platforms to restore, triggering background restore...');
        try {
          await chrome.runtime.sendMessage({ action: 'triggerRestore' });
        } catch (error) {
          console.log('⚠️ Failed to trigger background restore:', error);
        }
      }
      
      this.checkDisabledState();
    } catch (error) {
      console.error('خطأ في تحميل الإعدادات:', error);
      // قيم افتراضية في حالة الخطأ
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
        youtubeNotifications: true,
        disabledUntil: {
          facebook: null,
          instagram: null,
          youtube: null,
          tiktok: null
        },
        restoreOnRestart: [],
        temporaryDisableAttempts: {
          facebook: [],
          instagram: [],
          youtube: [],
          tiktok: []
        }
      };
    }
  }

  // حفظ الإعدادات في التخزين
  async saveSettings() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        await chrome.storage.sync.set(this.settings);
        this.updateContentScripts();
      } else {
        // Fallback to localStorage for testing
        localStorage.setItem('extension-settings', JSON.stringify(this.settings));
      }
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
    }
  }

  // ربط الأحداث
  bindEvents() {
    // أحداث التبديل
    this.platforms.forEach(platform => {
      const toggle = document.getElementById(`${platform}-toggle`);
      if (toggle) {
        toggle.addEventListener('change', (e) => this.handleToggleChange(platform, e.target.checked));
      }
      
      // أحداث التبديل المتقدمة
      if (this.advancedSettings[platform]) {
        this.advancedSettings[platform].forEach(setting => {
          const advancedToggle = document.getElementById(`${platform}-${setting}-toggle`);
          if (advancedToggle) {
            advancedToggle.addEventListener('change', (e) => {
              this.handleAdvancedToggleChange(platform, setting, e.target.checked);
            });
          }
        });
      }
      
      // أحداث طي/فتح الخيارات المتقدمة
      const advancedToggleIcon = document.getElementById(`${platform}-advanced-toggle`);
      const advancedOptions = document.getElementById(`${platform}-advanced-options`);
      
      if (advancedToggleIcon && advancedOptions) {
        // التأكد من إضافة مستمع الحدث
        advancedToggleIcon.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleAdvancedOptions(platform);
        });
      }
    });

    // أحداث Modal
    const modal = document.getElementById('confirmation-modal');
    const temporaryModal = document.getElementById('temporary-modal');
    const permanentModal = document.getElementById('permanent-modal');
    const finalModal = document.getElementById('final-confirmation-modal');

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
          this.closeModal('confirmation-modal');
        }
      });
    }

    if (temporaryModal) {
      temporaryModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
          this.closeModal('temporary-modal');
        }
      });
    }

    if (permanentModal) {
      permanentModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
          this.closeModal('permanent-modal');
        }
      });
    }

    if (finalModal) {
      finalModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
          this.closeModal('final-confirmation-modal');
        }
      });
    }

    // أزرار Modal
    const modalButtons = document.querySelectorAll('#confirmation-modal .btn');
    modalButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleModalAction(e.target.dataset.action));
    });

    // أحداث Modal الدائم
    const confirmationText = document.getElementById('confirmation-text');
    const temporaryConfirmationText = document.getElementById('temporary-confirmation-text');
    const confirmPermanent = document.getElementById('confirm-permanent');
    const cancelPermanent = document.getElementById('cancel-permanent');
    const confirmTemporary = document.getElementById('confirm-temporary');
    const cancelTemporary = document.getElementById('cancel-temporary');
    const restoreOnRestartCheckbox = document.getElementById('restore-on-restart');
    const confirmFinal = document.getElementById('confirm-final');
    const cancelFinal = document.getElementById('cancel-final');

    if (confirmationText) {
      confirmationText.addEventListener('input', (e) => this.validateConfirmationText(e.target.value));
      
      // منع اللصق والنسخ والقص
      confirmationText.addEventListener('paste', (e) => {
        e.preventDefault();
        return false;
      });
      
      confirmationText.addEventListener('copy', (e) => {
        e.preventDefault();
        return false;
      });
      
      confirmationText.addEventListener('cut', (e) => {
        e.preventDefault();
        return false;
      });
      
      confirmationText.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
      });
      
      confirmationText.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
      });
      
      confirmationText.addEventListener('selectstart', (e) => {
        e.preventDefault();
        return false;
      });
      
      // منع اختصارات لوحة المفاتيح
      confirmationText.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')) {
          e.preventDefault();
          return false;
        }
      });
    }

    if (temporaryConfirmationText) {
      temporaryConfirmationText.addEventListener('input', (e) => this.validateTemporaryConfirmationText(e.target.value));
      
      // منع اللصق والنسخ والقص
      temporaryConfirmationText.addEventListener('paste', (e) => {
        e.preventDefault();
        return false;
      });
      
      temporaryConfirmationText.addEventListener('copy', (e) => {
        e.preventDefault();
        return false;
      });
      
      temporaryConfirmationText.addEventListener('cut', (e) => {
        e.preventDefault();
        return false;
      });
      
      temporaryConfirmationText.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
      });
      
      temporaryConfirmationText.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
      });
      
      temporaryConfirmationText.addEventListener('selectstart', (e) => {
        e.preventDefault();
        return false;
      });
      
      // منع اختصارات لوحة المفاتيح
      temporaryConfirmationText.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')) {
          e.preventDefault();
          return false;
        }
      });
    }

    if (confirmTemporary) {
      confirmTemporary.addEventListener('click', () => this.handleTemporaryConfirmation());
    }

    if (cancelTemporary) {
      cancelTemporary.addEventListener('click', () => this.closeModal('temporary-modal'));
    }

    if (confirmPermanent) {
      confirmPermanent.addEventListener('click', () => this.openFinalConfirmation());
    }

    if (cancelPermanent) {
      cancelPermanent.addEventListener('click', () => this.closeModal('permanent-modal'));
    }

    if (restoreOnRestartCheckbox) {
      restoreOnRestartCheckbox.addEventListener('change', (e) => {
        this.restoreOnRestart = e.target.checked;
      });
    }

    if (confirmFinal) {
      confirmFinal.addEventListener('click', () => this.handleFinalPermanentDisable());
    }

    if (cancelFinal) {
      cancelFinal.addEventListener('click', () => this.closeModal('final-confirmation-modal'));
    }

    // أحداث أزرار Footer
    const contactUs = document.getElementById('contact-us');
    const supportUs = document.getElementById('support-us');

    if (contactUs) {
      contactUs.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
          chrome.tabs.create({ url: 'https://wa.me/213698409826' });
        } else {
          window.open('https://wa.me/213698409826', '_blank');
        }
      });
    }

    if (supportUs) {
      supportUs.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
          chrome.tabs.create({ url: 'https://pexlat.com' });
        } else {
          window.open('https://pexlat.com', '_blank');
        }
      });
    }

    // حدث زر إعادة التحميل
    const reloadButton = document.getElementById('reload-button');
    if (reloadButton) {
      reloadButton.addEventListener('click', () => this.reloadCurrentTab());
    }

    // أحداث اختيار اللغة
    this.bindLanguageEvents();
  }

  // ربط أحداث اللغة
  bindLanguageEvents() {
    const languageToggle = document.getElementById('language-toggle');
    const languageDropdown = document.getElementById('language-dropdown');
    const languageOptions = document.querySelectorAll('.language-option');
    const languageText = document.getElementById('language-text');

    // تحديث نص اللغة
    if (languageText) {
      languageText.textContent = this.languageManager.getText('footer.language');
    }

    // فتح/إغلاق القائمة المنسدلة
    if (languageToggle) {
      languageToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        languageDropdown.classList.toggle('show');
      });
    }

    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', (e) => {
      if (!languageToggle.contains(e.target)) {
        languageDropdown.classList.remove('show');
      }
    });

    // اختيار لغة
    languageOptions.forEach(option => {
      const lang = option.dataset.lang;
      
      // تحديد اللغة النشطة
      if (lang === this.languageManager.currentLanguage) {
        option.classList.add('active');
      }
      
      option.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.changeLanguage(lang);
        languageDropdown.classList.remove('show');
      });
    });
  }

  // تغيير اللغة
  async changeLanguage(language) {
    try {
      await this.languageManager.changeLanguage(language);
      
      // تحديث العناصر النشطة
      document.querySelectorAll('.language-option').forEach(opt => {
        opt.classList.remove('active');
        if (opt.dataset.lang === language) {
          opt.classList.add('active');
        }
      });
      
      // تحديث النص المطلوب للتأكيد
      this.updateRequiredText();
      
    } catch (error) {
      console.error('خطأ في تغيير اللغة:', error);
    }
  }

  // تحديث النص المطلوب للتأكيد
  updateRequiredText() {
    const requiredText = this.languageManager.getText('modal.requiredText');
    const requiredTextTemp = this.languageManager.getText('modal.requiredTextTemp');
    
    // تنظيف النص الحالي في textarea
    const confirmationTextarea = document.getElementById('confirmation-text');
    if (confirmationTextarea) {
      confirmationTextarea.value = '';
      this.validateConfirmationText('');
    }
    
    const temporaryTextarea = document.getElementById('temporary-confirmation-text');
    if (temporaryTextarea) {
      temporaryTextarea.value = '';
      this.validateTemporaryConfirmationText('');
    }
  }

  // إعادة تحميل التبويب النشط
  async reloadCurrentTab() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]) {
        await chrome.tabs.reload(tabs[0].id);
        // إخفاء التنبيه بعد النقر
        const notification = document.getElementById('reload-notification');
        if (notification) {
          notification.classList.remove('show');
        }
      }
    } catch (error) {
      console.error('خطأ في إعادة تحميل الصفحة:', error);
    }
  }

  // معالجة تغيير التبديل
  async handleToggleChange(platform, isEnabled) {
    try {
      if (!isEnabled) {
        // فتح modal التأكيد عند التعطيل
        this.currentPlatform = platform;
        this.openModal('confirmation-modal');
        // إعادة التبديل إلى الحالة السابقة مؤقتاً
        document.getElementById(`${platform}-toggle`).checked = true;
        return;
      }

      // تفعيل مباشر
      this.settings[platform] = true;
      this.settings.disabledUntil[platform] = null; // إزالة المؤقت عند التفعيل
      await this.saveSettings();
      
      // تحديث الواجهة فوراً
      this.updateUI();
      
      this.showNotification(`${this.getPlatformName(platform)} تم تفعيله`);
      this.showReloadNotification();
    } catch (error) {
      console.error('خطأ في معالجة التغيير:', error);
    }
  }

  // طي/فتح الخيارات المتقدمة
  toggleAdvancedOptions(platform) {
    const advancedToggleIcon = document.getElementById(`${platform}-advanced-toggle`);
    const advancedOptions = document.getElementById(`${platform}-advanced-options`);
    
    if (advancedToggleIcon && advancedOptions) {
      advancedToggleIcon.classList.toggle('collapsed');
      advancedOptions.classList.toggle('collapsed');
      
      // تحديث أيقونة السهم
      const icon = advancedToggleIcon.querySelector('.icon');
      if (icon) {
        if (advancedOptions.classList.contains('collapsed')) {
          icon.style.transform = 'rotate(-90deg)';
        } else {
          icon.style.transform = 'rotate(0deg)';
        }
      }
    }
  }

  // معالجة تغيير التبديل المتقدم
  async handleAdvancedToggleChange(platform, setting, isEnabled) {
    try {
      // تحديث الإعدادات
      const settingKey = `${platform}${setting.charAt(0).toUpperCase() + setting.slice(1)}`;
      this.settings[settingKey] = isEnabled;
      await this.saveSettings();
      
      // تحديث content scripts
      this.updateContentScripts();
      
      this.showReloadNotification();
    } catch (error) {
      console.error('خطأ في معالجة تغيير الإعداد المتقدم:', error);
    }
  }

  // معالجة إجراءات Modal
  async handleModalAction(action) {
    try {
      this.closeModal('confirmation-modal');

      const platform = this.currentPlatform;
      const now = Date.now();

      switch (action) {
        case '10min':
          // التحقق من عدد مرات التعطيل المؤقت فيآخر 24 ساعة
          if (this.getAttemptsInLast24Hours(platform) >= 3) {
            // فتح modal التأكيد المؤقت
            this.pendingAction = { type: 'temporary', duration: 10 };
            this.openModal('temporary-modal');
            return;
          }
          
          await this.performTemporaryDisable(platform, 10);
          break;

        case '30min':
          // التحقق من عدد مرات التعطيل المؤقت فيآخر 24 ساعة
          if (this.getAttemptsInLast24Hours(platform) >= 3) {
            // فتح modal التأكيد المؤقت
            this.pendingAction = { type: 'temporary', duration: 30 };
            this.openModal('temporary-modal');
            return;
          }
          
          await this.performTemporaryDisable(platform, 30);
          break;

        case 'permanent':
          this.openModal('permanent-modal');
          return; // لا نغلق الmodal الرئيسي
      }

      // إرسال رسالة إلى background لتحديث المؤقت
      chrome.runtime.sendMessage({
        action: 'setTimer',
        platform: platform,
        disabledUntil: this.settings.disabledUntil[platform]
      });
    } catch (error) {
      console.error('خطأ في معالجة إجراء Modal:', error);
    }
  }

  // تنفيذ التعطيل المؤقت
  async performTemporaryDisable(platform, minutes) {
    try {
      const now = Date.now();
      this.settings.disabledUntil[platform] = now + (minutes * 60 * 1000);
      this.settings[platform] = false;
      
      // إضافة محاولة جديدة إلى قائمة المحاولات
      this.addTemporaryDisableAttempt(platform);
      
      await this.saveSettings();
      
      // تحديث الواجهة فوراً
      this.updateUI();
      
      this.showNotification(`تم تعطيل ${this.getPlatformName(platform)} لمدة ${minutes} دقيقة`);
      this.showReloadNotification();
      
    } catch (error) {
      console.error('خطأ في تعطيل المنصة مؤقتاً:', error);
    }
  }

  // معالجة التأكيد المؤقت
  async handleTemporaryConfirmation() {
    try {
      const platform = this.currentPlatform;
      const { duration } = this.pendingAction;
      
      await this.performTemporaryDisable(platform, duration);
      
      this.closeModal('temporary-modal');
      
      // مسح النص المكتوب
      const temporaryTextarea = document.getElementById('temporary-confirmation-text');
      if (temporaryTextarea) {
        temporaryTextarea.value = '';
        this.validateTemporaryConfirmationText('');
      }
      
    } catch (error) {
      console.error('خطأ في معالجة التأكيد المؤقت:', error);
    }
  }

  // التحقق من نص التأكيد المؤقت
  validateTemporaryConfirmationText(text) {
    const confirmBtn = document.getElementById('confirm-temporary');
    const requiredText = this.languageManager.getText('modal.requiredTextTemp');
    const isValid = text.trim() === requiredText;

    confirmBtn.disabled = !isValid;
    confirmBtn.style.opacity = isValid ? '1' : '0.5';
  }

  // تنظيف المحاولات القديمة (أكثر من 24 ساعة)
  cleanupOldAttempts(platform) {
    if (!this.settings.temporaryDisableAttempts[platform]) {
      this.settings.temporaryDisableAttempts[platform] = [];
    }
    
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    
    this.settings.temporaryDisableAttempts[platform] = 
      this.settings.temporaryDisableAttempts[platform].filter(timestamp => timestamp > twentyFourHoursAgo);
  }

  // التحقق من عدد المحاولات في آخر 24 ساعة
  getAttemptsInLast24Hours(platform) {
    this.cleanupOldAttempts(platform);
    return this.settings.temporaryDisableAttempts[platform].length;
  }

  // إضافة محاولة جديدة
  addTemporaryDisableAttempt(platform) {
    if (!this.settings.temporaryDisableAttempts[platform]) {
      this.settings.temporaryDisableAttempts[platform] = [];
    }
    
    this.cleanupOldAttempts(platform);
    this.settings.temporaryDisableAttempts[platform].push(Date.now());
    
    console.log(`Platform ${platform} attempt added. Total in last 24h: ${this.getAttemptsInLast24Hours(platform)}`);
  }

  // تنظيف جميع المحاولات القديمة لجميع المنصات
  cleanupAllOldAttempts() {
    this.platforms.forEach(platform => {
      this.cleanupOldAttempts(platform);
    });
    
    // حفظ الإعدادات بعد التنظيف
    this.saveSettings();
  }

  // فتح نافذة التأكيد النهائي
  openFinalConfirmation() {
    this.closeModal('permanent-modal');
    this.openModal('final-confirmation-modal');
    
    // إعادة تعيين قيمة checkbox
    const restoreCheckbox = document.getElementById('restore-on-restart');
    if (restoreCheckbox) {
      restoreCheckbox.checked = true;
      this.restoreOnRestart = true;
    }
  }

  // معالجة التعطيل الدائم النهائي
  async handleFinalPermanentDisable() {
    try {
      const platform = this.currentPlatform;
      
      // تعطيل المنصة
      this.settings[platform] = false;
      this.settings.disabledUntil[platform] = null; // إزالة المؤقت
      
      // حفظ إعداد إعادة الحظر عند إعادة التشغيل
      if (this.restoreOnRestart) {
        // حفظ المنصة في قائمة إعادة الحظر
        await this.addToRestoreList(platform);
      } else {
        // إزالة المنصة من قائمة إعادة الحظر
        await this.removeFromRestoreList(platform);
      }
      
      await this.saveSettings();
      
      // تحديث الواجهة فوراً
      this.updateUI();
      
      this.closeModal('final-confirmation-modal');
      
      const message = this.restoreOnRestart ? 
        `تم تعطيل ${this.getPlatformName(platform)} مع إعادة الحظر عند إعادة تشغيل المتصفح` :
        `تم تعطيل ${this.getPlatformName(platform)} بشكل دائم`;
      
      this.showNotification(message);
      this.showReloadNotification();
      
      // مسح النص المكتوب
      const confirmationTextarea = document.getElementById('confirmation-text');
      if (confirmationTextarea) {
        confirmationTextarea.value = '';
        this.validateConfirmationText('');
      }
      
    } catch (error) {
      console.error('خطأ في التعطيل الدائم:', error);
    }
  }

  // إضافة منصة إلى قائمة إعادة الحظر
  async addToRestoreList(platform) {
    try {
      const result = await chrome.storage.sync.get({ restoreOnRestart: [] });
      const restoreList = result.restoreOnRestart || [];
      
      if (!restoreList.includes(platform)) {
        restoreList.push(platform);
        await chrome.storage.sync.set({ restoreOnRestart: restoreList });
        console.log(`Added ${platform} to restore list:`, restoreList);
      } else {
        console.log(`${platform} already in restore list`);
      }
    } catch (error) {
      console.error('خطأ في إضافة إلى قائمة إعادة الحظر:', error);
    }
  }

  // إزالة منصة من قائمة إعادة الحظر
  async removeFromRestoreList(platform) {
    try {
      const result = await chrome.storage.sync.get({ restoreOnRestart: [] });
      const restoreList = result.restoreOnRestart || [];
      
      const index = restoreList.indexOf(platform);
      if (index > -1) {
        restoreList.splice(index, 1);
        await chrome.storage.sync.set({ restoreOnRestart: restoreList });
        console.log(`Removed ${platform} from restore list:`, restoreList);
      } else {
        console.log(`${platform} not found in restore list`);
      }
    } catch (error) {
      console.error('خطأ في إزالة من قائمة إعادة الحظر:', error);
    }
  }

  // التحقق من نص التأكيد
  validateConfirmationText(text) {
    const confirmBtn = document.getElementById('confirm-permanent');
    const requiredText = this.languageManager.getText('modal.requiredText');
    const isValid = text.trim() === requiredText;

    confirmBtn.disabled = !isValid;
    confirmBtn.style.opacity = isValid ? '1' : '0.5';
  }

  // فتح Modal
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
    }
  }

  // إغلاق Modal
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
    }
  }

  // تحديث الواجهة
  updateUI() {
    this.platforms.forEach(platform => {
      const toggle = document.getElementById(`${platform}-toggle`);
      const platformElement = document.querySelector(`[data-platform="${platform}"]`);
      const platformTimer = document.getElementById(`${platform}-timer`);
      
      if (toggle) {
        toggle.checked = this.settings[platform];
      }
      
      // تحديث حالة الإعدادات المتقدمة
      if (this.advancedSettings[platform]) {
        this.advancedSettings[platform].forEach(setting => {
          const advancedToggle = document.getElementById(`${platform}-${setting}-toggle`);
          if (advancedToggle) {
            const settingKey = `${platform}${setting.charAt(0).toUpperCase() + setting.slice(1)}`;
            advancedToggle.checked = this.settings[settingKey] !== undefined ? this.settings[settingKey] : true;
            
            // تحديث النصوص للإعدادات المتقدمة
            const textElement = advancedToggle.nextElementSibling;
            if (textElement && textElement.classList.contains('checkbox-text')) {
              const translationKey = `advancedSettings.${platform}.${setting}`;
              const translatedText = this.languageManager.getText(translationKey);
              if (translatedText !== translationKey) { // التحقق من أن الترجمة موجودة
                textElement.textContent = translatedText;
              }
            }
          }
        });
      }
      
      // تحديث حالة طي/فتح الخيارات المتقدمة (مطوي افتراضياً)
      const advancedOptions = document.getElementById(`${platform}-advanced-options`);
      const advancedToggleIcon = document.getElementById(`${platform}-advanced-toggle`);
      
      if (advancedOptions && advancedToggleIcon) {
        // التأكد من أن الخيارات المتقدمة مطوية افتراضياً
        if (!advancedOptions.classList.contains('collapsed')) {
          advancedOptions.classList.add('collapsed');
        }
        if (!advancedToggleIcon.classList.contains('collapsed')) {
          advancedToggleIcon.classList.add('collapsed');
        }
        
        // تحديث أيقونة السهم
        const icon = advancedToggleIcon.querySelector('.icon');
        if (icon) {
          icon.style.transform = 'rotate(-90deg)';
        }
      }
      
      // تحديث حالة المنصة - إزالة التعطيل للأزرار لتمكين إعادة التفعيل
      if (platformElement) {
        if (this.isTemporarilyDisabled(platform)) {
          platformElement.classList.add('disabled');
          // إزالة تعطيل الزر ليتمكن المستخدم من إعادة التفعيل
          if (toggle) toggle.disabled = false;
        } else {
          platformElement.classList.remove('disabled');
          if (toggle) toggle.disabled = false;
        }
      }
      
      // إخفاء/إظهار المؤقت للمنصة
      if (platformTimer) {
        if (this.isTemporarilyDisabled(platform)) {
          platformTimer.style.display = 'flex';
        } else {
          platformTimer.style.display = 'none';
        }
      }
    });
    
    this.updateTimerDisplay();
    
    // تحديث الجملة التحفيزية
    this.updateMotivationalQuote();
  }

  // تحديث الجملة التحفيزية
  updateMotivationalQuote() {
    const subtitleElement = document.querySelector('.subtitle');
    if (subtitleElement) {
      subtitleElement.textContent = this.languageManager.getRandomMotivationalQuote();
    }
  }

  // التحقق من حالة التعطيل
  checkDisabledState() {
    let hasActiveTimer = false;
    
    this.platforms.forEach(platform => {
      if (this.settings.disabledUntil[platform]) {
        if (Date.now() < this.settings.disabledUntil[platform]) {
          // لا يزال معطلاً
          hasActiveTimer = true;
        } else {
          // انتهى المؤقت، إعادة التفعيل
          this.settings.disabledUntil[platform] = null;
          this.settings[platform] = true;
        }
      }
    });
    
    if (hasActiveTimer) {
      this.startTimerDisplay();
    } else {
      this.stopTimerDisplay();
      this.saveSettings();
    }
  }

  // تحقق من التعطيل المؤقت لمنصة معينة
  isTemporarilyDisabled(platform) {
    return this.settings.disabledUntil[platform] && Date.now() < this.settings.disabledUntil[platform];
  }

  // التحقق من وجود أي منصة معطلة مؤقتاً
  hasAnyTemporaryDisable() {
    return this.platforms.some(platform => this.isTemporarilyDisabled(platform));
  }

  // بدء عرض المؤقت
  startTimerDisplay() {
    this.updateTimerDisplay();
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = setInterval(() => {
      if (this.hasAnyTemporaryDisable()) {
        this.updateTimerDisplay();
      } else {
        this.stopTimerDisplay();
        // تحديث الإعدادات عند انتهاء المؤقت
        this.platforms.forEach(platform => {
          if (this.settings.disabledUntil[platform] && this.settings.disabledUntil[platform] <= Date.now()) {
            this.settings.disabledUntil[platform] = null;
            this.settings[platform] = true;
          }
        });
        this.saveSettings();
        this.updateUI();
      }
    }, 1000);
  }

  // إيقاف عرض المؤقت
  stopTimerDisplay() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    // إخفاء مؤقت الرأس العام
    const timerStatus = document.getElementById('timer-status');
    if (timerStatus) {
      timerStatus.style.display = 'none';
    }
    
    // إخفاء جميع المؤقتات الفردية
    this.platforms.forEach(platform => {
      const platformTimer = document.getElementById(`${platform}-timer`);
      if (platformTimer) {
        platformTimer.style.display = 'none';
      }
    });
  }

  // تحديث عرض المؤقت
  updateTimerDisplay() {
    // إخفاء مؤقت الرأس العام
    const timerStatus = document.getElementById('timer-status');
    if (timerStatus) {
      timerStatus.style.display = 'none';
    }
    
    // تحديث المؤقتات الفردية لكل منصة
    this.platforms.forEach(platform => {
      const platformTimer = document.getElementById(`${platform}-timer`);
      const platformCountdown = document.getElementById(`${platform}-countdown`);
      
      if (this.isTemporarilyDisabled(platform)) {
        if (platformTimer) {
          platformTimer.style.display = 'flex';
        }
        
        if (platformCountdown) {
          const remaining = this.settings.disabledUntil[platform] - Date.now();
          const minutes = Math.floor(remaining / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
          platformCountdown.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
      } else {
        if (platformTimer) {
          platformTimer.style.display = 'none';
        }
      }
    });
  }

  // إظهار تنبيه إعادة التحميل
  showReloadNotification() {
    const notification = document.getElementById('reload-notification');
    if (notification) {
      notification.classList.add('show');
      
      // إخفاء التنبيه بعد 5 ثوانٍ
      setTimeout(() => {
        notification.classList.remove('show');
      }, 5000);
    }
  }

  // تحديث content scripts
  async updateContentScripts() {
    try {
      const tabs = await chrome.tabs.query({ url: ['*://*.facebook.com/*', '*://*.instagram.com/*', '*://*.youtube.com/*', '*://*.tiktok.com/*'] });
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: 'updateSettings', settings: this.settings });
      });
    } catch (error) {
      console.error('خطأ في تحديث content scripts:', error);
    }
  }

  // عرض إشعار
  showNotification(message) {
    // يمكن استخدام chrome.notifications أو إضافة toast في الواجهة
    console.log('إشعار:', message);
  }

  // الحصول على اسم المنصة باللغة الحالية
  getPlatformName(platform) {
    return this.languageManager.getText(`platforms.${platform}`) || platform;
  }
}

// تهيئة الإضافة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  new ShortContentBlocker();
});