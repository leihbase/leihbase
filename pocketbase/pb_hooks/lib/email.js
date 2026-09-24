/// <reference path="../../pb_data/types.d.ts" />
/// <reference path="../types.d.ts" />

const ReservationConfirmationVars = /** @type {const} */ ([
  "APP_URL",
  "USER_NAME",
  "PRODUCT_URL",
  "PRODUCT_NAME",
  "PRODUCT_DEPOSIT",
  "RESERVATION_START",
  "RESERVATION_END",
  "LENDING_CONDITIONS_LINK",
]);

const ReservationConfirmationLocationVars = /** @type {const} */ ([
  "APP_URL",
  "USER_NAME",
  "USER_EMAIL",
  "PRODUCT_URL",
  "PRODUCT_NAME",
  "RESERVATION_START",
  "RESERVATION_END",
  "MESSAGE",
]);

const ReservationStartReminderVars = /** @type {const} */ ([
  "APP_URL",
  "USER_NAME",
  "LOCATION_NAME",
  "PRODUCT_NAME",
  "RESERVATION_START",
  "START_HOUR",
  "END_HOUR",
]);

const ReservationEndReminderVars = /** @type {const} */ ([
  "APP_URL",
  "USER_NAME",
  "LOCATION_NAME",
  "PRODUCT_NAME",
  "RESERVATION_END",
  "START_HOUR",
  "END_HOUR",
]);

const CancellationConfirmationVars = /** @type {const} */ ([
  "APP_URL",
  "USER_NAME",
  "PRODUCT_URL",
  "PRODUCT_NAME",
]);

const ReservationCancellationLocationVars = /** @type {const} */ ([
  "APP_URL",
  "PRODUCT_URL",
  "PRODUCT_NAME",
  "USER_NAME",
  "USER_EMAIL",
  "RESERVATION_START",
  "RESERVATION_END",
]);

/**
 * @typedef {{
 *  reservation_confirmation: (typeof ReservationConfirmationVars)[number];
 *  reservation_confirmation_location: (typeof ReservationConfirmationLocationVars)[number];
 *  reservation_start_reminder: (typeof ReservationStartReminderVars)[number];
 *  reservation_end_reminder: (typeof ReservationEndReminderVars)[number];
 *  cancellation_confirmation: (typeof CancellationConfirmationVars)[number];
 *  reservation_cancellation_location: (typeof ReservationCancellationLocationVars)[number];}
 * } EmailTemplateVars
 **/

/**
 * Formats currency for use in email templates
 * @param {number} n
 * @returns {string}
 */
function formatCurrency(n) {
  if (!n) return "";
  return `${Math.round(n)}€`;
}

/**
 * Gets default template for a given name and locale
 * @param {TemplateName} templateName
 * @param {string} locale
 * @returns {{subject: string, html: string}|null}
 */
function getDefaultTemplate(templateName, locale) {
  try {
    /** @type {typeof import('./emails.en')} */
    const templates = require(`${__hooks}/lib/emails.${locale}`);
    if (templates[templateName]) {
      return { ...templates[templateName] };
    }
  } catch (e) {
    console.error(
      `[email] Failed to load default template ${templateName} for locale ${locale}:`,
      e
    );
  }
  return null;
}

/**
 * Renders a template with variables (supports {VAR_NAME} and {#if VAR_NAME}...{/if} syntax)
 * @param {string} template
 * @param {Record<string, string | null>} variables
 * @returns {string}
 */
function renderTemplate(template, variables) {
  if (!template) {
    return template;
  }

  let result = template;

  // First, process {#if VARIABLE}...{/if} conditionals
  // Uses non-greedy matching ([\s\S]*?) to handle content across multiple lines
  result = result.replace(
    /\{#if (\w+)\}([\s\S]*?)\{\/if\}/g,
    (_match, varName, content) => {
      return variables[varName] ? content : "";
    }
  );

  // Then replace {VARIABLE_NAME} placeholders
  result = result.replace(/\{(\w+)\}/g, (match, varName) => {
    return !!variables[varName] ? variables[varName] : match;
  });

  return result;
}

/**
 * Gets sender info for a location (falls back to global settings)
 * @param {core.Record} location
 * @returns {{address: string, name: string}}
 */
function getSenderInfo(location) {
  if (
    location.get("email_sender_name") ||
    location.get("email_sender_address")
  ) {
    return {
      address:
        location.get("email_sender_address") ||
        $app.settings().meta.senderAddress,
      name:
        location.get("email_sender_name") || $app.settings().meta.senderName,
    };
  }
  return {
    address: $app.settings().meta.senderAddress,
    name: $app.settings().meta.senderName,
  };
}

/**
 * Fetches email templates for a location and template type from the database
 * @param {string} locationId
 * @param {TemplateName} templateName
 * @param {string} locale
 * @returns {{subject: string, html: string}|null}
 */
function getEmailTemplate(locationId, templateName, locale) {
  const templates = $app.findRecordsByFilter(
    "email_templates",
    `location = {:locationId} && name = {:templateName} && locale = {:locale} && enabled = true`,
    '',
    1,
    0,
    {
      locationId,
      templateName,
      locale,
    }
  );

  if (templates && templates.length > 0 && templates[0]) {
    return {
      subject: templates[0].get("subject"),
      html: templates[0].get("html"),
    };
  }

  return null;
}

/**
 * Gets a template (custom or default) and renders it with variables
 * @param {core.Record} location
 * @param {TemplateName} templateName
 * @param {Record<string, string | null>} templateVars - Variables for template rendering
 * @param {string} locale
 * @returns {{subject: string, html: string}}
 */
function getRenderedTemplate(location, templateName, templateVars, locale) {
  // Try to get custom template from database
  const customTemplate = getEmailTemplate(
    location.get("id"),
    templateName,
    locale
  );

  // Try to get default template
  const defaultTemplate = getDefaultTemplate(templateName, locale);

  // Use custom template if available, otherwise use default
  const template = customTemplate || defaultTemplate;

  if (template) {
    return {
      subject: renderTemplate(template.subject, templateVars),
      html: renderTemplate(template.html, templateVars),
    };
  }

  // Fallback to empty template (should not happen with proper defaults)
  return { subject: templateName, html: "" };
}

/**
 * Sends an email to recipient(s) using a template
 * @template {TemplateName} T
 * @param {core.Record} location - The location
 * @param {T} templateName - Name of the template type
 * @param {string|string[]} recipientEmail - Email address(es) of the recipient(s)
 * @param {string} locale - Locale for template lookup
 * @param {Record<EmailTemplateVars[T], string | null>} templateVars - Variables for template rendering
 */
function sendLocationTemplateEmail(
  location,
  templateName,
  recipientEmail,
  locale,
  templateVars
) {
  const senderInfo = getSenderInfo(location);

  const emailTemplate = getRenderedTemplate(
    location,
    templateName,
    templateVars,
    locale
  );

  // Support both single email string and array of emails
  const recipients = Array.isArray(recipientEmail)
    ? recipientEmail.map((email) => ({ address: email }))
    : [{ address: recipientEmail }];

  const email = new MailerMessage({
    from: senderInfo,
    to: recipients,
    ...emailTemplate,
  });
  $app.newMailClient().send(email);
}

module.exports = {
  sendLocationTemplateEmail,
  getSenderInfo,
  formatCurrency,
  emailTemplateVars: {
   reservation_confirmation: ReservationConfirmationVars,
   reservation_confirmation_location: ReservationConfirmationLocationVars,
   reservation_start_reminder: ReservationStartReminderVars,
   reservation_end_reminder: ReservationEndReminderVars,
   cancellation_confirmation: CancellationConfirmationVars,
   reservation_cancellation_location: ReservationCancellationLocationVars,
  }
};
