FROM nginx:latest
COPY nginx.conf /etc/nginx/nginx.conf.template
COPY html /html
CMD cat /etc/nginx/nginx.conf.template | envsubst "\$OPENAIP_API_KEY" > /etc/nginx/nginx.conf && nginx -g "daemon off;"