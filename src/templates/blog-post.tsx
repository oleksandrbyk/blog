import { FixedObject, FluidObject } from 'gatsby-image';

import { graphql } from 'gatsby';
import React from 'react';

import Layout from '../components/layout';
import Post from '../components/post';
import SEO from '../components/seo';

export interface IBlogPostFrontmatter {
  title: string;
  date: string;
  description: string;
  descriptionLong?: string;
  commentsUrl?: string;
  tags?: string[];
  picture?: {
    childImageSharp: {
      fluid: FluidObject;
    };
  };
  pictureComment?: string;
  author: {
    childMarkdownRemark: {
      frontmatter: {
        name: string;
        avatar: {
          childImageSharp: {
            fixed: FixedObject;
          };
        };
      };
    };
  };
}

export interface IBlogPostData {
  id: string;
  body: string;
  timeToRead: string;
  fields: {
    slug: string;
  };
  frontmatter: IBlogPostFrontmatter;
}

interface IBlogPostTemplateProps {
  data: {
    mdx: IBlogPostData;
  };
  pageContext: {
    next: IBlogPostData;
    previous: IBlogPostData;
  };
}

function BlogPostTemplate({ data: { mdx } }: IBlogPostTemplateProps) {
  return (
    <Layout>
      <SEO
        title={mdx.frontmatter.title}
        description={mdx.frontmatter.description}
        image={
          mdx.frontmatter.picture &&
          mdx.frontmatter.picture.childImageSharp.fluid.src
        }
      />
      <Post {...mdx} />
    </Layout>
  );
}

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    mdx(fields: { slug: { eq: $slug } }) {
      id
      body
      timeToRead
      fields {
        slug
      }
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
        descriptionLong
        tags
        commentsUrl
        author {
          childMarkdownRemark {
            frontmatter {
              name
              avatar {
                childImageSharp {
                  fixed(width: 30, height: 30) {
                    ...GatsbyImageSharpFixed_withWebp
                  }
                }
              }
            }
          }
        }
        picture {
          childImageSharp {
            fluid(maxWidth: 1000, maxHeight: 750, cropFocus: CENTER) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
        pictureComment
      }
    }
  }
`;
