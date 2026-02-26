import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnumsService {

  constructor() { }

  trip_ticket_types = [
    { id: 1, name: "رحلة مفتوحة ذهاب فقط" },
    { id: 2, name: "رحلة مفتوحة عودة فقط" },
    { id: 3, name: "رحلة مفتوحة ذهاب وعودة" },
    { id: 4, name: "تسكين" },
    { id: 5, name: "رحلة ذهاب وعودة" },
    { id: 6, name: "رحلة مفتوحة مكة مدينة" },
    // { id: 6, name: "رحلة مفتوحة ترانزيت" },
  ];

  open_trip_types = [
    { id: 1, name: "ذهاب" },
    { id: 2, name: "عودة" },
    { id: 3, name: "ذهاب وعودة" },
    { id: 6, name: "مكة مدينة" },
  ];

  trip_types = [
    { id: 4, name: "تسكين" },
    { id: 5, name: "رحلة ذهاب وعودة" },
    { id: 10, name: "رحلة مفتوحة" } // <==== للتمييز فقط في الفرونت
  ]

  residence_types = [
    { id: 1, name: "بسكن" },
    { id: 2, name: "بدون سكن" }
  ]// للتمييز فقط في الفرونت

  Payment_types = [ //+++++++++++++++++++++++++++++++
    { id: 1, name: "مدفوع" },
    { id: 2, name: "غير مدفوع" },
    { id: 3, name: "مدفوع جزئيًا" }
  ];

  stay_types = [
    { id: 1, name: "عزاب" },
    { id: 2, name: "عائلي" }
  ];

  // الحجز بالسرير ام بالغرفة
  accommodation_unit_type = [
    { id: 1, name: "بالسرير" },
    { id: 2, name: "بالغرفة" }
  ]

  // أنواع الغرف
  room_types: { id: number, name: string }[] = [
    { id: 1, name: 'غرفة س كينج' },
    { id: 2, name: 'غرفة ثنائية' },
    { id: 3, name: 'غرفة ثلاثية' },
    { id: 4, name: 'غرفة رباعية' }
  ];

  nationalities = [
    { id: 0, name: "مصري" },
    { id: 1, name: "سعودي" },
    { id: 2, name: "إماراتي" },
    { id: 3, name: "قطري" },
    { id: 4, name: "كويتي" },
    { id: 5, name: "بحريني" },
    { id: 6, name: "عماني" },
    { id: 7, name: "أردني" },
    { id: 8, name: "لبناني" },
    { id: 9, name: "سوري" },
    { id: 10, name: "فلسطيني" },
    { id: 11, name: "عراقي" },
    { id: 12, name: "ليبي" },
    { id: 13, name: "تونسي" },
    { id: 14, name: "جزائري" },
    { id: 15, name: "مغربي" },
    { id: 16, name: "سوداني" },
    { id: 17, name: "موريتاني" },
    { id: 18, name: "يمني" },
    { id: 19, name: "هندي" },
    { id: 20, name: "باكستاني" },
    { id: 21, name: "اندونيسي" },
    { id: 22, name: "بنجلادش" },
    { id: 23, name: "صومالي" },
    { id: 24, name: "تشادي" },
    { id: 25, name: "نيجيري" },
    { id: 26, name: "إيطالي" },
    { id: 27, name: "امريكي" },
    { id: 28, name: "تركي" },
    { id: 29, name: "فلبيني" },
  ];

  genderes = [
    { id: 1, name: "ذكر" },
    { id: 2, name: "أنثى" }
  ];

  cities = [
    { id: 1, name: "الرياض" },
    { id: 2, name: "مكة المكرمة" },
    { id: 3, name: "المدينة المنورة" },
    { id: 4, name: "القصيم" },
    { id: 5, name: "الشرقية" },
    { id: 6, name: "عسير" },
    { id: 7, name: "تبوك" },
    { id: 8, name: "حائل" },
    { id: 9, name: "الحدود الشمالية" },
    { id: 10, name: "جازان" },
    { id: 11, name: "نجران" },
    { id: 12, name: "الباحة" },
    { id: 13, name: "الجوف" }
  ];

  bus_type = [
    { id: 0, name: "VIP" },
    { id: 1, name: "Standard" }
  ];

  reservation_payment_method = [
    { id: 1, name: "كاش" },
    { id: 2, name: "تحويل" },
    { id: 3, name: "شبكة" },
    { id: 4, name: "خصم" },

  ];

}
