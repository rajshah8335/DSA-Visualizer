const TEMPLATE_BASE =
  "https://origine-links.netlify.app/bytecraft/template";

export async function loadTemplate(templateKey) {
  try {
    const module = await import(
      `${TEMPLATE_BASE}/${templateKey}.js`
    );

    // support default OR named export
    return module.default || module[Object.keys(module)[0]];
  } catch (err) {
    console.error("Template load failed:", templateKey, err);
    throw new Error("Template not found");
  }
}
