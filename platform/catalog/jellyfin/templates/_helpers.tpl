{{- define "jellyfin.fullname" -}}jellyfin{{- end -}}
{{- define "jellyfin.host" -}}
{{- printf "%s.%s.%s" .Values.username .Values.appName .Values.baseDomain -}}
{{- end -}}
