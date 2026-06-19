{{- define "seerr.fullname" -}}seerr{{- end -}}
{{- define "seerr.host" -}}
{{- printf "%s.%s.%s" .Values.username .Values.appName .Values.baseDomain -}}
{{- end -}}
