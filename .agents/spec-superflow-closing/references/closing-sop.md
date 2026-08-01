# Closing SOP Reference

这个 skill 的真实收口约束以仓库文档为准：

- Canonical SOP: [`docs/workflow/spec-superflow-closing-sop.md`](../../../../docs/workflow/spec-superflow-closing-sop.md)
- Canonical script: [`scripts/close-change.mjs`](../scripts/close-change.mjs)

## 使用方式

当 change 准备执行最终 `executing -> closing` transition 时：

1. 先确认 change 的持久化状态仍然是 `executing`。
2. 先确认验证已经完成。
3. Full / legacy Hotfix 需要确认 `tasks.md` 中不再保留 `- [ ]`。
4. 确认 `.spec-superflow.yaml` 中 closing 所需的关键字段已经写入。
4. 通过 skill 自带脚本统一收口：

```powershell
node ".agents\spec-superflow-closing\scripts\close-change.mjs" "changes\<change-name>"
```

Quick / direct Hotfix / Tweak 只要求边界内验证结果与 `test_result: pass`，不要求 `dp_4_result`、`dp_6_result`、`dp_7_result` 或 `audit`。

## 为什么收口脚本直接放在 skill 里

- references 用来让 agent 在触发 skill 后快速看到 closing 规则，而不用自己在仓库里二次搜索。
- scripts 用来给 skill 一个稳定调用入口，符合 Codex skills 官方推荐的目录组织。
- 真正的 closing 入口只保留这一份，避免仓库脚本和 skill 脚本长期漂移。
