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
  const { getPreviewTemplate, renderPreviewTemplate } = require(`${__hooks}/lib/email`);

  if (!e.request) return

  const templateName = /** @type {TemplateName} */ (e.request.url?.query().get('templateName'));
  const locale = e.request.url?.query().get('locale');
  const locationId = e.request.url?.query().get('locationId');
  const customSubject = e.request.url?.query().get('customSubject');
  const customHtml = e.request.url?.query().get('customHtml');

  if (!templateName || !locale) {
    return e.json(400, { error: "templateName and locale query params are required" });
  }

  let subject, html;

  // If custom subject/html provided, use those
  if (customSubject || customHtml) {
    subject = customSubject || "";
    html = customHtml || "";
  } else {
    // Otherwise fetch the template
    const template = getPreviewTemplate(templateName, locale, locationId || null);
    
    if (!template) {
      return e.json(404, { error: "Template not found" });
    }
    
    subject = template.subject;
    html = template.html;
  }

  // Render with preview variables
  const rendered = renderPreviewTemplate(subject, html, templateName);
  
  return e.json(200, {
    templateName,
    ...rendered,
  });
});
