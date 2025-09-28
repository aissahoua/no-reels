// languages.js - نظام إدارة اللغات والترجمات

class LanguageManager {
  constructor() {
    this.currentLanguage = 'ar';
    this.translations = {
      ar: {
        // الترجمة العربية
        extensionName: "no reels - حظر المقاطع القصيرة",
        motivationalQuotes: [
          "صحتك النفسية أغلى من لحظة متعة زائفة.",
          "المقاطع القصيرة مصممة لإدمانك… لا تقع في الفخ.",
          "كل تمريرة للأسفل = المزيد من الوقت المهدور.",
          "عقلك يحتاج غذاءً نقيًا… وليس مقاطعًا عابرة.",
          "أنت تتحكم في وقتك، لا تدع المقاطع القصيرة تفعل ذلك بدلاً منك.",
          "الإنتاجية تبدأ بحماية انتباهك من المشتتات.",
          "وقتك أثمن من أن تضيعه في محتوى لا يفيدك.",
          "التركيز قوة خارقة في عصر التشتت.",
          "كل دقيقة توفرها اليوم، استثمار في مستقبلك.",
          "اختر المحتوى الذي يبني عقلك، لا الذي يشتته."
        ],
        title: "no reels - حظر المقاطع القصيرة",
        platforms: {
          facebook: "فيسبوك",
          instagram: "إنستغرام",
          youtube: "يوتيوب",
          tiktok: "تيك توك"
        },
        platformDescs: {
          facebook: "حظر Reels",
          instagram: "حظر Reels", 
          youtube: "حظر Shorts",
          tiktok: "حظر كامل"
        },
        advancedSettings: {
          toggleText: "الخيارات المتقدمة",
          facebook: {
            stories: "حظر القصص",
            watch: "حظر مقاطع Watch",
            suggestions: "إخفاء \"أصدقاء قد تعرفهم\""
          },
          instagram: {
            stories: "حظر القصص",
            suggestions: "إخفاء المتابعات المقترحة"
          },
          youtube: {
            comments: "إخفاء التعليقات",
            suggestions: "إخفاء المقاطع المقترحة",
            notifications: "إخفاء الإشعارات"
          }
        },
        timer: {
          status: "الحظر معطل مؤقتاً",
          platformDisabled: "معطل مؤقتاً",
          disabled10min: "تم تعطيل {platform} لمدة 10 دقائق",
          disabled30min: "تم تعطيل {platform} لمدة 30 دقيقة",
          enabledPermanent: "تم تعطيل {platform} بشكل دائم",
          reactivated: "تم تفعيل {platform}"
        },
        modal: {
          confirmDisable: "تأكيد التعطيل",
          disableQuestion: "هل تريد تعطيل الحظر مؤقتاً أم دائماً؟",
          btn10min: "10 دقائق",
          btn30min: "30 دقيقة",
          btnPermanent: "توقيف دائم",
          confirmPermanent: "تأكيد التوقيف الدائم",
          writeText: "اكتب النص التالي للتأكيد:",
          requiredText: "المقاطع القصيرة تؤثر سلبا على إنتاجيتي",
          requiredTextTemp: "أعلم أن التعطيل المؤقت يقلل من تركيزي",
          placeholder: "اكتب النص هنا...",
          cancel: "إلغاء",
          confirm: "تأكيد",
          finalConfirmTitle: "تأكيد نهائي",
          finalConfirmQuestion: "هل تريد حقاً إيقاف الحظر تمامًا؟",
          restoreOnRestart: "إعادة الحظر عند إعادة تشغيل المتصفح",
          approve: "موافق",
          temporaryDisableConfirm: "تأكيد التعطيل المؤقت",
          temporaryWarning: "لقد قمت بتعطيل الحظر مؤقتاً 3 مرات في آخر 24 ساعة. للمتابعة، اكتب النص التالي:"
        },
        footer: {
          contact: "تواصل معنا",
          support: "ادعمنا",
          language: "اللغة"
        },
        reload: {
          title: "تم حفظ التغييرات",
          description: "يرجى إعادة تحميل الصفحة لتفعيل التغييرات",
          button: "إعادة تحميل الصفحة"
        },
        notification: {
          timerEnded: "انتهى وقت الراحة",
          reactivated: "تم إعادة تفعيل حظر المحتوى القصير في {platform}"
        }
      },
      en: {
        // الترجمة الإنجليزية
        extensionName: "no reels - Block Short Videos",
        motivationalQuotes: [
          "Your mental health is worth more than a moment of fake pleasure.",
          "Short videos are designed to addict you… don't fall into the trap.",
          "Every scroll down = more wasted time.",
          "Your mind needs pure nutrition… not fleeting clips.",
          "You control your time, don't let short videos do it for you.",
          "Productivity starts with protecting your attention from distractions.",
          "Your time is too precious to waste on content that doesn't benefit you.",
          "Focus is a superpower in the age of distraction.",
          "Every minute you save today is an investment in your future.",
          "Choose content that builds your mind, not what distracts it."
        ],
        title: "no reels - Block Short Videos",
        platforms: {
          facebook: "Facebook",
          instagram: "Instagram",
          youtube: "YouTube",
          tiktok: "TikTok"
        },
        platformDescs: {
          facebook: "Block Reels",
          instagram: "Block Reels",
          youtube: "Block Shorts", 
          tiktok: "Complete Block"
        },
        advancedSettings: {
          toggleText: "Advanced Options",
          facebook: {
            stories: "Block Stories",
            watch: "Block Watch Videos",
            suggestions: "Hide \"People You May Know\""
          },
          instagram: {
            stories: "Block Stories",
            suggestions: "Hide Suggested Follows"
          },
          youtube: {
            comments: "Hide Comments",
            suggestions: "Hide Suggested Videos",
            notifications: "Hide Notifications"
          }
        },
        timer: {
          status: "Blocking temporarily disabled",
          platformDisabled: "Temporarily disabled",
          disabled10min: "{platform} disabled for 10 minutes",
          disabled30min: "{platform} disabled for 30 minutes",
          enabledPermanent: "{platform} permanently disabled",
          reactivated: "{platform} activated"
        },
        modal: {
          confirmDisable: "Confirm Disable",
          disableQuestion: "Do you want to disable blocking temporarily or permanently?",
          btn10min: "10 minutes",
          btn30min: "30 minutes",
          btnPermanent: "Permanent stop",
          confirmPermanent: "Confirm Permanent Stop",
          writeText: "Write the following text to confirm:",
          requiredText: "I pledge not to use short videos because they negatively affect my focus and productivity",
          requiredTextTemp: "I understand that temporary disabling reduces my focus",
          placeholder: "Write the text here...",
          cancel: "Cancel",
          confirm: "Confirm",
          finalConfirmTitle: "Final Confirmation",
          finalConfirmQuestion: "Do you really want to stop blocking completely?",
          restoreOnRestart: "Restore blocking when browser restarts",
          approve: "Approve",
          temporaryDisableConfirm: "Confirm Temporary Disable",
          temporaryWarning: "You have temporarily disabled blocking 3 times in the last 24 hours. To continue, write the following text:"
        },
        footer: {
          contact: "Contact Us",
          support: "Support Us",
          language: "Language"
        },
        reload: {
          title: "Changes Saved",
          description: "Please reload the page to activate changes",
          button: "Reload Page"
        },
        notification: {
          timerEnded: "Break time ended",
          reactivated: "Short content blocking reactivated on {platform}"
        }
      },
      fr: {
        // الترجمة الفرنسية
        extensionName: "no reels - Bloquer les Vidéos Courtes",
        motivationalQuotes: [
          "Votre santé mentale vaut plus qu'un moment de plaisir fictif.",
          "Les vidéos courtes sont conçues pour vous rendre accro… ne tombez pas dans le piège.",
          "Chaque défilement vers le bas = plus de temps perdu.",
          "Votre esprit a besoin d'une nutrition pure… pas de clips éphémères.",
          "Vous contrôlez votre temps, ne laissez pas les vidéos courtes le faire à votre place.",
          "La productivité commence par protéger votre attention des distractions.",
          "Votre temps est trop précieux pour être gaspillé sur du contenu qui ne vous profite pas.",
          "La concentration est un super-pouvoir à l'ère de la distraction.",
          "Chaque minute que vous économisez aujourd'hui est un investissement dans votre avenir.",
          "Choisissez du contenu qui construit votre esprit, pas ce qui le distrait."
        ],
        title: "no reels - Bloquer les Vidéos Courtes",
        platforms: {
          facebook: "Facebook",
          instagram: "Instagram",
          youtube: "YouTube",
          tiktok: "TikTok"
        },
        platformDescs: {
          facebook: "Bloquer Reels",
          instagram: "Bloquer Reels",
          youtube: "Bloquer Shorts",
          tiktok: "Blocage Complet"
        },
        advancedSettings: {
          toggleText: "Options Avancées",
          facebook: {
            stories: "Bloquer les Stories",
            watch: "Bloquer les vidéos Watch",
            suggestions: "Masquer \"Personnes que vous connaissez\""
          },
          instagram: {
            stories: "Bloquer les Stories",
            suggestions: "Masquer les comptes suggérés"
          },
          youtube: {
            comments: "Masquer les commentaires",
            suggestions: "Masquer les vidéos suggérées",
            notifications: "Masquer les notifications"
          }
        },
        timer: {
          status: "Blocage temporairement désactivé",
          platformDisabled: "Désactivé temporairement",
          disabled10min: "{platform} désactivé pendant 10 minutes",
          disabled30min: "{platform} désactivé pendant 30 minutes", 
          enabledPermanent: "{platform} désactivé définitivement",
          reactivated: "{platform} activé"
        },
        modal: {
          confirmDisable: "Confirmer la Désactivation",
          disableQuestion: "Voulez-vous désactiver le blocage temporairement ou définitivement ?",
          btn10min: "10 minutes",
          btn30min: "30 minutes",
          btnPermanent: "Arrêt permanent",
          confirmPermanent: "Confirmer l'Arrêt Permanent",
          writeText: "Écrivez le texte suivant pour confirmer :",
          requiredText: "Je m'engage à ne pas utiliser de vidéos courtes car elles affectent négativement ma concentration et ma productivité",
          requiredTextTemp: "Je comprends que la désactivation temporaire réduit ma concentration",
          placeholder: "Écrivez le texte ici...",
          cancel: "Annuler",
          confirm: "Confirmer",
          finalConfirmTitle: "Confirmation Finale",
          finalConfirmQuestion: "Voulez-vous vraiment arrêter le blocage complètement ?",
          restoreOnRestart: "Restaurer le blocage au redémarrage du navigateur",
          approve: "Approuver",
          temporaryDisableConfirm: "Confirmer la Désactivation Temporaire",
          temporaryWarning: "Vous avez désactivé le blocage temporairement 3 fois au cours des dernières 24 heures. Pour continuer, écrivez le texte suivant :"
        },
        footer: {
          contact: "Nous Contacter",
          support: "Nous Soutenir",
          language: "Langue"
        },
        reload: {
          title: "Changements Sauvegardés",
          description: "Veuillez recharger la page pour activer les changements",
          button: "Recharger la Page"
        },
        notification: {
          timerEnded: "Temps de pause terminé",
          reactivated: "Blocage de contenu court réactivé sur {platform}"
        }
      }
    };
  }

  // تحديد اللغة التلقائية بناءً على لغة المتصفح
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    
    if (browserLang.startsWith('ar')) {
      return 'ar';
    } else if (browserLang.startsWith('fr')) {
      return 'fr'; 
    } else {
      return 'en'; // الافتراضية للإنجليزية
    }
  }

  // تهيئة اللغة
  async init() {
    try {
      let savedLanguage = null;
      
      // محاولة تحميل اللغة المحفوظة
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        const result = await chrome.storage.sync.get({ language: null });
        savedLanguage = result.language;
      } else {
        // Fallback to localStorage for testing
        savedLanguage = localStorage.getItem('extension-language');
      }
      
      if (savedLanguage) {
        this.currentLanguage = savedLanguage;
      } else {
        // إذا لم تكن محفوظة، استخدم لغة المتصفح
        this.currentLanguage = this.detectBrowserLanguage();
        await this.saveLanguage(this.currentLanguage);
      }
    } catch (error) {
      console.error('خطأ في تهيئة اللغة:', error);
      // Use browser language as fallback
      this.currentLanguage = this.detectBrowserLanguage();
    }
  }

  // حفظ اللغة
  async saveLanguage(language) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        await chrome.storage.sync.set({ language });
      } else {
        // Fallback to localStorage for testing
        localStorage.setItem('extension-language', language);
      }
      this.currentLanguage = language;
    } catch (error) {
      console.error('خطأ في حفظ اللغة:', error);
      // Still update current language even if save fails
      this.currentLanguage = language;
    }
  }

  // تغيير اللغة
  async changeLanguage(language) {
    if (this.translations[language]) {
      await this.saveLanguage(language);
      this.updateUI();
      return true;
    }
    return false;
  }

  // الحصول على ترجمة
  getText(key, replacements = {}) {
    const keys = key.split('.');
    let text = this.translations[this.currentLanguage];
    
    for (const k of keys) {
      if (text && text[k]) {
        text = text[k];
      } else {
        // استخدام الترجمة العربية كافتراضية
        text = this.translations.ar;
        for (const k2 of keys) {
          if (text && text[k2]) {
            text = text[k2];
          } else {
            return key; // إرجاع المفتاح إذا لم توجد الترجمة
          }
        }
        break;
      }
    }

    // استبدال المتغيرات
    if (typeof text === 'string' && Object.keys(replacements).length > 0) {
      Object.keys(replacements).forEach(key => {
        text = text.replace(`{${key}}`, replacements[key]);
      });
    }

    return text;
  }

  // الحصول على جملة تحفيزية عشوائية
  getRandomMotivationalQuote() {
    const quotes = this.getText('motivationalQuotes');
    if (Array.isArray(quotes)) {
      return quotes[Math.floor(Math.random() * quotes.length)];
    }
    return this.getText('motivationalQuotes')[0];
  }

  // تحديث اتجاه الصفحة
  updatePageDirection() {
    const isRTL = this.currentLanguage === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = this.currentLanguage;
  }

  // تحديث الواجهة
  updateUI() {
    this.updatePageDirection();
    
    // تحديث العنوان
    const titleElement = document.querySelector('.title');
    if (titleElement) {
      titleElement.textContent = this.getText('title');
    }

    // تحديث الجملة التحفيزية
    const subtitleElement = document.querySelector('.subtitle');
    if (subtitleElement) {
      subtitleElement.textContent = this.getRandomMotivationalQuote();
    }

    // تحديث المنصات
    Object.keys(this.getText('platforms')).forEach(platform => {
      const nameElement = document.querySelector(`[data-platform="${platform}"] .platform-name`);
      const descElement = document.querySelector(`[data-platform="${platform}"] .platform-desc`);
      
      if (nameElement) {
        nameElement.textContent = this.getText(`platforms.${platform}`);
      }
      
      if (descElement) {
        descElement.textContent = this.getText(`platformDescs.${platform}`);
      }
    });

    // تحديث عناصر المؤقت
    Object.keys(this.getText('platforms')).forEach(platform => {
      const timerText = document.querySelector(`#${platform}-timer .timer-text`);
      if (timerText) {
        timerText.textContent = this.getText('timer.platformDisabled');
      }
    });
    
    const timerText = document.querySelector('.timer-text');
    if (timerText) {
      timerText.textContent = this.getText('timer.status');
    }

    // تحديث Modal
    this.updateModal();

    // تحديث Footer
    this.updateFooter();

    // تحديث إشعار إعادة التحميل
    this.updateReloadNotification();
  }

  // تحديث Modal
  updateModal() {
    // Modal التأكيد
    const confirmModalTitle = document.querySelector('#confirmation-modal h2');
    const confirmModalText = document.querySelector('#confirmation-modal p');
    const btn10min = document.querySelector('[data-action="10min"]');
    const btn30min = document.querySelector('[data-action="30min"]');
    const btnPermanent = document.querySelector('[data-action="permanent"]');

    if (confirmModalTitle) confirmModalTitle.textContent = this.getText('modal.confirmDisable');
    if (confirmModalText) confirmModalText.textContent = this.getText('modal.disableQuestion');
    if (btn10min) btn10min.textContent = this.getText('modal.btn10min');
    if (btn30min) btn30min.textContent = this.getText('modal.btn30min');
    if (btnPermanent) btnPermanent.textContent = this.getText('modal.btnPermanent');

    // Modal التأكيد المؤقت
    const temporaryModalTitle = document.querySelector('#temporary-modal h2');
    const temporaryModalText = document.querySelector('#temporary-modal p:first-of-type');
    const requiredTextTempElement = document.querySelector('.required-text-temp');
    const temporaryTextarea = document.querySelector('#temporary-confirmation-text');
    const cancelTempBtn = document.querySelector('#cancel-temporary');
    const confirmTempBtn = document.querySelector('#confirm-temporary');

    if (temporaryModalTitle) temporaryModalTitle.textContent = this.getText('modal.temporaryDisableConfirm');
    if (temporaryModalText) temporaryModalText.textContent = this.getText('modal.temporaryWarning');
    if (requiredTextTempElement) requiredTextTempElement.textContent = `"${this.getText('modal.requiredTextTemp')}"`;
    if (temporaryTextarea) temporaryTextarea.placeholder = this.getText('modal.placeholder');
    if (cancelTempBtn) cancelTempBtn.textContent = this.getText('modal.cancel');
    if (confirmTempBtn) confirmTempBtn.textContent = this.getText('modal.confirm');

    // Modal الدائم
    const permanentModalTitle = document.querySelector('#permanent-modal h2');
    const permanentModalText = document.querySelector('#permanent-modal p:first-of-type');
    const requiredTextElement = document.querySelector('.required-text');
    const confirmationTextarea = document.querySelector('#confirmation-text');
    const cancelBtn = document.querySelector('#cancel-permanent');
    const confirmBtn = document.querySelector('#confirm-permanent');

    if (permanentModalTitle) permanentModalTitle.textContent = this.getText('modal.confirmPermanent');
    if (permanentModalText) permanentModalText.textContent = this.getText('modal.writeText');
    if (requiredTextElement) requiredTextElement.textContent = `"${this.getText('modal.requiredText')}"`;
    if (confirmationTextarea) confirmationTextarea.placeholder = this.getText('modal.placeholder');
    if (cancelBtn) cancelBtn.textContent = this.getText('modal.cancel');
    if (confirmBtn) confirmBtn.textContent = this.getText('modal.confirm');

    // Modal التأكيد النهائي
    const finalModalTitle = document.querySelector('#final-confirmation-modal h2');
    const finalModalText = document.querySelector('#final-confirmation-modal p');
    const checkboxText = document.querySelector('.checkbox-text');
    const cancelFinalBtn = document.querySelector('#cancel-final');
    const confirmFinalBtn = document.querySelector('#confirm-final');

    if (finalModalTitle) finalModalTitle.textContent = this.getText('modal.finalConfirmTitle');
    if (finalModalText) finalModalText.textContent = this.getText('modal.finalConfirmQuestion');
    if (checkboxText) checkboxText.textContent = this.getText('modal.restoreOnRestart');
    if (cancelFinalBtn) cancelFinalBtn.textContent = this.getText('modal.cancel');
    if (confirmFinalBtn) confirmFinalBtn.textContent = this.getText('modal.approve');
  }

  // تحديث Footer
  updateFooter() {
    const contactLink = document.querySelector('#contact-us');
    const supportLink = document.querySelector('#support-us');

    if (contactLink) contactLink.textContent = this.getText('footer.contact');
    if (supportLink) supportLink.textContent = this.getText('footer.support');
  }

  // تحديث إشعار إعادة التحميل
  updateReloadNotification() {
    const reloadTitle = document.querySelector('.reload-title');
    const reloadDesc = document.querySelector('.reload-desc');
    const reloadButton = document.querySelector('.reload-button');

    if (reloadTitle) reloadTitle.textContent = this.getText('reload.title');
    if (reloadDesc) reloadDesc.textContent = this.getText('reload.description');
    if (reloadButton) reloadButton.textContent = this.getText('reload.button');
  }

  // الحصول على اللغات المتاحة
  getAvailableLanguages() {
    return [
      { code: 'ar', name: 'العربية', nativeName: 'العربية' },
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'fr', name: 'Français', nativeName: 'Français' }
    ];
  }
}

// إنشاء مثيل وحيد
window.languageManager = new LanguageManager();