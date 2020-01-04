import React from 'react';

interface IExternalLinkProps {
  href?: string;
  title?: string;
  description?: string;
  picture?: string;
}

export const ExternalLink = ({
  href,
  title,
  description,
  picture
}: IExternalLinkProps) => {
  return (
    <a href={href} className="external-link-preview">
      <section className="elp-content-holder">
        <div className="elp-description-holder">
          <h4 className="elp-title">{title}</h4>
          <div className="elp-description">{description}</div>
          <div className="elp-link">deploymachinelearning.com</div>
        </div>
        <div className="elp-image-holder">
          <img src={picture} style={{ maxWidth: 700 }} />
        </div>
      </section>
    </a>
  );
};
