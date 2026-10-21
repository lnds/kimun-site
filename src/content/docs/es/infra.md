---
title: "km infra smells"
description: "Olores de seguridad del código de infraestructura"
---

El código de infraestructura tiene sus propios defectos, y los de seguridad están bien catalogados: secretos escritos en el código, servicios abiertos a todo internet, contenedores que corren como root (Rahman et al., *The Seven Sins: Security Smells in Infrastructure as Code Scripts*, ICSE 2019). `km infra smells` lee los archivos de tipo `infra` (Terraform, Dockerfiles, pipelines de CI, archivos de Compose, manifiestos de Kubernetes, playbooks de Ansible), diga lo que diga `--kind`, y los lista.

```bash
km infra smells [ruta]
km infra smells --since-ref origin/main --fail-on hard-coded-secret,empty-password   # en CI
km infra smells --format github                                                      # anotaciones en el pull request
```

| Olor | Qué encuentra |
|------|---------------|
| `hard-coded-secret` | un literal asignado a una clave con nombre de secreto (`password`, `db_password`, `clientSecret`, `api_key`, `AWS_SECRET_ACCESS_KEY`), o un valor con la forma de una clave conocida: AWS, GitHub, GitLab, Slack, Stripe, Google, claves privadas. Las variables, interpolaciones y referencias (`var.x`, `${{ secrets.X }}`, `{{ vault_x }}`, `!Ref`) no son literales |
| `empty-password` | una contraseña igual a `""` |
| `admin-by-default` | `user: root`, `runAsUser: 0`, `privileged: true`, `runAsNonRoot: false`, `USER root` como último usuario de un Dockerfile |
| `unrestricted-address` | `0.0.0.0/0` o `::/0` |
| `ci-permissions` | `permissions: write-all`; un workflow de `pull_request_target` que lee el head del pull request y corre su código con los secretos de la base |
| `http-without-tls` | una URL `http://` a un host fuera de la máquina, la red local, `.svc` y los dominios de ejemplo |
| `weak-cryptography` | `md5` o `sha1` en el código |
| `unpinned` | una imagen sin tag o en `latest`, una action no fijada a un commit completo |
| `suspicious-comment` | un comentario con `TODO`, `FIXME`, `HACK`, `XXX`, `bug`, `workaround` o `insecure` |

```
Infrastructure smells — security smells of infrastructure code
────────────────────────────────────────────────────────────────────────────────────
 File                        Line  Smell              Detail
────────────────────────────────────────────────────────────────────────────────────
 terraform/aws/ec2.tf        15    Hard-coded secret  an AWS access key in the code
 terraform/aws/lambda.tf     45    Hard-coded secret  `access_key` holds a literal
 terraform/aws/lambda.tf     46    Hard-coded secret  `secret_key` holds a literal
 terraform/aws/providers.tf  10    Hard-coded secret  `access_key` holds a literal
────────────────────────────────────────────────────────────────────────────────────

 29 smells in 12 of 51 files: hard-coded secret 14, unrestricted address 8, unpinned 7
```

La lectura es léxica, línea a línea: los comentarios se distinguen según el formato (`#`, `//` y `/* */` en HCL, con los heredocs como texto; líneas completas en un Dockerfile; `#` fuera de comillas en YAML), y todos los olores salvo el último se buscan solo en el código. Los más graves van primero. Los valores de los secretos nunca se imprimen, en ningún formato. El JSON tiene la forma del de [`km smells`](/docs/smells): una entrada por archivo con sus `smells` (`kind`, `line`, `detail`).

| Flag | Descripción |
|------|-------------|
| `--since-ref REF` | Solo los archivos cambiados desde REF, incluidos los cambios sin commitear |
| `--fail-on OLOR,...` | Termina con código 1 cuando encuentra alguno de estos olores |
| `--top N` | Filas de la tabla (por defecto: 20); el JSON lista todos los archivos salvo que se indique |
| `--format {table,json,short,terse,github,codeclimate}` | Formato de salida (por defecto: table). `terse` imprime el número de olores; `github` anota las líneas como warnings (los cinco primeros olores) o notices |
