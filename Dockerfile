FROM ghcr.io/danny-avila/librechat-dev:latest

USER 0

COPY rtl.css /app/client/dist/rtl.css
COPY rtl.js /app/client/dist/rtl.js

RUN sed -i 's|</head>|<link rel="stylesheet" href="/rtl.css"><script src="/rtl.js" defer></script></head>|' /app/client/dist/index.html \
    && chown node:node /app/client/dist/rtl.css \
    && chown node:node /app/client/dist/rtl.js \
    && chown node:node /app/client/dist/index.html

USER node
