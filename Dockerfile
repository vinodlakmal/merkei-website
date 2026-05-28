# ─── Build Stage ──────────────────────────────────────────────────────────────
# Static site වල build step නැහැ, but future-proof සඳහා stage pattern follow කරනවා
FROM nginx:alpine AS final

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/merkei.conf

# Copy static site files
COPY . /usr/share/nginx/html/

# Remove non-web files from the container
RUN rm -f /usr/share/nginx/html/Dockerfile \
          /usr/share/nginx/html/docker-compose.yml \
          /usr/share/nginx/html/nginx.conf \
          /usr/share/nginx/html/.dockerignore \
          /usr/share/nginx/html/audit-report.md \
          /usr/share/nginx/html/index_backup.html && \
    rm -rf /usr/share/nginx/html/.git \
           /usr/share/nginx/html/.github

# Non-root user for security
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/robots.txt || exit 1

CMD ["nginx", "-g", "daemon off;"]
