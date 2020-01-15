const fs = require('fs');
const path = require('path');
const { createFilePath } = require('gatsby-source-filesystem');
const { siteMetadata } = require('./gatsby-config');

exports.createSchemaCustomization = ({ actions, schema }) => {
  const getHTMLForInlineBlock = data =>
    `
      <a href="${data[0]}" class="external-link-preview">
        <section class="elp-content-holder">
          <div class="elp-description-holder">
            <h4 class="elp-title">${data[1]}</h4>
            <div class="elp-description">${data[2]}</div>
            <div class="elp-link">${data[3]}</div>
          </div>
          <div class="elp-image-holder">
            <img src="${data[4]}" />
          </div>
        </section>
      </a>
    `;

  const resolveInlineBlocks = htmlData => {
    const patt = new RegExp(
      [
        /<p>[\s\t\n]*/, // <p>
        /<ExternalLink[\s\t\n]+/, // <ExternalLink
        /href="([^"]*)"[\s\t\n]+/, // href="https://veekaybee.github.io/2019/02/13/data-science-is-different/"
        /title="([^"]*)"[\s\t\n]+/, // title="Data science is different now"
        /description="([^"]*)"[\s\t\n]+/, // description="Woman holding a balance, Vermeer 1664 What do you think of ..."
        /name="([^"]*)"[\s\t\n]+/, // name="veekaybee.github.io"
        /picture="([^"]*)"[\s\t\n]+/, // picture="/uploads/images/2019-03-05/data-science-is-different-now.png"
        /\/>[\s\t\n]*/, // />
        /<\/p>/ // </p>
      ]
        .map(r => r.source)
        .join('')
    );
    let match;
    while ((match = htmlData.match(patt))) {
      const htmlForInlineBlock = getHTMLForInlineBlock(match.slice(1, 6));
      htmlData = htmlData.replace(patt, htmlForInlineBlock);
    }
    return htmlData;
  };

  actions.createFieldExtension({
    name: 'proxyResolveInlineBlock',
    args: {
      from: { type: 'Int!' },
      to: { type: 'Int!' }
    },
    extend: (options, previousFieldConfig) => {
      return {
        resolve: async (source, args, context, info) => {
          await context.nodeModel.prepareNodes(
            info.parentType, // MarkdownRemark
            { html: true }, // querying for html field
            { html: true }, // resolve this field
            [info.parentType.name] // The types to use are these
          );

          const newSource = await context.nodeModel.runQuery({
            type: info.parentType,
            query: { filter: { id: { eq: source.id } } },
            firstOnly: true
          });

          return resolveInlineBlocks(newSource.__gatsby_resolved.html);
        }
      };
    }
  });

  actions.createTypes([
    `
      type MarkdownRemark implements Node @infer {
        body: String! @proxyResolveInlineBlock(from: 0, to: 0)
      }
    `
  ]);
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const blogPost = path.resolve('./src/templates/blog-post.tsx');
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          filter: { fileAbsolutePath: { regex: "/content/blog/" } }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `
  );

  if (result.errors) {
    throw result.errors;
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges;

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node;
    const next = index === 0 ? null : posts[index - 1].node;

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next
      }
    });
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === 'MarkdownRemark') {
    const value = createFilePath({
      node,
      getNode,
      trailingSlash: false
    }).replace(/^\/[0-9\-]*/, '/');
    createNodeField({
      name: 'slug',
      node,
      value
    });
  }
};

// Create json to use on https://dvc.org/community

exports.onPostBuild = async function({ graphql }) {
  const result = await graphql(`
    {
      allMarkdownRemark(
        sort: { fields: [frontmatter___date], order: DESC }
        filter: { fileAbsolutePath: { regex: "/content/blog/" } }
        limit: 3
      ) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              title
              date
              commentsUrl
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    throw new Error(result.errors);
  }

  const posts = result.data.allMarkdownRemark.edges.map(
    ({
      node: {
        fields: { slug },
        frontmatter: { title, date, commentsUrl }
      }
    }) => {
      const url = `${siteMetadata.siteUrl}/${slug}`;

      return {
        url,
        title,
        date,
        commentsUrl
      };
    }
  );

  const dir = path.join(__dirname, '/public/api');
  const filepath = path.join(dir, 'posts.json');

  // Write json file to the public dir,
  // it will be used community page later
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFileSync(filepath, JSON.stringify({ posts }));
};
