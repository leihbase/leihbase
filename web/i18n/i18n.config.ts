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
        // pocketbase
        validation_required: "This field is required.",
        validation_invalid_old_password: "Wrong password.",
        validation_values_mismatch: "The two fields do not match.",
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
        // pocketbase
        validation_required: "Dieses Feld ist erforderlich.",
        validation_invalid_old_password: "Falsches Passwort.",
        validation_values_mismatch: "Die zwei Felder stimmen nicht überein.",
      },
    },
  };
});
