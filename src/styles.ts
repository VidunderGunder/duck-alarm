import { css } from "@emotion/react";

export const appCSS = css`
  html,
  body,
  #root {
    height: 100%;
    background-color: #22222b;
    overflow: hidden;
  }
  html,
  body,
  div,
  span {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }
  html,
  * {
    color: #e8eaed;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
        Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    outline: none;
  }
`