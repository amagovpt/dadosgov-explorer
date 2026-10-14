ARG NEXUS_REGISTRY_PULL_URL=nexus.devops.ama.lan:5001
FROM ${NEXUS_REGISTRY_PULL_URL}/node:24.21.0-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ARG NEXTJS_UID=10001
ARG NEXTJS_GID=10001
RUN addgroup --system --gid ${NEXTJS_GID} nodejs && \
    adduser --system --uid ${NEXTJS_UID} --ingroup nodejs nextjs

COPY public ./public
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static

RUN mkdir -p /app/.next/cache/images && \
    chown -R nextjs:nodejs /app/.next

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
