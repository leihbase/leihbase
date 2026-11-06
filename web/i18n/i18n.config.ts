export default defineI18nConfig(() => {
  const config = useRuntimeConfig();
  return {
    legacy: false,
    locale: config.public.locale,
    availableLocales: ["en", "de"],
    messages: {
      en: {
        week_days: {
          monday: "Monday",
          tuesday: "Tuesday",
          wednesday: "Wednesday",
          thursday: "Thursday",
          friday: "Friday",
          saturday: "Saturday",
          sunday: "Sunday",
        },
        week_days_short: {
          monday: "Mo",
          tuesday: "Tu",
          wednesday: "We",
          thursday: "Th",
          friday: "Fr",
          saturday: "Sa",
          sunday: "Su",
        },
        months: {
          january: "January",
          february: "February",
          march: "March",
          april: "April",
          may: "May",
          june: "June",
          july: "July",
          august: "August",
          september: "September",
          october: "October",
          novermber: "November",
          december: "December",
        },
        hour: "h",
        previous_month: "Previous Month",
        next_month: "Next Month",
        closed_at: "Closed at",
        // reservation cancellation
        cancellation_success_message: "Your reservation has been cancelled.",
        cancellation_unknown_error_message:
          "Something went wrong while cancelling your reservation. Please try again, or send an e-mail to {0}.",
        // reservation errors
        reservation_errors: {
          user_not_verified:
            "Confirm your e-mail address before placing a reservation.",
          product_has_open_reservation:
            "This product is currently not available.",
          user_has_open_reservation:
            "You have an open reservation for this product. Reach out on {email} to extend or change your reservation.",
          date_range_too_long:
            "Products can't be reserved for longer than {days} days. Reach out on {email} to discuss a longer period.",
          overlapping_reservation:
            "The product is already reserved for this period.",
          start_before_today: "The start of the reservation is before today.",
          end_before_today: "The end of the reservation is before today.",
          start_and_end_equal:
            "The start and end of the reservation can't be on the same day.",
          end_before_start:
            "The end can't be before the start of the reservation.",
          reservation_system_disabled:
            "Reservations are not allowed for this location.",
          reservation_start_too_far_in_future:
            "Reservations can't start more than {days} days in the future. Reach out on {email} to discuss.",
          general:
            "Something went wrong while creating the reservation, please try again.",
        },
        borrow_agreement_acceptance_error:
          "Something went wrong while accepting the borrowing terms, please try again.",
        // pocketbase
        validation_required: "This field is required.",
        validation_invalid_old_password: "Wrong password.",
        validation_values_mismatch: "The two fields do not match.",
        email_templates: {
          reservation_confirmation: "Reservation Confirmation (User)",
          reservation_confirmation_location:
            "Reservation Confirmation (Location)",
          reservation_start_reminder: "Pickup Reminder",
          reservation_end_reminder: "Return Reminder",
          cancellation_confirmation: "Cancellation Confirmation (User)",
          reservation_cancellation_location:
            "Cancellation Confirmation (Location)",
        },
      },
      de: {
        week_days: {
          monday: "Montags",
          tuesday: "Dienstags",
          wednesday: "Mittwochs",
          thursday: "Donnerstags",
          friday: "Freitags",
          saturday: "Samstags",
          sunday: "Sonntags",
        },
        week_days_short: {
          monday: "Mo",
          tuesday: "Di",
          wednesday: "Mi",
          thursday: "Do",
          friday: "Fr",
          saturday: "Sa",
          sunday: "So",
        },
        months: {
          january: "Januar",
          february: "Februar",
          march: "März",
          april: "April",
          may: "Mai",
          june: "Juni",
          july: "Juli",
          august: "August",
          september: "September",
          october: "Oktober",
          november: "November",
          december: "Dezember",
        },
        hour: "Uhr",
        previous_month: "Vorheriger Monat",
        next_month: "Nächster Monat",
        closed_at: "Zu am",
        // reservation cancellation
        cancellation_success_message:
          "Deine Reservierung ist erfolgreich storniert.",
        cancellation_unknown_error_message:
          "Beim stornieren deine Reservierung ist was schief gelaufen. Bitte versuche es erneut, oder schicke eine E-Mail an {0}.",
        reservation_errors: {
          user_not_verified:
            "Bestätige deine E-Mail-Adresse, bevor du reservierst.",
          product_has_open_reservation:
            "Dieser Gegenstand ist derzeit nicht verfügbar.",
          user_has_open_reservation:
            "Du hast diesen Gegenstand bereits reserviert. Wenn du deine Reservierung verlängern oder ändern möchtest, schreibe eine Mail an {email}.",
          date_range_too_long:
            "Produkte können nicht länger als {days} Tage reserviert werden. Kontaktiere uns unter {email}, um einen längeren Zeitraum zu besprechen.",
          overlapping_reservation:
            "Das Produkt ist für diesen Termin bereits reserviert.",
          start_before_today:
            "Der Beginn der Reservierung liegt vor dem heutigen Tag.",
          end_before_today:
            "Das Enddatum der Reservierung liegt vor dem heutigen Tag.",
          start_and_end_equal:
            "Beginn und Ende der Reservierung dürfen nicht am selben Tag liegen.",
          end_before_start:
            "Ende kann nicht vor Beginn der Reservierung liegen.",
          reservation_system_disabled:
            "Reservierungen sind für diesen Standort nicht erlaubt.",
          reservation_start_too_far_in_future:
            "Reservierungen können nicht mehr als {days} Tage im Voraus beginnen. Kontaktiere uns unter {email}, um dies zu besprechen.",
          general:
            "Beim Erstellen deiner Reservierung ist ein Fehler aufgetreten, bitte versuche es erneut.",
        },
        borrow_agreement_acceptance_error:
          "Beim Akzeptieren der Leihbedingungen ist ein Fehler aufgetreten, bitte versuche es erneut.",
        // pocketbase
        validation_required: "Dieses Feld ist erforderlich.",
        validation_invalid_old_password: "Falsches Passwort.",
        validation_values_mismatch: "Die zwei Felder stimmen nicht überein.",
        email_templates: {
          reservation_confirmation: "Reservierungsbestätigung (Nutzer)",
          reservation_confirmation_location:
            "Reservierungsbestätigung (Standort)",
          reservation_start_reminder: "Abhol-Erinnerung",
          reservation_end_reminder: "Rückgabe-Erinnerung",
          cancellation_confirmation: "Stornierungsbestätigung (Nutzer)",
          reservation_cancellation_location:
            "Stornierungsbestätigung (Standort)",
        },
      },
    },
  };
});
