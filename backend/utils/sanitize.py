"""
Server-side HTML sanitization for blog content written through the admin
CMS and AI generation paths.

Sanitizing on WRITE (not just on read) is defense-in-depth: the DB is the
source of truth for every consumer (the public JSON API, the AI translator
that round-trips the HTML through an LLM, the admin editor/preview, any
future RSS/native client). Relying on the frontend read-path sanitizer
(`src/lib/blogApi.ts` / DOMPurify) means any consumer that doesn't run the
exact same config renders attacker- or LLM-supplied markup.

The allowlist mirrors the frontend's `sanitize-html` config so the
write-path and read-path agree on what survives.
"""
import bleach

ALLOWED_TAGS = [
    "h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li",
    "strong", "b", "em", "i", "u", "a", "blockquote", "br", "hr",
    "code", "pre", "img", "figure", "figcaption", "span",
    "table", "thead", "tbody", "tr", "td", "th",
]

ALLOWED_ATTRIBUTES = {
    "a": ["href", "name", "target", "rel"],
    "img": ["src", "alt", "width", "height", "loading"],
    "*": ["class"],
}

ALLOWED_PROTOCOLS = ["http", "https", "mailto"]

# Blog document fields that hold rich HTML and must be sanitized on write.
HTML_FIELDS = ("content_html", "content_html_de")


def _normalize_nbsp(html):
    """Replace non-breaking spaces with ordinary spaces.

    The translation LLM emits U+00A0 between words; bleach then serializes those
    as &nbsp; entities. A non-breaking space prevents line wrapping, so a body
    full of them becomes one unbreakable string that overflows the page. Plain
    blog copy never needs nbsp, so normalize every form back to a normal space.
    """
    if not isinstance(html, str) or not html:
        return html
    for form in ("\u00a0", "&nbsp;", "&#160;", "&#xa0;", "&#xA0;"):
        html = html.replace(form, " ")
    return html


def sanitize_html(html):
    """Strip disallowed tags/attributes/protocols. Non-strings pass through."""
    if not isinstance(html, str) or not html:
        return html
    cleaned = bleach.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        protocols=ALLOWED_PROTOCOLS,
        strip=True,
    )
    # Run after bleach: bleach serializes U+00A0 to the &nbsp; entity, so the
    # entity form is what we need to strip from its output.
    return _normalize_nbsp(cleaned)


def sanitize_blog_fields(doc):
    """Sanitize the HTML body fields of a blog doc/updates dict in place."""
    if not isinstance(doc, dict):
        return doc
    for field in HTML_FIELDS:
        value = doc.get(field)
        if isinstance(value, str) and value:
            doc[field] = sanitize_html(value)
    return doc
