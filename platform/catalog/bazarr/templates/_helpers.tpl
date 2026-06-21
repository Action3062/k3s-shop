{{- define "bazarr.fullname" -}}bazarr{{- end -}}
{{- define "bazarr.host" -}}
{{- printf "%s.%s.%s" .Values.username .Values.appName .Values.baseDomain -}}
{{- end -}}
