{{- define "notifiarr.fullname" -}}notifiarr{{- end -}}
{{- define "notifiarr.host" -}}
{{- printf "%s.%s.%s" .Values.username .Values.appName .Values.baseDomain -}}
{{- end -}}
