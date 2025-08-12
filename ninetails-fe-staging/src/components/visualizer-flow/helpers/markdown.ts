/* eslint-disable */
import MarkdownIt from 'markdown-it';
import emoji from 'markdown-it-emoji';
import twemoji from 'twemoji';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

md.use(emoji as any);

md.renderer.rules.emoji = (token: any, idx: any) => {
  return twemoji.parse(token[idx].content, {
    base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
  });
};

export const markdown = (text: string) => {
  return md.renderInline(text);
};
