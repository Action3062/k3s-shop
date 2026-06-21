{{- define "uptime-kuma.fullname" -}}uptime-kuma{{- end -}}
{{- define "uptime-kuma.host" -}}
{{- printf "%s.%s.%s" .Values.username .Values.appName .Values.baseDomain -}}
{{- end -}}
