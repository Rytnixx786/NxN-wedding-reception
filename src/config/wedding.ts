export interface WeddingPhoto {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description: string;
}

export interface GiftAccount {
  label: string;
  accountName: string;
  accountNumber: string;
  bankOrProvider: string;
  qrImage?: string;
}

export interface WeddingConfig {
  couple: {
    groomShortName: string;
    brideShortName: string;
    groomFullName: string;
    brideFullName: string;
    groomRoleLabel: string;
    brideRoleLabel: string;
  };
  parents: {
    groomPrefix: string;
    groomLines: string[];
    bridePrefix: string;
    brideLines: string[];
  };
  invitationCard: {
    bismillahArabic: string;
    bismillahTranslation: string[];
    hostLines: string[];
    brideDaughterOf: string;
  };
  ceremony: {
    sectionTitle: string;
    announcementLines: string[];
  };
  reception: {
    sectionTitle: string;
    subtitle: string;
    dateIsoStart: string;
    dateIsoEnd: string;
    timezone: string;
    displayTime: string;
    displayTime12h: string;
    displayWeekday: string;
    displayDay: number;
    displayDayOrdinal: string;
    displayMonth: string;
    displayYear: number;
    calendarMonthIndex: number; // 0-indexed (0 = January)
    calendarYear: number;
    calendarHighlightDay: number;
    calendarEventTitle: string;
    calendarEventDescription: string;
  };
  venue: {
    sectionTitle: string;
    hallName: string;
    addressLines: string[];
    fullAddress: string;
    latitude: number;
    longitude: number;
    mapsShareUrl: string;
    directionsUrl: string;
    mapEmbedUrl: string;
  };
  music: {
    src: string;
    title: string;
    artistHint: string;
    defaultVolume: number;
  };
  assets: {
    palaceBackdrop: string;
    floralBouquet: string;
    waxSeal: string;
    receptionCard: string;
  };
  hero: {
    saveTheDateLabel: string;
    introKicker: string;
    introDateLine: string;
    introCardDate: string;
    introCordiallyLabel: string;
    openButtonLabel: string;
    musicHintLabel: string;
    tapCardHint: string;
  };
  footer: {
    blessingMessage: string;
    monogramLine: string;
  };
  rsvp: {
    buttonLabel: string;
    modalTitle: string;
    modalDescription: string;
    contactPhone: string;
    allowGuestCount: boolean;
    allowDietaryOrMessage: boolean;
    guestSides: string[];
  };
  /**
   * Optional ChungDoi Minimalism Dark Red template modules.
   * Disabled by default to preserve 1:1 visual fidelity with the recorded video.
   * Flip any flag to `true` and supply your personal content below to enable it.
   */
  features: {
    photoGallery: boolean;
    dressCode: boolean;
    weddingSchedule: boolean;
    guestbook: boolean;
    giftBox: boolean;
  };
  optionalSections: {
    gallery: {
      title: string;
      subtitle: string;
      photos: WeddingPhoto[];
    };
    dressCode: {
      title: string;
      description: string;
      palette: { name: string; hex: string }[];
    };
    schedule: {
      title: string;
      items: ScheduleItem[];
    };
    guestbook: {
      title: string;
      subtitle: string;
    };
    giftBox: {
      title: string;
      buttonLabel: string;
      message: string;
      accounts: GiftAccount[];
    };
  };
}

export const weddingConfig: WeddingConfig = {
  couple: {
    groomShortName: 'Nafis',
    brideShortName: 'Nishat',
    groomFullName: 'Mehedi Hasan Nafis',
    brideFullName: 'Nishat Tasnim',
    groomRoleLabel: 'GROOM',
    brideRoleLabel: 'BRIDE',
  },

  parents: {
    groomPrefix: 'Mr. & Mrs.',
    groomLines: ['Md. Kaikubad', 'Khaleda Haque'],
    bridePrefix: 'Mr. & Mrs.',
    brideLines: ['S.M Manzurul Islam', 'Late Kamrun Nahar'],
  },

  invitationCard: {
    bismillahArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    bismillahTranslation: [
      '“In the Name of Almighty Allah,',
      'The Most Gracious & The Most Merciful”',
    ],
    hostLines: [
      'We, MR. & MRS. Md. Kaikubad',
      'Cordially Request The Pleasure of Your',
      'Presence & Blessings At The',
      'Wedding Reception of Our Son',
    ],
    brideDaughterOf: 'S. M. Manzurul Islam & Late Kamrun Nahar',
  },

  ceremony: {
    sectionTitle: 'CEREMONY INFO',
    announcementLines: [
      'WE JOYFULLY ANNOUNCE',
      'THE WEDDING OF OUR CHILDREN',
    ],
  },

  reception: {
    sectionTitle: 'RECEPTION INFO',
    subtitle: 'THE RECEPTION WILL TAKE PLACE AT:',
    // Tuesday, January 19, 2027 at 19:00 Asia/Dhaka (UTC+6)
    dateIsoStart: '2027-01-19T19:00:00+06:00',
    dateIsoEnd: '2027-01-19T23:00:00+06:00',
    timezone: 'Asia/Dhaka',
    displayTime: '19:00',
    displayTime12h: 'at 7:00 PM',
    displayWeekday: 'TUESDAY',
    displayDay: 19,
    displayDayOrdinal: 'th',
    displayMonth: 'JANUARY',
    displayYear: 2027,
    calendarMonthIndex: 0,
    calendarYear: 2027,
    calendarHighlightDay: 19,
    calendarEventTitle: 'Wedding Reception: Mehedi Hasan Nafis & Nishat Tasnim',
    calendarEventDescription:
      'We joyfully invite you to the wedding reception of Mehedi Hasan Nafis (Son of Mr. & Mrs. Md. Kaikubad) and Nishat Tasnim (Daughter of S.M Manzurul Islam & Late Kamrun Nahar) at Anchor Hall, RAOWA Convention Hall, Mohakhali, Dhaka.',
  },

  venue: {
    sectionTitle: 'WEDDING RECEPTION VENUE',
    hallName: 'Anchor Hall, RAOWA Convention Hall',
    addressLines: [
      'Anchor Hall, RAOWA Convention Hall',
      'Bir Uttam Ziaur Rahman Road',
      'Mohakhali, Dhaka - 1203',
    ],
    fullAddress:
      'Anchor Hall, RAOWA Convention Hall, Bir Uttam Ziaur Rahman Road, Mohakhali, Dhaka - 1203',
    // Exact coordinates resolved from https://maps.app.goo.gl/FtaJgTqfoaU92XwY9
    latitude: 23.7778396,
    longitude: 90.3955859,
    mapsShareUrl: 'https://maps.app.goo.gl/FtaJgTqfoaU92XwY9',
    directionsUrl:
      'https://www.google.com/maps/dir/?api=1&destination=23.7778396,90.3955859&destination_place_id=ChIJAYBYq2nHVTcRtv717F8Qm9U',
    mapEmbedUrl:
      'https://maps.google.com/maps?q=RAOWA+Convention+Hall,+Bir+Uttam+Ziaur+Rahman+Rd,+Dhaka&ll=23.7778396,90.3955859&z=16&ie=UTF8&iwloc=B&output=embed',
  },

  music: {
    src: '/audio/bismillah.mp3',
    title: 'Bismillah',
    artistHint: 'Now Playing · Bismillah',
    defaultVolume: 0.8,
  },

  assets: {
    palaceBackdrop: '/images/palace-bg.webp',
    floralBouquet: '/images/floral-bouquet-cutout.webp',
    waxSeal: '/images/wax-seal-cutout.webp',
    receptionCard: '/images/reception-card-full.webp',
  },

  hero: {
    saveTheDateLabel: 'SAVE THE DATE',
    introKicker: 'THE WEDDING CELEBRATION OF',
    introDateLine: 'TUESDAY · JANUARY 19, 2027',
    introCardDate: 'January 19, 2027',
    introCordiallyLabel: 'Cordially Invites',
    openButtonLabel: 'Open',
    musicHintLabel: 'Tap to enter with music',
    tapCardHint: 'Tap card to read',
  },

  footer: {
    blessingMessage: 'Your presence would be the greatest gift we could receive!',
    monogramLine: 'NAFIS & NISHAT · 19.01.2027',
  },

  rsvp: {
    buttonLabel: 'CONFIRM ATTENDANCE',
    modalTitle: 'CONFIRM ATTENDANCE',
    modalDescription:
      'Kindly let us know if you will be joining us at Anchor Hall, RAOWA Convention Hall.',
    contactPhone: '01911-188249',
    allowGuestCount: true,
    allowDietaryOrMessage: true,
    guestSides: [
      "Groom's Family & Friends (Nafis)",
      "Bride's Family & Friends (Nishat)",
      'Mutual Friends & Colleagues',
    ],
  },

  features: {
    photoGallery: false,
    dressCode: false,
    weddingSchedule: false,
    guestbook: false,
    giftBox: false,
  },

  optionalSections: {
    gallery: {
      title: 'OUR MOMENTS',
      subtitle: 'Add your personal engagement or wedding photographs in src/config/wedding.ts',
      photos: [],
    },
    dressCode: {
      title: 'DRESS CODE',
      description: 'Traditional Bangladeshi formal or festive evening attire in warm burgundy, champagne, ivory, or gold tones.',
      palette: [
        { name: 'Burgundy', hex: '#4E1217' },
        { name: 'Champagne', hex: '#E4C583' },
        { name: 'Ivory', hex: '#FAF3E9' },
        { name: 'Dusty Rose', hex: '#B87A7E' },
      ],
    },
    schedule: {
      title: 'WEDDING DAY SCHEDULE',
      items: [
        {
          time: '19:00',
          title: 'Guest Arrival & Welcome',
          description: 'Reception doors open at Anchor Hall, RAOWA Convention Hall.',
        },
        {
          time: '20:00',
          title: 'Couple Entrance & Photography',
          description: 'Warm greetings, blessings, and family portraits.',
        },
        {
          time: '20:45',
          title: 'Wedding Dinner',
          description: 'Traditional banquet dinner served with our loved ones.',
        },
      ],
    },
    guestbook: {
      title: 'WARM WISHES',
      subtitle: 'Leave your blessings and duas for Nafis & Nishat.',
    },
    giftBox: {
      title: 'WEDDING GIFT',
      buttonLabel: 'SEND A BLESSING GIFT',
      message: 'Your presence and prayers mean the world to us.',
      accounts: [],
    },
  },
};
