type Props = {
  links: string[];
};

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function faviconUrl(url: string) {
  const domain = domainOf(url);
  return `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(domain)}`;
}

export default function ResultLinks({ links }: Props) {
  return (
    <div className="resultSection card">
      <div className="cardInner">
        <div className="resultSectionTitle">Key links</div>

        {links.length === 0 ? (
          <div className="muted">No data</div>
        ) : (
          <div className="linksGrid">
            {links.map((href) => {
              const domain = domainOf(href);
              return (
                <a
                  key={href}
                  className="linkCard"
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img className="favicon" src={faviconUrl(href)} alt="" />
                  <div className="linkMeta">
                    <div className="linkDomain">{domain}</div>
                    <div className="linkHref">{href}</div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

