FROM kong:alpine

LABEL description="Alpine + Kong Latest Alpine + kong-oidc plugin"

USER root
RUN apk update && apk add --upgrade git unzip luarocks curl jq bash
RUN luarocks install --pin lua-resty-jwt 0.2.2-0
RUN luarocks install kong-oidc

# Utility binary that uses the WAIT_HOSTS env variable during runtime to wait until the target
# host is up, and the completes
ADD https://raw.githubusercontent.com/eficode/wait-for/v2.1.0/wait-for /bin/wait-for
RUN chmod +x+r /bin/wait-for

USER kong

WORKDIR /usr/src/

COPY --chown=kong ./microservices/kong-gateway/ .

EXPOSE 8000

ENTRYPOINT ["/usr/src/runBootstrapAndSetup.sh"]