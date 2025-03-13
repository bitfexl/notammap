FROM nginx:latest
COPY nginx.conf /etc/nginx/nginx.conf
COPY html /html
CMD cat /etc/nginx/nginx.conf | envsubst "\$OPENAIP_API_KEY" > /etc/nginx/nginx.conf && nginx -g "daemon off;"