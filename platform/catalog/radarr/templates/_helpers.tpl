{{- define "radarr.fullname" -}}radarr{{- end -}}
{{- define "radarr.host" -}}
{{- printf "%s.%s.%s" .Values.username .Values.appName .Values.baseDomain -}}
{{- end -}}
