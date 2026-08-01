# spec-superflow Closing SOP

适用场景：change 已实现完成，准备执行最终 `executing -> closing` transition。

## 1. 先确认验证已完成

- 重新运行这条 change 需要的验证命令
- 确认真正通过后，再回填状态

## 2. 同步 `tasks.md`（仅 Full / legacy Hotfix 强制）

- 把已完成任务全部改成 `- [x]`
- `executing -> closing` 前不能保留任何 `- [ ]`

## 3. 同步 `.spec-superflow.yaml`

- `test_result` 必须写成精确的 `pass`
- Full / legacy Hotfix 需要补齐当前阶段缺失的 `dp_*` 记录，至少保证收口需要的审批和验证结果已记录
- Quick / direct Hotfix / Tweak 不要求 `dp_4_result`、`dp_6_result`、`dp_7_result`

## 4. 更新哈希

- 修改过 `proposal.md`、`specs/`、`design.md`、`tasks.md` 后，先执行：

```bash
ssf state rebuild "<change-dir>"
```

否则 `contract-fresh` 会因为 `artifacts_hash` 过期而失败。

- 如果 `ssf audit "<change-dir>"` 已经显示状态是 `closing`，但 `ssf state check "<change-dir>"` 仍提示 `artifacts have changed since last transition`，优先执行一次：

```bash
ssf state rebuild "<change-dir>"
ssf state check "<change-dir>"
```

这通常表示工件或审计文件在最后一次 transition 后又发生了更新，需要把派生状态哈希重新同步，而不代表必须回退整个 change。

## 5. 用仓库内一致路径推进状态

- 优先使用仓库根下可复用的 change 路径，例如 `changes/<change-name>`
- 如果需要绝对路径，也应是当前仓库中该 change 的真实路径，而不是某台机器上的固定盘符路径

```bash
ssf state transition "changes/<change-name>" approved-for-build
ssf state transition "changes/<change-name>" executing
ssf state transition "changes/<change-name>" closing
```

## 6. 优先走统一收口脚本

在仓库根目录下，准备执行最终 closing transition 前，优先直接执行 Node 收口脚本，而不是手工拆着跑：

```bash
node ".agents/spec-superflow-closing/scripts/close-change.mjs" "changes/<change-name>"
```

这个脚本会统一检查：

- 当前 state 是否仍然是 `executing`
- Full / legacy Hotfix 的 `tasks.md` 是否还残留 `- [ ]`
- `.spec-superflow.yaml` 是否满足当前 workflow 所需的 closing 字段
- 有 delta spec 时是否已经完成 spec publication receipt
- `ssf state rebuild`
- `ssf state check`
- Full / legacy Hotfix 才运行 `ssf audit`

只有在脚本执行成功后，才应继续执行最终的 `ssf state transition "changes/<change-name>" closing`。

## 7. 生成审计报告

```bash
ssf audit "changes/<change-name>"
```

归档时把 `decision-point-audit.md`（若当前 workflow 需要）一起纳入 Git。
