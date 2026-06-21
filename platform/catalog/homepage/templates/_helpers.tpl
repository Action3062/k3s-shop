{{- define "homepage.fullname" -}}homepage{{- end -}}
{{- define "homepage.host" -}}
{{- printf "%s.%s.%s" .Values.username .Values.appName .Values.baseDomain -}}
{{- end -}}
