import React from 'react';
import rehypeReact from 'rehype-react';
import { ExternalLink } from '../components/external-link';

export const renderAst = new rehypeReact({
  createElement: React.createElement,
  components: { 'external-link': ExternalLink }
}).Compiler;
