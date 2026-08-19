---
name: development-review-log
description: Review current repository changes for correctness and record findings in a date-based, feature-oriented development log. Use when the user asks to review code changes and document the review, or to continue logging iterative development of an existing feature.
metadata:
  short-description: Review changes and maintain iterative feature logs
---

# 开发评审日志

用于在不改动业务代码的前提下，评审当前工作区改动，并将结果记录到项目的开发日志中。适用于“看看这次改动如何”“评审并记录”“继续记录某功能开发”等请求。

## 约束

- 默认只读和修改开发日志文件；除非用户明确要求修复，否则不要修改业务代码、配置或生成文件。
- 先查看仓库的 `AGENTS.md`、开发日志 `README.md` 和当前工作区状态，再开始评审。
- 评审结果按严重程度排序：`P0` 数据丢失、崩溃或安全问题；`P1` 重要功能错误；`P2` 一般正确性、架构或测试问题；`P3` 风格和可维护性问题。
- 结论应以问题为先，随后给出设计优点、验证结果和后续事项。不要用无证据的肯定替代分析。
- 开发日志只引用文件名和必要的行为描述，不记录绝对路径、行号或容易随改动失效的定位信息。

## 评审流程

1. 读取 `git status --short` 和 `git diff`，确认改动范围；忽略与当前请求无关的用户改动，不回滚任何文件。
2. 阅读受影响文件及其直接调用方，检查数据流、状态生命周期、事件边界、错误处理、类型契约和测试覆盖。
3. 按 P0 到 P3 输出可验证的问题。每条问题说明：现象、触发条件、根因、影响和建议方向；引用文件名，不写行号。
4. 运行与改动相关的轻量验证命令。若已有基线错误或用户指定暂不处理，准确记录为“已知问题/暂不处理”，不要把它误报为本次改动引入。

## 日志规则

开发日志采用“一个功能一个主文件、同一功能按日期追加阶段”的结构。

- 先读取 `docs/development-log/README.md` 的索引和模板。
- 若当前功能已有主日志，追加到该文件的“阶段记录”末尾；不要按每次优化新建日期文件。
- 若没有对应主题，才按模板创建新的 `YYYY-MM-DD-主题.md`，并在 README 索引中登记。
- 更新主日志的“最近进展”和 README 索引日期；状态表示该功能整体状态，而不是单次改动是否完成。
- 阶段记录建议包含：目标、已完成、设计与取舍、验证、已知问题。
- 多次开发应保留历史阶段，不覆盖旧记录；后续事项分为跨阶段待办和本阶段已知问题。
- 日志中明确“本轮只记录问题，不修改业务代码”时，必须保持该边界。

## 输出

完成后说明：评审结论已记录到哪些日志文件、是否更新索引、是否修改业务代码，以及执行过的验证和结果。若发现阻塞项，直接指出，不要将日志写成“已完成”。
