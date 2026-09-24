module.exports = {
  reservation_confirmation: {
    subject: "Reservation confirmation of '{PRODUCT_NAME}'",
    html: `Hi {USER_NAME},<br>
<br>
your reservation for the item "{PRODUCT_LINK}" is confirmed. You can pick it up on {RESERVATION_START} and use it until {RESERVATION_END}.<br>
<br>
{#if PRODUCT_DEPOSIT}Please bring the deposit of {PRODUCT_DEPOSIT}, preferably in exact change.<br><br>{/if}
You can cancel anytime in your <a href="{APP_URL}/reservations">reservation overview</a>.<br>
<br>
Best regards,<br>
The {LOCATION_NAME} team`,
  },
  reservation_confirmation_location: {
    subject: "New reservation: {USER_NAME} - {PRODUCT_NAME}",
    html: `Hi,<br>
<br>
A new reservation by {USER_NAME} (<a href="mailto:{USER_EMAIL}">{USER_EMAIL}</a>).<br>
<br>
<strong>Details</strong><br>
Location: {LOCATION_NAME}<br>
Item: <a href="{PRODUCT_URL}">{PRODUCT_NAME}</a><br>
Start: {RESERVATION_START}<br>
End: {RESERVATION_END}<br>
{#if MESSAGE}
<br>
{USER_NAME} writes:<br>
<blockquote>
{MESSAGE}<br>
</blockquote>
{/if}`,
  },
  reservation_start_reminder: {
    subject: "Pick-up of '{PRODUCT_NAME}'",
    html: `Hi {USER_NAME},<br>
<br>
you reserved a {PRODUCT_NAME} at {LOCATION_NAME}. The item can be picked up tomorrow ({RESERVATION_START}) {#if START_HOUR}between {START_HOUR} and {END_HOUR}{/if}.<br>
If you no longer need it, you can cancel your reservation in your <a href="{APP_URL}/reservations">reservation overview</a>.<br>
<br>
Best regards,<br>
The {LOCATION_NAME} team`,
  },
  reservation_end_reminder: {
    subject: "Return of '{PRODUCT_NAME}'",
    html: `Hi {USER_NAME},<br>
<br>
we hope everything worked out well with the item '{PRODUCT_NAME}'!
<br>
The borrow-period ends tomorrow ({RESERVATION_END}), so we would like to remind you of returning it to {LOCATION_NAME}.<br>
<br>
{#if START_HOUR}{LOCATION_NAME} is tomorrow open from {START_HOUR} to {END_HOUR}.<br><br>{/if}
If you would like to keep the item for longer, you can extend the reservation in your <a href="{APP_URL}/reservations">reservation overview</a>.<br>
<br>
Best regards,<br>
The {LOCATION_NAME} team`,
  },
  cancellation_confirmation: {
    subject: "Cancellation confirmation for {PRODUCT_NAME}",
    html: `Hi {USER_NAME},<br>
<br>
We hereby confirm the cancellation of your reservation for the item "<a href="{PRODUCT_URL}">{PRODUCT_NAME}</a>".<br>
<br>
Thanks for sharing, the item is now available again for other neighbours!<br>
<br>
See you next time!<br>
<br>
Best regards,<br>
The {LOCATION_NAME} team`,
  },
  reservation_cancellation_location: {
    subject: "Cancellation: {USER_NAME} - {PRODUCT_NAME}",
    html: `The reservation of {USER_NAME} (<a href="mailto:{USER_EMAIL}">{USER_EMAIL}</a>) for the item "{PRODUCT_NAME}" has been cancelled.<br>
<br>
<strong>Details</strong><br>
Location: {LOCATION_NAME}<br>
Item: <a href="{PRODUCT_URL}">{PRODUCT_NAME}</a><br>
Start: {RESERVATION_START}<br>
End: {RESERVATION_END}`,
  },
};
