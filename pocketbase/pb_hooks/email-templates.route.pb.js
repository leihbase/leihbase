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
