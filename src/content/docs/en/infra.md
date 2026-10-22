---
title: "km infra smells"
description: "Security smells of infrastructure code"
---

Infrastructure code has its own defects, and the security ones are well catalogued: secrets written into the code, services left open to the whole internet, containers running as root (Rahman et al., *The Seven Sins: Security Smells in Infrastructure as Code Scripts*, ICSE 2019). `km infra smells` reads the files of kind `infra` (Terraform, Dockerfiles, CI pipelines, Compose files, Kubernetes manifests, Ansible playbooks), whatever `--kind` says, and lists them.

```bash
km infra smells [path]
km infra smells --since-ref origin/main --fail-on hard-coded-secret,empty-password   # in CI
km infra smells --format github                                                      # annotations on the pull request
```

| Smell | Found |
|-------|-------|
| `hard-coded-secret` | a literal assigned to a key named as a secret (`password`, `db_password`, `clientSecret`, `api_key`, `AWS_SECRET_ACCESS_KEY`), or a value shaped like a known key: AWS, GitHub, GitLab, Slack, Stripe, Google, private keys. Variables, interpolations and references (`var.x`, `${{ secrets.X }}`, `{{ vault_x }}`, `!Ref`) are no literal |
| `empty-password` | a password set to `""` |
| `admin-by-default` | `user: root`, `runAsUser: 0`, `privileged: true`, `runAsNonRoot: false`, `USER root` left as the last user of a Dockerfile |
| `unrestricted-address` | `0.0.0.0/0` or `::/0` |
| `ci-permissions` | `permissions: write-all`; a `pull_request_target` workflow that reads the head of the pull request, running its code with the secrets of the base |
| `http-without-tls` | an `http://` URL to a host outside the machine, the local network, `.svc` and example domains |
| `weak-cryptography` | `md5` or `sha1` in the code |
| `unpinned` | an image without a tag or on `latest`, an action not pinned to a full commit SHA |
| `suspicious-comment` | a comment with `TODO`, `FIXME`, `HACK`, `XXX`, `bug`, `workaround` or `insecure` |

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

The reading is lexical, line by line: comments are told apart by format (`#`, `//` and `/* */` in HCL, heredocs as text; whole lines in a Dockerfile; `#` outside quotes in YAML), and every smell but the last is searched in the code alone. The most severe come first. Secret values are never printed, in any format. The JSON has the shape of [`km smells`](/en/docs/smells): one entry per file with its `smells` (`kind`, `line`, `detail`).

| Flag | Description |
|------|-------------|
| `--since-ref REF` | Only files changed since REF, uncommitted changes included |
| `--fail-on SMELL,...` | Exit with code 1 when one of these smells is found |
| `--top N` | Rows of the table (default: 20); JSON lists every file unless given |
| `--format {table,json,short,terse,github,codeclimate}` | Output format (default: table). `terse` prints the number of smells; `github` annotates the lines as warnings (the first five smells) or notices |
