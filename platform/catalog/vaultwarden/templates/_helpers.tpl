{{- define "vaultwarden.fullname" -}}vaultwarden{{- end -}}
{{- define "vaultwarden.host" -}}
{{- printf "%s.%s.%s" .Values.username .Values.appName .Values.baseDomain -}}
{{- end -}}
