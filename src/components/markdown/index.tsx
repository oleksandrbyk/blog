import { MDXRenderer } from 'gatsby-plugin-mdx';
import React from 'react';

import styles from './styles.module.css';

interface IMarkdownProps {
  body: string;
}

function Markdown({ body }: IMarkdownProps) {
  return (
    <div className={styles.wrapper}>
      <MDXRenderer>{body}</MDXRenderer>
    </div>
  );
}

export default Markdown;
