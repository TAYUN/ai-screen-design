import type { MaterialModule } from '@/materials'
import type { MaterialDefinition } from '@/schema/material'

const chartMaterials: MaterialDefinition[] = [
  {
    name: '柱状图',
    group: 'charts',
    icon: 'ri:bar-chart-box-line',
    setters: [],
    schema: {
      type: 'bar-chart',
      name: '柱状图',
      layout: {
        x: 0,
        y: 0,
        width: 420,
        height: 280,
      },
      style: {},
      props: {
        option: {
          backgroundColor: 'transparent',
          textStyle: {
            color: '#CBD5E1',
          },
          grid: {
            top: 56,
            right: 24,
            bottom: 32,
            left: 48,
          },
          legend: {
            top: 16,
            right: 16,
            textStyle: {
              color: '#CBD5E1',
            },
          },
          xAxis: {
            type: 'category',
            data: ['一月', '二月', '三月', '四月'],
            axisLine: {
              lineStyle: {
                color: '#475569',
              },
            },
            axisLabel: {
              color: '#94A3B8',
            },
          },
          yAxis: {
            type: 'value',
            axisLine: {
              show: false,
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(148, 163, 184, 0.16)',
              },
            },
            axisLabel: {
              color: '#94A3B8',
            },
          },
          series: [
            {
              name: '今年',
              type: 'bar',
              data: [120, 160, 180, 210],
              itemStyle: {
                color: '#38BDF8',
                borderRadius: [6, 6, 0, 0],
              },
            },
            {
              name: '去年',
              type: 'bar',
              data: [90, 130, 150, 170],
              itemStyle: {
                color: '#22C55E',
                borderRadius: [6, 6, 0, 0],
              },
            },
          ],
        },
      },
    },
  },
  {
    name: '折线图',
    group: 'charts',
    icon: 'ri:line-chart-line',
    setters: [],
    schema: {
      type: 'line-chart',
      name: '折线图',
      layout: {
        x: 0,
        y: 0,
        width: 420,
        height: 280,
      },
      style: {},
      props: {
        option: {
          backgroundColor: 'transparent',
          textStyle: {
            color: '#CBD5E1',
          },
          grid: {
            top: 56,
            right: 24,
            bottom: 32,
            left: 48,
          },
          tooltip: {
            trigger: 'axis',
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            axisLine: {
              lineStyle: {
                color: '#475569',
              },
            },
            axisLabel: {
              color: '#94A3B8',
            },
          },
          yAxis: {
            type: 'value',
            axisLine: {
              show: false,
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(148, 163, 184, 0.16)',
              },
            },
            axisLabel: {
              color: '#94A3B8',
            },
          },
          series: [
            {
              name: '访问量',
              type: 'line',
              smooth: true,
              data: [820, 932, 901, 934, 1290, 1330, 1520],
              lineStyle: {
                color: '#60A5FA',
                width: 3,
              },
              itemStyle: {
                color: '#60A5FA',
              },
              areaStyle: {
                color: 'rgba(96, 165, 250, 0.16)',
              },
            },
          ],
        },
      },
    },
  },
]

// 图表分类一次注册多个物料，便于按目录拆分维护。
export const install: MaterialModule['install'] = (register) => {
  chartMaterials.forEach((material) => {
    register(material)
  })
}
