# Introduction

Inkdown Book is a Markdown document reading and sharing tool that differs from many current Markdown document site generators. The goal of Inkdown is to make sharing Markdown documents simpler and faster, rather than generating static document sites. Just deploy a set of service programs to share any folder containing Markdown documents to the network.

Since there is no need to install the Node.js runtime environment on the client side, Inkdown is relatively easy to use and does not require any programming knowledge. It is also easier for non front-end developers to use.

> Inkdown Book uses the `GitHub Flavored Markdown`, which is also compatible with the vast majority of editors.
> 
> This document was also generated by `InkdownBook`.

## Contrast

Compare with mainstream Markdown document generation tools to quickly understand their differences. The mainstream document generation tools include [Vitepress](https://vitepress.dev/), [Docusaurus](https://docusaurus.io/) and others.

| Document site generation tool                                                                                      | Inkdown Book                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| We need to build tools and install the Node.js environment. Each change requires redeployment to the server.       | Synchronize content through tools such as VSCode extension, InkdownEditor, Cli, etc., without the need to build and deploy on the server.                                                           |
| Each document website requires a domain name and is typically used as an independent product introduction website. | A domain name can access the contents of any folder. As a lightweight Markdown sharing tool, it can share any folder content at any time, such as the introduction document of the code repository. |
| Can generate static sites and homepage.                                                                            | The server dynamically renders, so a Nodejs program needs to be deployed once, and currently does not support generating the homepage.                                                              |
| Having more custom syntax, precompilation can have the ability to introduce React, Vue, and mdx components.        | There is no precompiled build process, currently only standard Markdown syntax is supported.                                                                                                        |

Summary: If you want to use more custom Markdown syntax or custom components, and want to be the main documentation site for your product, mainstream document generation tools are a better choice. If you want to share Markdown documents with your team or others more easily and quickly, and don't want to use build deployment every time you update, Inkdown Book is a better choice.