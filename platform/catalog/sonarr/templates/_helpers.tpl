{{- define "sonarr.fullname" -}}sonarr{{- end -}}
{{- define "sonarr.host" -}}
{{- printf "%s.%s.%s" .Values.username .Values.appName .Values.baseDomain -}}
{{- end -}}
