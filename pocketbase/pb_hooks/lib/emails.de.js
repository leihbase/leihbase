module.exports = {
  reservation_confirmation: {
    subject: "Reservierungsbestätigung für {PRODUCT_NAME}",
    html: `Hallo {USER_NAME},<br>
<br>
deine Reservierung für das Gegenstand "{PRODUCT_LINK}" ist bestätigt. Du kannst es am {RESERVATION_START} abholen und bis zum {RESERVATION_END} nutzen.<br>
<br>
{#if PRODUCT_DEPOSIT}Bitte bringe das Pfand von {PRODUCT_DEPOSIT} möglichst passend mit.<br><br>{/if}
Stornieren kannst du jederzeit in deiner <a href="{APP_URL}/reservations">Reservierungsübersicht</a>.<br>
<br>
Liebe Grüße,<br>
Das {LOCATION_NAME}-Team`,
  },
  reservation_confirmation_location: {
    subject: "Neue Reservierung: {USER_NAME} - {PRODUCT_NAME}",
    html: `Hi,<br>
<br>
Eine neue Reservierung von {USER_NAME} (<a href="mailto:{USER_EMAIL}">{USER_EMAIL}</a>).<br>
<br>
<strong>Details</strong><br>
Standort: {LOCATION_NAME}<br>
Gegenstand: <a href="{PRODUCT_URL}">{PRODUCT_NAME}</a><br>
Beginn: {RESERVATION_START}<br>
Ende: {RESERVATION_END}<br>
{#if MESSAGE}<br>{USER_NAME} schreibt:<br><blockquote>{MESSAGE}<br></blockquote>{/if}`,
  },
  reservation_start_reminder: {
    subject: "Abholen des Gegenstands '{PRODUCT_NAME}'",
    html: `Hallo {USER_NAME},<br>
<br>
du hast bei {LOCATION_NAME} den Gegenstand '{PRODUCT_NAME}' reserviert.<br>
<br>
Der Gegenstand liegt morgen ({RESERVATION_START}) {#if START_HOUR}zwischen {START_HOUR} und {END_HOUR}{/if} bereit zum abholen.<br>
<br>
Falls du ihn nicht mehr benötigst, kannst du deine Reservierung in deiner <a href="{APP_URL}/reservations">Reservierungsübersicht</a> stornieren.<br>
<br>
Liebe Grüße,<br>
Das {LOCATION_NAME}-Team`,
  },
  reservation_end_reminder: {
    subject: "Zurückbringen des Gegenstands '{PRODUCT_NAME}'",
    html: `Hallo {USER_NAME},<br>
<br>
wir hoffen, mit dem Gegenstand {PRODUCT_NAME} hat alles gut funktioniert!<br>
Deine Leihfrist endet morgen ({RESERVATION_END}), also bring uns den Gegenstand bitte zurück zur {LOCATION_NAME}.<br>
<br>
{#if START_HOUR}{LOCATION_NAME} ist geöffnet von {START_HOUR} bis {END_HOUR}.<br><br>{/if}
Falls du den Gegenstand länger behalten möchtest, kannst du die Reservierung in deiner <a href="{APP_URL}/reservations">Reservierungsübersicht</a> verlängern.<br>
<br>
Liebe Grüße,<br>
Das {LOCATION_NAME}-Team`,
  },
  cancellation_confirmation: {
    subject: "Stornierungsbestätigung für {PRODUCT_NAME}",
    html: `Hallo {USER_NAME},<br>
<br>
hiermit bestätigen wir die Stornierung deiner Reservierung für den Gegenstand "<a href="{PRODUCT_URL}">{PRODUCT_NAME}</a>".<br>
<br>
Danke fürs Weitergeben, der Gegenstand ist jetzt wieder verfügbar für andere Nachbar:innen!<br>
<br>
Gerne bis zum nächste Mal!<br>
<br>
Liebe Grüße,<br>
Das {LOCATION_NAME}-Team`,
  },
  reservation_cancellation_location: {
    subject: "Stornierung: {USER_NAME} - {PRODUCT_NAME}",
    html: `Der Reservierung von {USER_NAME} (<a href="mailto:{USER_EMAIL}">{USER_EMAIL}</a>) für den Gegenstand {PRODUCT_NAME} ist storniert.<br>
<br>
<strong>Details</strong><br>
Standort: {LOCATION_NAME}<br>
Gegenstand: <a href="{PRODUCT_URL}">{PRODUCT_NAME}</a><br>
Beginn: {RESERVATION_START}<br>
Ende: {RESERVATION_END}`,
  },
};
