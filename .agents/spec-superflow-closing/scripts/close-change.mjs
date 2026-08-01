#!/usr/bin/env node

import { existsSync, readFileSync, realpathSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

function fail(message) {
  console.error(message)
  process.exit(1)
}

function assertFileExists(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} 不存在: ${filePath}`)
  }
}

function readText(filePath) {
  return readFileSync(filePath, 'utf8')
}

function parseSimpleState(stateContent) {
  const values = {}
  for (const line of stateContent.split(/\r?\n/)) {
    const match = line.match(/^([a-zA-Z0-9_]+):\s*(.+)$/)
    if (!match) continue
    values[match[1]] = match[2].trim()
  }
  return values
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..', '..')

function resolveChangeDir(inputPath) {
  const candidate = path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(repoRoot, inputPath)

  try {
    return realpathSync(candidate)
  } catch (error) {
    fail(`change 目录不存在或无法解析: ${inputPath}`)
  }
}

function quoteForPowerShell(value) {
  return `'${value.replace(/'/g, "''")}'`
}

function invokeSsf(args, options = {}) {
  const {
    capture = false,
  } = options
  console.log(`==> ssf ${args.join(' ')}`)

  let result

  if (process.platform === 'win32') {
    // Windows 下显式走 PowerShell，可兼容 pnpm 生成的 ssf.ps1 包装器。
    const commandLine = ['ssf', ...args.map(quoteForPowerShell)].join(' ')
    result = spawnSync(
      'powershell',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', commandLine],
      {
        stdio: capture ? 'pipe' : 'inherit',
        encoding: capture ? 'utf8' : undefined,
      },
    )
  } else {
    result = spawnSync('ssf', args, {
      stdio: capture ? 'pipe' : 'inherit',
      encoding: capture ? 'utf8' : undefined,
    })
  }

  if (result.error) {
    fail(`执行 ssf ${args.join(' ')} 失败: ${result.error.message}`)
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    if (capture && result.stderr) {
      process.stderr.write(result.stderr)
    }
    process.exit(result.status)
  }

  return result
}

function runSsf(args) {
  invokeSsf(args)
}

function runSsfCapture(args) {
  const result = invokeSsf(args, { capture: true })
  return (result.stdout || '').trim()
}

function readWorkflowSelection(changeDir) {
  const workflowSelectionPath = path.join(changeDir, '.superpowers', 'sdd', 'workflow-selection.json')
  if (!existsSync(workflowSelectionPath)) {
    return null
  }

  try {
    return JSON.parse(readText(workflowSelectionPath))
  } catch (error) {
    fail(`workflow-selection.json 无法解析: ${workflowSelectionPath}`)
  }
}

function isVerificationStrategy(value) {
  return ['tdd', 'new-test', 'bounded'].includes(value)
}

function isDirectWorkflowReceipt(workflowSelection, workflow) {
  const selection = workflowSelection?.selection
  const recommendation = workflowSelection?.recommendation
  const facts = workflowSelection?.facts
  const mode = selection?.mode

  if (!['quick', 'hotfix'].includes(mode) || workflow !== mode) return false

  const directAcceptance = recommendation?.mode === mode
    && selection?.accepted_automatically === true
    && selection?.source === 'direct-request'

  const acknowledgedQuick = mode === 'quick'
    && selection?.accepted_automatically === false
    && selection?.risk_override === true
    && isVerificationStrategy(selection?.verification_strategy)

  if (!directAcceptance && !acknowledgedQuick) return false
  return mode !== 'hotfix' || facts?.request_kind === 'incident'
}

function classifyClosurePath(workflow, workflowSelection) {
  const directReceipt = isDirectWorkflowReceipt(workflowSelection, workflow)

  if (workflow === 'full') {
    return { kind: 'full', label: 'Full' }
  }

  if (workflow === 'tweak') {
    return { kind: 'short-path', label: 'Tweak' }
  }

  if (workflow === 'quick') {
    if (!directReceipt) {
      fail('当前 workflow=quick，但缺少有效 direct receipt。请先通过 workflow-start / workflow accept 或 workflow select 纠正路径。')
    }
    return { kind: 'short-path', label: 'Quick' }
  }

  if (workflow === 'hotfix') {
    if (directReceipt) {
      return { kind: 'short-path', label: 'Direct Hotfix' }
    }
    return { kind: 'full', label: 'Legacy Hotfix' }
  }

  fail(`不支持的 closing workflow: ${workflow}`)
}

function collectCanonicalSpecFiles(specsDir) {
  if (!existsSync(specsDir)) return []

  const files = []
  for (const entry of readdirSync(specsDir)) {
    const fullPath = path.join(specsDir, entry)
    let stats
    try {
      stats = statSync(fullPath)
    } catch {
      continue
    }
    if (!stats.isDirectory()) continue

    const specPath = path.join(fullPath, 'spec.md')
    if (existsSync(specPath)) {
      files.push(specPath)
    }
  }
  return files
}

function hasDeltaSpecSections(changeDir) {
  const specFiles = collectCanonicalSpecFiles(path.join(changeDir, 'specs'))
  const deltaHeaderPattern = /^##\s+(ADDED|MODIFIED|REMOVED|RENAMED)\s+Requirements\s*$/m
  return specFiles.some((specPath) => deltaHeaderPattern.test(readText(specPath)))
}

function assertExecutingState(changeDir) {
  const currentState = runSsfCapture(['state', 'get', changeDir, 'state'])
  if (currentState === 'closing') {
    fail('当前 change 已经处于 closing。按 spec-superflow 0.12.1 规则，closing 是终态，不应再重跑 closing wrapper。')
  }
  if (currentState !== 'executing') {
    fail(`当前 state=${currentState || 'unknown'}。按 spec-superflow 0.12.1 规则，closing 校验只能在 executing 阶段执行；请先回到 workflow-start 判断下一步。`)
  }
}

function assertTasksAligned(tasksPath, strict = true) {
  if (!existsSync(tasksPath)) {
    if (strict) {
      fail(`tasks.md 不存在: ${tasksPath}`)
    }
    return
  }

  const tasksContent = readText(tasksPath)
  if (/^\- \[ \] /m.test(tasksContent)) {
    fail('tasks.md 中仍存在未完成项。请先全部改成 - [x]，再执行 closing 收口。')
  }
}

function assertPattern(content, pattern, label) {
  if (!pattern.test(content)) {
    fail(`.spec-superflow.yaml 缺少或不满足 closing 必需字段: ${label}`)
  }
}

function assertFullClosingState(stateContent, changeDir, stateValues) {
  assertPattern(stateContent, /^test_result:\s+pass\s*$/m, 'test_result=pass')
  assertPattern(stateContent, /^dp_4_result:\s+(?!null\s*$).+/m, 'dp_4_result')
  assertPattern(stateContent, /^dp_6_result:\s+pass:.*$/m, 'dp_6_result 需要以 pass: 开头')
  assertPattern(stateContent, /^dp_7_result:\s+confirmed:.*$/m, 'dp_7_result 需要以 confirmed: 开头')

  if (hasDeltaSpecSections(changeDir) && stateValues.spec_publication_receipt === 'null') {
    fail('检测到 delta spec，但 spec_publication_receipt 为空。请先在 executing 阶段完成 ssf sync，再进行 closing 收口。')
  }
}

function assertShortPathState(stateContent, tasksPath) {
  assertPattern(stateContent, /^test_result:\s+pass\s*$/m, 'test_result=pass')
  assertTasksAligned(tasksPath, false)
}

function printClosureSummary(closurePath) {
  console.log(`==> 识别到 closing 路径: ${closurePath.label}`)
}

const changeDir = process.argv[2]

if (!changeDir) {
  fail('用法: node .agents\\spec-superflow-closing\\scripts\\close-change.mjs <change-dir>\n示例: node ".agents\\spec-superflow-closing\\scripts\\close-change.mjs" "changes\\my-change"')
}

const resolvedChangeDir = resolveChangeDir(changeDir)
const tasksPath = path.join(resolvedChangeDir, 'tasks.md')
const statePath = path.join(resolvedChangeDir, '.spec-superflow.yaml')

assertFileExists(statePath, '.spec-superflow.yaml')
assertExecutingState(resolvedChangeDir)

const stateContent = readText(statePath)
const stateValues = parseSimpleState(stateContent)
const workflowSelection = readWorkflowSelection(resolvedChangeDir)
const closurePath = classifyClosurePath(stateValues.workflow, workflowSelection)

printClosureSummary(closurePath)

if (closurePath.kind === 'full') {
  assertTasksAligned(tasksPath, true)
  assertFullClosingState(stateContent, resolvedChangeDir, stateValues)
} else {
  assertShortPathState(stateContent, tasksPath)
}

runSsf(['state', 'rebuild', resolvedChangeDir])
runSsf(['state', 'check', resolvedChangeDir])

if (closurePath.kind === 'full') {
  runSsf(['audit', resolvedChangeDir])
  console.log('Closing SOP 已完成：Full/legacy Hotfix 的 tasks/state/audit 已同步，可继续执行最终 closing transition。')
} else {
  console.log('Closing SOP 已完成：short-path change 的 state 校验已同步。Quick/direct Hotfix/Tweak 无需额外 audit。')
}
