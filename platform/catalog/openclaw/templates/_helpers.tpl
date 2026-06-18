{{- define "openclaw.fullname" -}}openclaw{{- end -}}
{{- define "openclaw.host" -}}
{{- printf "%s.%s.%s" .Values.username .Values.appName .Values.baseDomain -}}
{{- end -}}
