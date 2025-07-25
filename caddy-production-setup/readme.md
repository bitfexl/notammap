# Caddy production setup

A simple reverse proxy to the running NOTAM map app on port 8080 with https.

Install

```shell
dnf install caddy -y
systemctl enable --now caddy
```

*/etc/caddy/Caddyfile*

```
:80 {
    redir https://www.notammap.org{uri}
}

notammap.org {
    redir https://www.notammap.org{uri}
}

www.notammap.org {
    reverse_proxy http://localhost:8080
}
```

Reload

```shell
systemctl reload caddy
```