// import { MarkdownPreviewProps } from "@uiw/react-markdown-preview";
import { default as MarkdownPreviewPrimitive } from "@uiw/react-markdown-preview";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import remarkMath from "remark-math";
import React, { useState, useEffect } from "react";
import rehypeSanitize from "rehype-sanitize";
import { defaultSchema } from 'hast-util-sanitize';
import Config from 'Config'

const mySchema = {
  ...defaultSchema,
  tagNames: [
    ...defaultSchema.tagNames,
    'iframe', 'figure', 'colgroup', 'col', 'svg', 'path', 'mjx-container', 'mjx-math', 'mjx-mi'
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
      'data-code',
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
      'aria-hidden',
      'viewBox'
    ],
    'mjx-container': [
      'jax', "tabindex", "ctxtmenu_counter", "style"
    ]
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https']
  }
};

const _rehypePlugins = [[rehypeSanitize, mySchema]];

export default function MarkdownPreview(props) {
  const {
    rehypePlugins,
    remarkPlugins,
    source,
    components,
    ...otherMDProps
  } = props

  const [init, setInit] = useState(false)
  const [custom_interval, setCustomInterval] = useState(null)

  useEffect(() => {
    if (!!window.MathJax) {
      setInit(true)
    } else {
      setInit(false)
    }
  }, [window.MathJax])

  const checkMathApi = () => {
    if (!!window.MathJax) {
      setInit(true)
    }
  }

  useEffect(() => {
    let interval
    if (init == false && custom_interval == null) {
      setCustomInterval(setInterval(() => {
        checkMathApi();
      }, 1000))
    }
    if (init == true && !!custom_interval) {
      clearInterval(custom_interval);
    }
  }, [init]);

  if (!init || !window.MathJax) {
    return <>MathJax api loading...</>
  }

  return (
    <MarkdownPreviewPrimitive
      remarkPlugins={[remarkMath]}
      rehypePlugins={[...(rehypePlugins || []), ..._rehypePlugins]}
      source={source}
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
      components={{
        code({ className, children, ...rest }) {
          if (className && className?.startsWith("language-math")) {
            return (!!init ?
              <MathJax math={`${children}`} inline={className?.includes("math-inline")}>{`\\(${children || ""}\\)`}</MathJax> :
              <code className={className} {...rest}>
                {children}
              </code>);
          }
          return (
            <code className={className} {...rest}>
              {children}
            </code>
          );
        },
        ul({ children }) {
          return (
            <ul
              className="list-disc list-inside pl-2 mt-2"
              style={{ paddingLeft: "0.5rem", marginTop: "0.5rem" }}
            >
              {children}
            </ul>
          );
        },
        ol({ children }) {
          return (
            <ol
              className="list-decimal list-inside"
              style={{ paddingLeft: "0.5rem", marginTop: "0.5rem" }}
            >
              {children}
            </ol>
          )
        },
        ...components,
      }}
      {...otherMDProps}
    />
  )
}
