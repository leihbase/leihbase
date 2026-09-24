/// <reference path="../pb_data/types.d.ts" />
/// <reference path="./types.d.ts" />

/**
 * Custom route to fetch a specific default email template
 * @param {core.RequestEvent} e
 */
routerAdd("GET", "/api/email-templates/defaults/{locale}/{templateName}", (e) => {
  /** @type {typeof import('./lib/email')} */
  const { emailTemplateVars } = require(`${__hooks}/lib/email`);

  if (!e.request) return

  const templateName = /** @type {TemplateName} */ (e.request.pathValue("templateName"));
  const locale = e.request.pathValue("locale");

  /** @type {typeof import('./lib/emails.en')} */
  const templates = require(`${__hooks}/lib/emails.${locale}`);
  
  const template = templates[templateName];
  
  if (!template) {
    return e.json(404, { error: "Template not found" });
  }
  
  return e.json(200, { template, vars: emailTemplateVars[templateName] });
});

/**
 * Custom route to get a preview of an email template (custom or default)
 * @param {core.RequestEvent} e
 */
routerAdd("GET", "/api/email-templates/preview", (e) => {
  /** @type {typeof import('./lib/email')} */
  const { getPreviewTemplate } = require(`${__hooks}/lib/email`);

  if (!e.request) return

  const templateName = /** @type {TemplateName} */ (e.request.url?.query().get('templateName'));
  const locale = e.request.url?.query().get('locale');
  const locationId = e.request.url?.query().get('locationId');
  const useDefault = e.request.url?.query().get('useDefault') === "true";

  if (!templateName || !locale) {
    return e.json(400, { error: "templateName and locale query params are required" });
  }

  const preview = getPreviewTemplate(templateName, locale, locationId || null, useDefault);
  
  if (!preview) {
    return e.json(404, { error: "Template not found" });
  }
  
  return e.json(200, preview);
});
