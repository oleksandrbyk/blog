import React from 'react';

interface IExternalLinkProps {
  href: string;
  title: string;
  description: string;
  name: string;
  picture?: string;
}

export const ExternalLink = ({
  href,
  title,
  description,
  name,
  picture
}: IExternalLinkProps) => {
  return (
    <a href={href} className="external-link-preview">
      <section className="elp-content-holder">
        <div className="elp-description-holder">
          <h4 className="elp-title">{title}</h4>
          <div className="elp-description">{description}</div>
          <div className="elp-link">{name}</div>
        </div>
        <div className="elp-image-holder">
          <img src={picture} />
        </div>
      </section>
    </a>
  );
};
