FROM alpine:3.20
ARG KUBECTL_VERSION=v1.30.2
ARG TTYD_VERSION=1.7.7
RUN apk add --no-cache bash ca-certificates curl libstdc++ \
 && curl -fsSL -o /usr/local/bin/kubectl "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl" \
 && chmod +x /usr/local/bin/kubectl \
 && curl -fsSL -o /usr/local/bin/ttyd "https://github.com/tsl0922/ttyd/releases/download/${TTYD_VERSION}/ttyd.x86_64" \
 && chmod +x /usr/local/bin/ttyd
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENV TARGET_DEPLOY=openclaw TARGET_CONTAINER=openclaw BASE_PATH=/cli
USER 1000
EXPOSE 7681
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
