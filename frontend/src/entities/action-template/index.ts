import { useAsync } from '@/shared/hooks'
import type { AsyncState } from '@/shared/hooks'

/**
 * 可复用的动作模板：描述「要生成一个什么样的动作」，与具体角色和造型无关。
 *
 * 它不是生成结果。同一个「行走」在横版项目和俯视项目里生成出的帧完全不同，
 * 所以模板本身不持有任何图片；生成出来的帧挂在 Character 的 Action 上。
 * 系统内置模板（行走、待机等）更是从未生成过任何东西。
 *
 * 查询项目可用模板时合并系统内置与项目自定义数据。
 */

interface ActionTemplateBase {
  id: string
  name: string
  /** 生成这个动作用的提示词，模板的实际内容。 */
  prompt: string
  /** 一个动作循环几帧，属于动作定义；不是某次生成实际产出了几帧。 */
  frameCount: number
  /** 生成时写入 Action.fps 的默认帧率；播放和导出一律读 Action.fps，不读这里。 */
  fps: number
}

export type ActionTemplate = ActionTemplateBase &
  ({ scope: 'system'; projectId: null } | { scope: 'project'; projectId: string })

export async function fetchActionTemplates(_projectId: string): Promise<ActionTemplate[]> {
  throw new Error('not implemented：等待后端 GET /projects/{id}/action-templates')
}

/** 订阅系统内置模板与当前项目自定义模板的合集。 */
export function useActionTemplates(projectId: string): AsyncState<ActionTemplate[]> {
  return useAsync(() => fetchActionTemplates(projectId), [projectId])
}
