import React from 'react'
import MDEditor from '@uiw/react-md-editor'
import Config from 'Config'
import rehypeSanitize from "rehype-sanitize";
import { defaultSchema } from 'hast-util-sanitize';
import rehypeExternalLinks from 'rehype-external-links'

const mySchema = {
  ...defaultSchema,
  tagNames: [
    ...defaultSchema.tagNames,
    'iframe', 'figure', 'colgroup', 'col', 'svg', 'path'
  ],
  attributes: {
    ...defaultSchema.attributes,
    '*': [
      ...(defaultSchema.attributes['*'] || []),
      'className',
      'style',
      'title',
      'alt',
      'class',
      'rules',
    ],
    a: ['href', 'name', 'target'],
    img: ['src', 'alt', 'title'],
    iframe: [
      'src',
      'width',
      'height',
      'frameborder',
      'allow',
      'allowfullscreen',
      'title',
      'referrerpolicy'
    ],
    td: [
      ...(defaultSchema.attributes.td || []),
      'rowspan', // 允許 rowspan 屬性
      'colspan', // 如果你也需要 colspan 屬性，可以一起添加
    ],
    path: [
      ...(defaultSchema.attributes.path || []),
      'fill-rule',
      'd',
    ],
    svg: [
      ...(defaultSchema.attributes.svg || []),
      'fill',
      'viewBox'
    ]
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https']
  }
};

const rehypePlugins = [[rehypeSanitize, mySchema], [rehypeExternalLinks, { target: '_blank' }]];

export { rehypePlugins }

export default function MarkdownView(props) {
  const { source, backgroundColor } = props

  return (
    <MDEditor.Markdown
      className='category_md_container markdown-body'
      source={source}
      // linkTarget="_blank"
      style={backgroundColor ? { backgroundColor } : {}}
      rehypePlugins={rehypePlugins}
      rehypeRewrite={(node, index, parent) => {
        if (node.tagName == "img") {
          const title = node.properties.title, alt = node.properties.alt;
          node.properties.title = title || alt || "圖片"
          node.properties.alt = alt || title || "圖片"
          node.properties.src = (node.properties.src?.[0] == '/' ? Config.apiurl : "") + node.properties.src
        }
        if (node.tagName === "a" && parent && /^h(1|2|3|4|5|6)/.test(parent.tagName)) {
          parent.children = parent.children.slice(1)
        }
      }}
    />
  )
}
